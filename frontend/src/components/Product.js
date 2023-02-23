import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { Link, useNavigate } from "react-router-dom";
import Rating from "./Rating";
import axios from "axios";
import { useContext } from "react";
import { Store } from "../Store";
import { toast } from "react-toastify";
import Bar from "./Bar";

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
  const discount = Math.round(
    ((product.wasprice - product.price) / product.wasprice) * 100
  );

  return (
    <Card className="ProductCard">
      <Card.Body>
        <Link to={`/product/${product.slug}`} className="productImg2">
          <img
            src={product.image}
            className="card-img-top productImg"
            alt={product.name}
          />
          <span className="discount-badge">-{discount}%</span>
        </Link>
        <Link className="linkStyles2" to={`/product/${product.slug}`}>
          <Card.Title>{product.name}</Card.Title>
        </Link>
        <Rating rating={product.rating} numReviews={product.numReviews} />
        <Card.Text>
          <div style={{ color: "#747064" }}>
            <strike>
              {"   "} was Ksh. {numberWithCommas(product.wasprice)}
            </strike>
          </div>{" "}
          <strong>Ksh.{numberWithCommas(product.price)}</strong>
        </Card.Text>
        {product.countInStock === 0 ? (
          <Button variant="light" disabled>
            Out of stock
          </Button>
        ) : (
          <Button onClick={() => addToCartHandler(product)}>Add to cart</Button>
        )}{" "}
        <Bar
          itemsLeft={product.countInStock}
          totalItems={product.originStock}
        />
      </Card.Body>
    </Card>
  );
}
export default Product;
