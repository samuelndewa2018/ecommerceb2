import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Link, useNavigate } from "react-router-dom";
import Rating from "./Rating";
import axios from "axios";
import { useContext } from "react";
import { Store } from "../Store";
import { toast } from "react-toastify";

function Product(props) {
  const navigate = useNavigate();

  const { product } = props;
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const {
    cart: { cartItems },
  } = state;

  const addToCartHandler = async (item) => {
    const existItem = cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${item._id}`);
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
        <Link to={`/product/${product.slug}`} className="productImg">
          <img
            src={product.image}
            className="card-img-top productImg"
            alt={product.name}
          />
        </Link>
        <Link className="linkStyles2" to={`/product/${product.slug}`}>
          <Card.Title>{product.name}</Card.Title>
        </Link>
        <Rating rating={product.rating} numReviews={product.numReviews} />
        <Card.Text>
          <strong>Ksh.{numberWithCommas(product.price)}</strong>
        </Card.Text>
        <Card.Text className="brandColor">
          (
          {product.countInStock === 0
            ? "No product remaining"
            : product.countInStock === 1
            ? "1 product remaining"
            : `${product.countInStock} products remaining`}
          )
        </Card.Text>
        {product.countInStock === 0 ? (
          <Button variant="light" disabled>
            Out of stock
          </Button>
        ) : (
          <Button onClick={() => addToCartHandler(product)}>Add to cart</Button>
        )}{" "}
      </Card.Body>
    </Card>
  );
}
export default Product;
