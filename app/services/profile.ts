import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:8000/api/v1'; // untuk Android Emulator
// const BASE_URL = 'http://192.168.x.x:8000/api/v1'; // untuk perangkat fisik

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  store: {
    name: string;
    logo: string | null;
  };
}

const profileService = {
  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Terjadi kesalahan saat mengambil data profil' };
    }
  },

  getOrders: async (): Promise<ApiResponse<{ orders: Order[] }>> => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Terjadi kesalahan saat mengambil riwayat pesanan' };
    }
  },
};

export default profileService; 