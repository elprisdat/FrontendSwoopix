import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ganti dengan IP komputer Anda
const BASE_URL = 'http://10.0.2.2:8000/api/v1'; // untuk Android Emulator
// const BASE_URL = 'http://192.168.x.x:8000/api/v1'; // untuk perangkat fisik, ganti sesuai IP komputer Anda

interface RegisterData {
  name: string;
  email?: string;
  phone: string;
  password: string;
}

interface LoginData {
  phone: string;
  password: string;
}

interface VerifyOTPData {
  phone: string;
  otp: string;
}

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

interface LoginResponse {
  user: User;
  token: string;
}

const authService = {
  register: async (data: RegisterData): Promise<ApiResponse<{ user: User; otp?: string }>> => {
    try {
      // Format nomor telepon (hapus karakter non-angka)
      const formattedPhone = data.phone.replace(/\D/g, '');
      
      const response = await axios.post(`${BASE_URL}/register`, {
        ...data,
        phone: formattedPhone,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Terjadi kesalahan saat mendaftar' };
    }
  },

  login: async (data: LoginData): Promise<ApiResponse<LoginResponse>> => {
    try {
      // Format nomor telepon (hapus karakter non-angka)
      const formattedPhone = data.phone.replace(/\D/g, '');
      
      const response = await axios.post(`${BASE_URL}/login`, {
        ...data,
        phone: formattedPhone,
      });
      
      // Simpan token jika login berhasil
      if (response.data.success && response.data.data?.token) {
        await AsyncStorage.setItem('token', response.data.data.token);
      }
      
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Terjadi kesalahan saat login' };
    }
  },

  verifyOTP: async (data: VerifyOTPData): Promise<ApiResponse<any>> => {
    try {
      // Format nomor telepon (hapus karakter non-angka)
      const formattedPhone = data.phone.replace(/\D/g, '');
      
      const response = await axios.post(`${BASE_URL}/verify-otp`, {
        ...data,
        phone: formattedPhone,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Terjadi kesalahan saat verifikasi OTP' };
    }
  },

  logout: async (): Promise<ApiResponse<any>> => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Hapus token setelah logout
      await AsyncStorage.removeItem('token');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, message: 'Terjadi kesalahan saat logout' };
    }
  },
};

export default authService; 