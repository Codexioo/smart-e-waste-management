// client/api/axiosInstance.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const baseURL = 'http://192.168.1.4:3001';

const axiosInstance = axios.create({
  baseURL,
  timeout: 5000,
});

// ✅ Attach token to every request
axiosInstance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
