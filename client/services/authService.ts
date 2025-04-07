import axios from "../api/axiosInstance";

export const checkUser = async (email: string) => {
  const res = await axios.post("/check-user", { email });
  return res.data;
};

export const sendOtp = async (email: string) => {
  const res = await axios.post("/send-otp", { email });
  return res.data;
};

export const verifyOtp = async (email: string, enteredOtp: string) => {
  const res = await axios.post("/verify-otp", { email, enteredOtp });
  return res.data;
};

export const submitWaste = async (
  email: string,
  waste_type: string,
  waste_weight: number
) => {
  const res = await axios.post("/submit-waste", {
    email,
    waste_type,
    waste_weight,
  });
  return res.data;
};
