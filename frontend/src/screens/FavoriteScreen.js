import { useContext } from "react";
import { Store } from "../Store";
import { Helmet } from "react-helmet-async";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import MessageBox from "../components/MessageBox";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Popconfirm } from "antd";

export default function FavoriteScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);

  const {
    cart: { favoriteItems },
  } = state;
  const removeItemHandler = (item) => {
    ctxDispatch({ type: "FAVORITE_REMOVE_ITEM", payload: item });
    toast.success("Product removed from Favorites");
  };

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  return (
    <Container className="mt-3">
      <div>
        <Helmet>
          <title>My Favorite</title>
        </Helmet>
        <h1>My Favorites</h1>
        <Col md={9}>
          {favoriteItems.length === 0 ? (
            <MessageBox>
              Your Favorites
              <Link to="/">
                <img src="logo.png" alt="cart logo" width="100" height="100" />
              </Link>
              is empty.
              {"  "}
              <Link to="/"> Go Shopping</Link>
            </MessageBox>
          ) : (
            <ListGroup>
              {favoriteItems.map((item) => (
                <ListGroup.Item key={item._id}>
                  <Row className="align-items-center">
                    <Col md={4}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="img-fluid rounded img-thumbnail"
                      ></img>{" "}
                      <Link to={`/product/${item.slug}`}>{item.name}</Link>
                    </Col>

                    <Col md={3}>Ksh.{numberWithCommas(item.price)}</Col>

                    <Col md={2}>
                      <Popconfirm
                        title="Do you want to remove from Favorites?"
                        okText="Yes"
                        cancelText="No"
                        onConfirm={() => {
                          removeItemHandler(item);
                        }}
                      >
                        <Button variant="light">
                          <i className="fas fa-trash"></i>
                        </Button>{" "}
                      </Popconfirm>
                    </Col>
                    <Col md={2}>
                      <MessageBox variant="primary" style={{ margin: "0px" }}>
                        <Link
                          to={`/product/${item.slug}`}
                          className="linkStyles"
                        >
                          Buy Now{" "}
                        </Link>
                      </MessageBox>
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
      </div>
    </Container>
  );
}
