// client/api/axiosInstance.ts
import axios from 'axios';

const baseURL = 'http://192.168.8.120:9090';

const axiosInstance = axios.create({
  baseURL,
  timeout: 5000,
});

export default axiosInstance;
