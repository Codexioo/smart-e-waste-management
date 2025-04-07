import axios from "../api/axiosInstance";

export const getOrders = async (email: string) => {
  const res = await axios.get(`/orders?email=${email}`);
  return res.data;
};

export const checkout = async (email: string, items: any[]) => {
  const res = await axios.post("/checkout", { email, items });
  return res.data;
};
