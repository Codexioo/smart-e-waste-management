// utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = 'user';
const TOKEN_KEY = 'token';
const ROLE_KEY = 'role';

export const getUser = async () => {
  const json = await AsyncStorage.getItem(USER_KEY);
  return json ? JSON.parse(json) : null;
};

export const getToken = async () => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const setUser = async (user: any) => {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const setToken = async (token: string) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const clearStorage = async () => {
  await AsyncStorage.multiRemove([USER_KEY, TOKEN_KEY, ROLE_KEY]);
};
