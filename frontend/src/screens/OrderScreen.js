import axios from "axios";
import React, { useContext, useEffect, useReducer } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { Store } from "../Store";
import { getError } from "../utils";
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { toast } from "react-toastify";
import Container from "react-bootstrap/Container";
import moment from "moment";
import Button from "react-bootstrap/Button";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, order: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "PAY_REQUEST":
      return { ...state, loadingPay: true };
    case "PAY_SUCCESS":
      return { ...state, loadingPay: false, successPay: true };
    case "PAY_FAIL":
      return { ...state, loadingPay: false };
    case "PAY_RESET":
      return { ...state, loadingPay: false, successPay: false };
    case "DELIVER_REQUEST":
      return { ...state, loadingDeliver: true };
    case "DELIVER_SUCCESS":
      return { ...state, loadingDeliver: false, successDeliver: true };
    case "DELIVER_FAIL":
      return { ...state, loadingDeliver: false };
    case "DELIVER_RESET":
      return {
        ...state,
        loadingDeliver: false,
        successDeliver: false,
      };
    case "SHIP_REQUEST":
      return { ...state, loadingShipped: true };
    case "SHIP_SUCCESS":
      return { ...state, loadingShipped: false, successShipped: true };
    case "SHIP_FAIL":
      return { ...state, loadingShipped: false };
    case "SHIP_RESET":
      return {
        ...state,
        loadingShipped: false,
        successShipped: false,
      };
    default:
      return state;
  }
}
export default function OrderScreen() {
  const { state } = useContext(Store);
  const { userInfo } = state;

  const params = useParams();
  const { id: orderId } = params;
  const navigate = useNavigate();

  const [
    {
      loading,
      error,
      order,
      successPay,
      loadingPay,
      loadingDeliver,
      loadingShipped,
      successDeliver,
      successShipped,
    },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    order: {},
    error: "",
    successPay: false,
    loadingPay: false,
  });

  const [{ isPending }, paypalDispatch] = usePayPalScriptReducer();

  function createOrder(data, actions) {
    return actions.order
      .create({
        purchase_units: [
          {
            amount: { value: order.totalPrice },
          },
        ],
      })
      .then((orderID) => {
        return orderID;
      });
  }

  function onApprove(data, actions) {
    return actions.order.capture().then(async function (details) {
      try {
        dispatch({ type: "PAY_REQUEST" });
        const { data } = await axios.put(
          `/api/orders/${order._id}/pay`,
          details,

          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );
        dispatch({ type: "PAY_SUCCESS", payload: data });
        toast.success("Yor Order has been received and Payment Confirmed");
      } catch (err) {
        dispatch({ type: "PAY_FAIL", payload: getError(err) });
        toast.error(getError(err));
      }
    });
  }
  function onError(err) {
    toast.error(getError(err));
  }
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };

    if (!userInfo) {
      return navigate("/login");
    }
    if (
      !order._id ||
      successPay ||
      successDeliver ||
      successShipped ||
      (order._id && order._id !== orderId)
    ) {
      fetchOrder();
      if (successPay) {
        dispatch({ type: "PAY_RESET" });
      }
      if (successDeliver) {
        dispatch({ type: "DELIVER_RESET" });
      }
      if (successShipped) {
        dispatch({ type: "SHIP_RESET" });
      }
    } else {
      const loadPaypalScript = async () => {
        const { data: clientId } = await axios.get("/api/keys/paypal", {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        paypalDispatch({
          type: "resetOptions",
          value: {
            "client-id": clientId,
            currency: "USD",
          },
        });
        paypalDispatch({ type: "setLoadingStatus", value: "pending" });
      };
      loadPaypalScript();
    }
  }, [
    order,
    userInfo,
    orderId,
    navigate,
    paypalDispatch,
    successPay,
    successDeliver,
    successShipped,
  ]);

  async function deliverOrderHandler() {
    try {
      dispatch({ type: "DELIVER_REQUEST" });
      const { data } = await axios.put(
        `/api/orders/${order._id}/deliver`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "DELIVER_SUCCESS", payload: data });
      toast.success("Order is delivered");
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: "DELIVER_FAIL" });
    }
  }
  async function shipOrderHandler() {
    try {
      dispatch({ type: "SHIP_REQUEST" });
      const { data } = await axios.put(
        `/api/orders/${order._id}/shipped`,
        {},
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      dispatch({ type: "SHIP_SUCCESS", payload: data });
      toast.success("Order is shipped");
    } catch (err) {
      toast.error(getError(err));
      dispatch({ type: "SHIP_FAIL" });
    }
  }
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  function productLink(item) {
    return `/product/${item.slug}`;
  }
  return (
    <Container className="mt-3">
      {loading ? (
        <LoadingBox></LoadingBox>
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <div>
          <Helmet>
            <title>Order{orderId.replace(/\D/g, "")}</title>
          </Helmet>
          <h1 className="my-3">Order No. {orderId.replace(/\D/g, "")}</h1>
          <Row>
            <Col md={8}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Shipping</Card.Title>
                  <Card.Text>
                    <strong>Name:</strong> {order.shippingAddress.fullName}(
                    {order.username}) <br />
                    <strong>Phone:</strong> {order.shippingAddress.postalCode}{" "}
                    <br />
                    <strong>Email:</strong> {order.useremail} <br />
                    <strong>Address: </strong> {order.shippingAddress.address},
                    {order.shippingAddress.city}. <br />
                    <strong>Ordered On: </strong>{" "}
                    {moment(order.createdAt).format(
                      "dddd, MMMM Do YYYY, h:mm:ss a"
                    )}
                  </Card.Text>
                  {order.isShipped ? (
                    <MessageBox variant="success">
                      Shipped on{" "}
                      {moment(order.shippedAt).format(
                        "dddd, MMMM Do YYYY, h:mm:ss a"
                      )}
                    </MessageBox>
                  ) : (
                    <MessageBox variant="danger">Not Shipped</MessageBox>
                  )}
                  {order.isDelivered ? (
                    <MessageBox variant="success">
                      Delivered at{" "}
                      {moment(order.deliveredAt).format(
                        "dddd, MMMM Do YYYY, h:mm:ss a"
                      )}
                    </MessageBox>
                  ) : (
                    <MessageBox variant="danger">Not Delivered</MessageBox>
                  )}
                </Card.Body>
                <Card.Body></Card.Body>
              </Card>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Payment</Card.Title>
                  <Card.Text>
                    <strong>Method:</strong> {order.paymentMethod}
                  </Card.Text>
                  {order.isPaid || order.isDelivered ? (
                    <MessageBox variant="success">
                      Paid at{" "}
                      {moment(order.paidAt).format(
                        "dddd, MMMM Do YYYY, h:mm:ss a"
                      )}
                    </MessageBox>
                  ) : (
                    <MessageBox variant="danger">Not Paid</MessageBox>
                  )}
                </Card.Body>
              </Card>

              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Items</Card.Title>
                  <ListGroup variant="flush">
                    {order.orderItems.map((item) => (
                      <ListGroup.Item key={item._id}>
                        <Row className="align-items-center">
                          <Col md={6}>
                            <Link to={productLink(item)}>
                              <img
                                src={item.image}
                                alt={item.name}
                                className="img-fluid rounded img-thumbnail"
                              ></img>{" "}
                            </Link>
                            <Link to={productLink(item)}>{item.name}</Link>
                          </Col>
                          <Col md={3}>
                            <span>{item.quantity}</span>
                          </Col>
                          <Col md={3}>Ksh. {numberWithCommas(item.price)}</Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Order Queries</Card.Title>
                  <Card.Text>
                    <p>Have problem(s) with your order?</p>
                    <strong>
                      {" "}
                      <i
                        className="fa fa-phone"
                        style={{ padding: "5px 10px", color: "#f0c040" }}
                      ></i>
                      Call Us:
                    </strong>{" "}
                    0712012113 <br />
                    <strong>
                      <i
                        className="fa fa-envelope"
                        style={{ padding: "5px 10px", color: "#f0c040" }}
                      />{" "}
                      Email Us:
                    </strong>{" "}
                    <Link to="/contacts">email us here</Link>
                    <br />
                    <strong>
                      <a
                        href="//wa.me/+254712012113"
                        target="_blank"
                        rel="noreferrer"
                        arial-label="Whatsapp"
                      >
                        <img
                          src="/images/whatsapp.png"
                          alt="whatsapp"
                          style={{
                            margin: "5px 8px",
                            maxWidth: "25px",
                            maxHeight: "25px",
                          }}
                        />
                      </a>
                      Whatsapp Us:
                    </strong>{" "}
                    <a
                      href="//wa.me/+254712012113"
                      target="_blank"
                      rel="noreferrer"
                      arial-label="Whatsapp"
                    >
                      {" "}
                      +254712012113{" "}
                    </a>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="mb-3">
                <Card.Body>
                  <Card.Title>Order Summary</Card.Title>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <Row>
                        <Col>Items</Col>
                        <Col>
                          Ksh. {numberWithCommas(order.itemsPrice.toFixed(2))}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>Shipping</Col>
                        <Col>
                          Ksh.{" "}
                          {numberWithCommas(order.shippingPrice.toFixed(2))}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>Tax</Col>
                        <Col>
                          {" "}
                          Ksh. {numberWithCommas(order.taxPrice.toFixed(2))}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>
                          <strong> Order Total</strong>
                        </Col>
                        <Col>
                          <strong>
                            {" "}
                            Ksh. {numberWithCommas(order.totalPrice.toFixed(2))}
                          </strong>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                    {order.paymentMethod !== "Delivery" && (
                      <div className="mb-3 mt-3 text-center">
                        <strong>
                          {!order.isPaid &&
                            !userInfo.isAdmin &&
                            "Pay Now To Order"}
                        </strong>
                      </div>
                    )}

                    {!order.isPaid && (
                      <ListGroup.Item>
                        {isPending && !order.paymentMethod === "Delivery" ? (
                          <LoadingBox />
                        ) : (
                          <div>
                            {order.paymentMethod === "PayPal" &&
                              !userInfo.isAdmin && (
                                <PayPalButtons
                                  createOrder={createOrder}
                                  onApprove={onApprove}
                                  onError={onError}
                                ></PayPalButtons>
                              )}
                          </div>
                        )}
                        {loadingPay && <LoadingBox></LoadingBox>}
                      </ListGroup.Item>
                    )}
                    {userInfo.isAdmin && !order.isShipped && (
                      <ListGroup.Item>
                        {loadingShipped && <LoadingBox></LoadingBox>}
                        <div className="d-grid">
                          <Button type="button" onClick={shipOrderHandler}>
                            Ship Order{" "}
                          </Button>
                        </div>
                      </ListGroup.Item>
                    )}
                    {userInfo.isAdmin &&
                      order.isShipped &&
                      !order.isDelivered && (
                        <ListGroup.Item>
                          {loadingDeliver && <LoadingBox></LoadingBox>}
                          <div className="d-grid">
                            <Button type="button" onClick={deliverOrderHandler}>
                              Deliver Order
                            </Button>
                          </div>
                        </ListGroup.Item>
                      )}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      )}
    </Container>
  );
}
