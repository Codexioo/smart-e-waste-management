import axios from "../api/axiosInstance";

export const getCart = async () => {
  const res = await axios.get("/cart");
  return res.data;
};

export const addToCart = async (productId: number, quantity: number) => {
  const res = await axios.post("/cart", { product_id: productId, quantity });
  return res.data;
};

export const removeFromCart = async (productId: number) => {
  const res = await axios.delete(`/cart/${productId}`);
  return res.data;
};

export const clearCart = async () => {
  const res = await axios.delete("/cart");
  return res.data;
};
