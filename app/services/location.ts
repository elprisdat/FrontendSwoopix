import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const BASE_URL = 'http://10.0.2.2:8000/api/v1'; // untuk Android Emulator
// const BASE_URL = 'http://192.168.x.x:8000/api/v1'; // untuk perangkat fisik

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
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access location was denied');
      }

      const location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      throw new Error('Error getting location');
    }
  },

  getNearbyStores: async (latitude: number, longitude: number, radius: number = 5): Promise<ApiResponse<{ stores: Store[]; total: number }>> => {
    try {
      const token = await AsyncStorage.getItem('token');
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
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Terjadi kesalahan saat mengambil data toko terdekat' };
    }
  },

  getWeatherRecommendations: async (latitude: number, longitude: number): Promise<ApiResponse<WeatherRecommendation>> => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/menus/weather-recommendations`, {
        params: {
          lat: latitude,
          lon: longitude,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Terjadi kesalahan saat mengambil rekomendasi menu' };
    }
  },
};

export default locationService; 