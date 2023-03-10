import { createContext, useReducer } from "react";

export const Store = createContext();

const initialState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
  cart: {
    shippingAddress: localStorage.getItem("shippingAddress")
      ? JSON.parse(localStorage.getItem("shippingAddress"))
      : {},
    paymentMethod: localStorage.getItem("paymentMethod")
      ? localStorage.getItem("paymentMethod")
      : "",
    cartItems: localStorage.getItem("cartItems")
      ? JSON.parse(localStorage.getItem("cartItems"))
      : [],
    favoriteItems: localStorage.getItem("favoriteItems")
      ? JSON.parse(localStorage.getItem("favoriteItems"))
      : [],
  },
};
function reducer(state, action) {
  switch (action.type) {
    case "CART_ADD_ITEM":
      // add to cart
      const newItem = action.payload;
      const existItem = state.cart.cartItems.find(
        (item) => item._id === newItem._id
      );
      const cartItems = existItem
        ? state.cart.cartItems.map((item) =>
            item._id === existItem._id ? newItem : item
          )
        : [...state.cart.cartItems, newItem];
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } };
    case "FAVORITE_ADD_ITEM":
      // add to cart
      const newfavoriteItem = action.payload;
      const existfavoriteItem = state.cart.favoriteItems.find(
        (item) => item._id === newfavoriteItem._id
      );
      const favoriteItems = existfavoriteItem
        ? state.cart.favoriteItems.map((item) =>
            item._id === existfavoriteItem._id ? newfavoriteItem : item
          )
        : [...state.cart.favoriteItems, newfavoriteItem];
      localStorage.setItem("favoriteItems", JSON.stringify(favoriteItems));
      return { ...state, cart: { ...state.cart, favoriteItems } };
    case "CART_REMOVE_ITEM": {
      const cartItems = state.cart.cartItems.filter(
        (item) => item._id !== action.payload._id
      );
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } };
    }
    case "FAVORITE_REMOVE_ITEM": {
      const favoriteItems = state.cart.favoriteItems.filter(
        (item) => item._id !== action.payload._id
      );
      localStorage.setItem("favoriteItems", JSON.stringify(favoriteItems));
      return { ...state, cart: { ...state.cart, favoriteItems } };
    }
    case "CART_CLEAR":
      return { ...state, cart: { ...state.cart, cartItems: [] } };

    case "USER_SIGNIN":
      return { ...state, userInfo: action.payload };
    case "USER_SIGNOUT":
      return {
        ...state,
        userInfo: null,
        cart: {
          cartItems: [],
          shippingAddress: {},
          paymentMethod: "",
        },
      };
    case "SAVE_SHIPPING_ADDRESS":
      return {
        ...state,
        cart: {
          ...state.cart,
          shippingAddress: action.payload,
        },
      };
    case "SAVE_PAYMENT_METHOD":
      return {
        ...state,
        cart: { ...state.cart, paymentMethod: action.payload },
      };
    case "FORGOT_PASSWORD_REQUEST":
    case "RESET_PASSWORD_REQUEST":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "FORGOT_PASSWORD_SUCCESS":
      return {
        ...state,
        loading: false,
        token: action.payload,
      };
    case "RESET_PASSWORD_SUCCESS":
      return {
        ...state,
        loading: false,
        token: action.payload,
      };
    case "FORGOT_PASSWORD_FAIL":
    case "RESET_PASSWORD_FAIL":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
}

export function StoreProvider(props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const value = { state, dispatch };
  return <Store.Provider value={value}>{props.children} </Store.Provider>;
}
