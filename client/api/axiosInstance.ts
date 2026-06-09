import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 3001;

const getApiBaseUrl = (): string => {
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${API_PORT}`;
  }

  // iOS simulator shares the host machine — localhost is most reliable
  if (Platform.OS === 'ios' && !Constants.isDevice) {
    return `http://127.0.0.1:${API_PORT}`;
  }

  // Physical device: use the same LAN IP as the Expo dev server
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:${API_PORT}`;
  }

  return `http://127.0.0.1:${API_PORT}`;
};

const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
});

axiosInstance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
