import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Link, useNavigate } from "react-router-dom";
import Rating from "./Rating";
import axios from "axios";
import { useContext } from "react";
import { Store } from "../Store";
import { toast } from "react-toastify";
import Bar from "./Bar";

function NewProduct(props) {
  const navigate = useNavigate();

  const { newproduct } = props;
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const addToCartHandler = async (item) => {
    const existItem = cartItems.find((x) => x._id === newproduct._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/newproducts/${item._id}`);
    if (data.countInStock < quantity) {
      toast.error("Sorry, product has gone out of stock");
      return;
    }
    ctxDispatch({
      type: "CART_ADD_ITEM",
      payload: { ...item, quantity },
    });
    toast.success("Product added in cart");
    navigate("/cart");
  };
  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return (
    <Card className="ProductCard">
      <Card.Body>
        <Link to={`/newproduct/${newproduct.slug}`} className="productImg">
          <img
            src={newproduct.image}
            className="card-img-top productImg"
            alt={newproduct.name}
          />
        </Link>
        <Link className="linkStyles2" to={`/newproduct/${newproduct.slug}`}>
          <Card.Title>{newproduct.name}</Card.Title>
        </Link>
        <Rating rating={newproduct.rating} numReviews={newproduct.numReviews} />
        <Card.Text>
          <div style={{ color: "#747064" }}>
            <strike>
              {"   "}Ksh.{numberWithCommas(newproduct.wasprice)}
            </strike>
          </div>{" "}
          <strong>Ksh.{numberWithCommas(newproduct.price)}</strong>
        </Card.Text>
        {newproduct.countInStock === 0 ? (
          <Button variant="light" disabled>
            Out of stock
          </Button>
        ) : (
          <Button onClick={() => addToCartHandler(newproduct)}>
            Add to cart
          </Button>
        )}
        <Bar
          itemsLeft={newproduct.countInStock}
          totalItems={newproduct.countInStock + 100} //more research needed here
        />
      </Card.Body>
    </Card>
  );
}
export default NewProduct;
