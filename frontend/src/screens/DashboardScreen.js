import React, { useContext, useEffect, useReducer } from "react";
import Chart from "react-google-charts";
import axios from "axios";
import { Store } from "../Store";
import { getError } from "../utils";
import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import { Link } from "react-router-dom";

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true };
    case "FETCH_SUCCESS":
      return {
        ...state,
        summary: action.payload,
        loading: false,
      };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function DashboardScreen() {
  const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: "",
  });
  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await axios.get("/api/orders/summary", {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({
          type: "FETCH_FAIL",
          payload: getError(err),
        });
      }
    };
    fetchData();
  }, [userInfo]);
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return (
    <Container className="mt-3">
      <div>
        <h1>Dashboard</h1>
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <>
            <Row>
              <ul className="row summary" style={{ listStyle: "none" }}>
                <Col md={4}>
                  <Link to="/admin/users" className="linkStyles">
                    <Card>
                      <li>
                        {" "}
                        <div className="summary-title color1">
                          <span>
                            <i className="fa fa-users" /> Users
                          </span>
                        </div>
                        <div className="summary-body">
                          {summary.users[0].numUsers}
                        </div>
                      </li>
                    </Card>
                  </Link>
                </Col>{" "}
                <Col md={4}>
                  <Link to="/admin/orders" className="linkStyles">
                    <Card>
                      <li>
                        <div className="summary-title color2">
                          <span>
                            <i className="fa fa-shopping-cart" /> Orders
                          </span>
                        </div>
                        <div className="summary-body">
                          {summary.orders[0] ? summary.orders[0].numOrders : 0}
                        </div>
                      </li>
                    </Card>
                  </Link>
                </Col>{" "}
                <Col md={4}>
                  <Card>
                    <li>
                      <div className="summary-title color3">
                        <span>
                          <i className="fa fa-money" /> Sales
                        </span>
                      </div>
                      <div className="summary-body">
                        Kshs. {""}
                        {summary.orders[0]
                          ? numberWithCommas(
                              summary.orders[0].totalSales.toFixed(2)
                            )
                          : 0}
                      </div>
                    </li>
                  </Card>
                </Col>{" "}
              </ul>
            </Row>

            <div className="my-3">
              <h2>Sales</h2>
              {summary.dailyOrders.length === 0 ? (
                <MessageBox>No Sale</MessageBox>
              ) : (
                <Chart
                  width="100%"
                  height="400px"
                  chartType="AreaChart"
                  loader={<div>Loading Graph...</div>}
                  data={[
                    ["Date", "Sales"],
                    ...summary.dailyOrders.map((x) => [x._id, x.sales]),
                  ]}
                ></Chart>
              )}
            </div>
            <div className="my-3">
              <h2>Categories</h2>
              {summary.productCategories.length === 0 ? (
                <MessageBox>No Category</MessageBox>
              ) : (
                <Chart
                  width="100%"
                  height="400px"
                  chartType="PieChart"
                  loader={<div>Loading Chart...</div>}
                  data={[
                    ["Category", "Products"],
                    ...summary.productCategories.map((x) => [x._id, x.count]),
                  ]}
                ></Chart>
              )}
            </div>
          </>
        )}
      </div>
    </Container>
  );
}
