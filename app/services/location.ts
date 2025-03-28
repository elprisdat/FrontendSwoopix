import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const BASE_URL = 'http://10.0.2.2:8000/api/v1'; // untuk Android Emulator
// const BASE_URL = 'http://192.168.x.x:8000/api/v1'; // untuk perangkat fisik

// Fungsi helper untuk logging
const logInfo = (message: string, data?: any) => {
  console.log(`[INFO] ${message}`, data ? data : '');
};

const logWarning = (message: string, data?: any) => {
  console.warn(`[WARNING] ${message}`, data ? data : '');
};

const logError = (message: string, error: any) => {
  console.error(`[ERROR] ${message}`, {
    message: error.message,
    stack: error.stack,
    response: error.response?.data,
    status: error.response?.status,
  });
};

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  latitude: number;
  longitude: number;
  open_time: string;
  close_time: string;
  is_open: boolean;
  distance: number;
  menus: Menu[];
}

interface Menu {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  is_available: boolean;
}

interface WeatherRecommendation {
  weather: {
    temp: number;
    feels_like: number;
    humidity: number;
    weather: {
      id: number;
      main: string;
      description: string;
    };
  };
  conditions: string[];
  menus: Menu[];
}

const locationService = {
  getCurrentLocation: async () => {
    try {
      logInfo('Meminta izin lokasi...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        logWarning('Izin lokasi ditolak oleh pengguna');
        throw new Error('Permission to access location was denied');
      }

      logInfo('Mendapatkan lokasi pengguna...');
      const location = await Location.getCurrentPositionAsync({});
      
      const coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      logInfo('Lokasi pengguna berhasil didapat', coordinates);
      return coordinates;
    } catch (error: any) {
      logError('Gagal mendapatkan lokasi pengguna', error);
      throw new Error('Error getting location: ' + error.message);
    }
  },

  getNearbyStores: async (latitude: number, longitude: number, radius: number = 5): Promise<ApiResponse<{ stores: Store[]; total: number }>> => {
    try {
      logInfo('Mengambil data toko terdekat...', { latitude, longitude, radius });
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        logWarning('Token tidak ditemukan');
        throw new Error('Authentication token not found');
      }

      // Log request details
      logInfo('Request details untuk nearby stores:', {
        url: `${BASE_URL}/stores/nearby`,
        params: { latitude, longitude, radius },
        headers: { Authorization: `Bearer ${token}` }
      });

      const response = await axios.get(`${BASE_URL}/stores/nearby`, {
        params: {
          latitude,
          longitude,
          radius,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Log full response untuk debugging
      logInfo('Response lengkap dari nearby stores:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      if (!response.data.success) {
        logWarning('API mengembalikan status tidak sukses', response.data);
        throw new Error(response.data.message || 'Failed to fetch nearby stores');
      }

      if (!response.data.data?.stores || response.data.data.stores.length === 0) {
        logWarning('Tidak ada toko terdekat yang ditemukan', {
          responseData: response.data
        });
      }

      return response.data;
    } catch (error: any) {
      logError('Gagal mengambil data toko terdekat', error);
      throw error.response?.data || { 
        success: false, 
        message: 'Terjadi kesalahan saat mengambil data toko terdekat' 
      };
    }
  },

  getWeatherRecommendations: async (latitude: number, longitude: number): Promise<ApiResponse<WeatherRecommendation>> => {
    try {
      logInfo('Mengambil rekomendasi menu berdasarkan cuaca...', { latitude, longitude });
      
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        logWarning('Token tidak ditemukan');
        throw new Error('Authentication token not found');
      }

      // Log request details
      logInfo('Request details untuk weather recommendations:', {
        url: `${BASE_URL}/menus/weather-recommendations`,
        params: { lat: latitude, lon: longitude },
        headers: { Authorization: `Bearer ${token}` }
      });

      const response = await axios.get(`${BASE_URL}/menus/weather-recommendations`, {
        params: {
          lat: latitude,
          lon: longitude,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Log full response untuk debugging
      logInfo('Response lengkap dari weather recommendations:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      if (!response.data.success) {
        logWarning('API mengembalikan status tidak sukses', response.data);
        throw new Error(response.data.message || 'Failed to fetch weather recommendations');
      }

      if (!response.data.data?.menus || response.data.data.menus.length === 0) {
        logWarning('Tidak ada rekomendasi menu yang ditemukan', {
          responseData: response.data
        });
      }

      return response.data;
    } catch (error: any) {
      logError('Gagal mengambil rekomendasi menu', error);
      throw error.response?.data || { 
        success: false, 
        message: 'Terjadi kesalahan saat mengambil rekomendasi menu' 
      };
    }
  },
};

export default locationService; 