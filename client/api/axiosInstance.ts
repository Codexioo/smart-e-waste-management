// client/api/axiosInstance.ts
import axios from 'axios';

const baseURL = 'http://192.168.1.23:9090';

const axiosInstance = axios.create({
  baseURL,
  timeout: 5000,
});

export default axiosInstance;
