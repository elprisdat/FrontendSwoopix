import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'http://10.0.2.2:8000/api/v1';

// Buat instance axios dengan base URL
export const api = axios.create({
  baseURL: BASE_URL,
});

// Setup interceptor untuk menambahkan token ke setiap request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function untuk mengambil user data
export const getUserData = async () => {
  try {
    const userDataString = await AsyncStorage.getItem('@user_data');
    if (userDataString) {
      return JSON.parse(userDataString);
    }
    return null;
  } catch (error) {
    console.error('Error mengambil data user:', error);
    return null;
  }
};

// Helper function untuk mengambil token
export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('@auth_token');
  } catch (error) {
    console.error('Error mengambil token:', error);
    return null;
  }
};

// Helper function untuk logout
export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove(['@auth_token', '@user_data']);
  } catch (error) {
    console.error('Error menghapus data auth:', error);
  }
}; 