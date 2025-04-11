import axios from "../api/axiosInstance";

export const getRewards = async () => {
  const res = await axios.get("/rewards");
  return res.data;
};
