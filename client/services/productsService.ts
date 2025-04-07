import axios from "../api/axiosInstance";

export const getProducts = async () => {
  const res = await axios.get("/products");
  return res.data;
};
