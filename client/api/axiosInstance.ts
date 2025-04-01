// client/api/axiosInstance.ts
import axios from 'axios';

<<<<<<< HEAD
const baseURL = 'http://192.168.1.5:3001';
=======
const baseURL = 'http://192.168.1.23:9090';
>>>>>>> af2d749b6ad0dc96ab6e187d46d242a1c3502fa5

const axiosInstance = axios.create({
  baseURL,
  timeout: 5000,
});

export default axiosInstance;
