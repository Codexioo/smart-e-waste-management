import axios from "../api/axiosInstance";

export const getRewards = async (email: string) => {
  const res = await axios.get(`/rewards?email=${email}`);
  return res.data;
};
