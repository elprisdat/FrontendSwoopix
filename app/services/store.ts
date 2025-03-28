import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:8000/api/v1';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface Store {
  id: string;
  name: string;
  description: string | null;
  address: string;
  phone: string;
  email: string | null;
  logo: string | null;
  latitude: number;
  longitude: number;
  open_time: string;
  close_time: string;
  is_open: boolean;
  created_at: string;
  updated_at: string;
}

// Fungsi helper untuk logging
const logInfo = (message: string, data?: any) => {
  console.log(`[STORE SERVICE] ${message}`, data ? data : '');
};

const logWarning = (message: string, data?: any) => {
  console.warn(`[STORE SERVICE] ${message}`, data ? data : '');
};

const logError = (message: string, error: any) => {
  console.error(`[STORE SERVICE] ${message}`, {
    message: error.message,
    stack: error.stack,
    response: error.response?.data,
    status: error.response?.status,
  });
};

const storeService = {
  getAllStores: async (): Promise<ApiResponse<{ stores: Store[] }>> => {
    try {
      logInfo('Mengambil semua data toko...');
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        logWarning('Token tidak ditemukan');
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${BASE_URL}/stores`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      logInfo('Response dari get all stores:', {
        status: response.status,
        data: response.data
      });

      return response.data;
    } catch (error: any) {
      logError('Gagal mengambil data toko', error);
      throw error.response?.data || {
        success: false,
        message: 'Terjadi kesalahan saat mengambil data toko'
      };
    }
  },

  getOpenStores: async (): Promise<ApiResponse<{ stores: Store[] }>> => {
    try {
      logInfo('Mengambil data toko yang buka...');
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        logWarning('Token tidak ditemukan');
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${BASE_URL}/stores/open`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      logInfo('Response dari get open stores:', {
        status: response.status,
        data: response.data
      });

      return response.data;
    } catch (error: any) {
      logError('Gagal mengambil data toko yang buka', error);
      throw error.response?.data || {
        success: false,
        message: 'Terjadi kesalahan saat mengambil data toko yang buka'
      };
    }
  },

  searchStores: async (query: string): Promise<ApiResponse<{ stores: Store[] }>> => {
    try {
      logInfo('Mencari toko...', { query });
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        logWarning('Token tidak ditemukan');
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${BASE_URL}/stores/search`, {
        params: { query },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      logInfo('Response dari search stores:', {
        status: response.status,
        data: response.data
      });

      return response.data;
    } catch (error: any) {
      logError('Gagal mencari toko', error);
      throw error.response?.data || {
        success: false,
        message: 'Terjadi kesalahan saat mencari toko'
      };
    }
  },

  getStoreDetail: async (id: string): Promise<ApiResponse<{ store: Store }>> => {
    try {
      logInfo('Mengambil detail toko...', { id });
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        logWarning('Token tidak ditemukan');
        throw new Error('Authentication token not found');
      }

      const response = await axios.get(`${BASE_URL}/stores/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      logInfo('Response dari get store detail:', {
        status: response.status,
        data: response.data
      });

      return response.data;
    } catch (error: any) {
      logError('Gagal mengambil detail toko', error);
      throw error.response?.data || {
        success: false,
        message: 'Terjadi kesalahan saat mengambil detail toko'
      };
    }
  }
};

export default storeService; 