import axios from "../api/axiosInstance";

export const getOrders = async () => {
  const res = await axios.get("/orders");
  return res.data;
};

export const checkout = async (items: any[]) => {
  const res = await axios.post("/checkout", { items });
  return res.data;
};
