import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://10.0.2.2:8000/api/v1';

// Interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface VerifyRequest {
  email: string;
  otp: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    email_verified_at?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Interface untuk verify OTP
export interface VerifyOTPRequest {
  phone: string;
  otp: string;
}

// Helper untuk logging
const logError = (message: string, error: any) => {
  console.error(`[Auth Service Error] ${message}:`, error);
  if (axios.isAxiosError(error)) {
    console.error('Response:', error.response?.data);
    console.error('Status:', error.response?.status);
  }
};

const logInfo = (message: string, data?: any) => {
  console.log(`[Auth Service Info] ${message}`, data || '');
};

export const authService = {
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    try {
      logInfo('Mencoba login dengan email:', data.email);

      const response = await axios.post<ApiResponse<AuthResponse>>(
        `${API_BASE_URL}/login`,
        data,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );

      logInfo('Response login:', {
        status: response.status,
        success: response.data.success,
        hasToken: !!response.data.data?.token
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Login gagal');
      }

      // Validasi dan simpan token
      const token = response.data.data?.token;
      if (!token) {
        throw new Error('Token tidak ditemukan dalam response');
      }

      try {
        await AsyncStorage.setItem('token', token);
        logInfo('Token berhasil disimpan');
      } catch (storageError) {
        logError('Gagal menyimpan token', storageError);
        throw new Error('Gagal menyimpan sesi login');
      }

      return response.data;
    } catch (error: any) {
      logError('Error saat login', error);

      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const message = error.response?.data?.message || error.message;

        switch (statusCode) {
          case 401:
            throw new Error('Email atau password salah');
          case 422:
            const errors = error.response?.data?.errors;
            if (errors) {
              const errorMessages = Object.values(errors).flat().join(', ');
              throw new Error(`Validasi gagal: ${errorMessages}`);
            }
            throw new Error(message);
          case 429:
            throw new Error('Terlalu banyak percobaan, silakan coba lagi nanti');
          default:
            throw new Error(`Terjadi kesalahan: ${message}`);
        }
      }

      throw new Error('Terjadi kesalahan saat login');
    }
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    try {
      logInfo('Mencoba register dengan email:', data.email);

      const response = await axios.post<ApiResponse<AuthResponse>>(
        `${API_BASE_URL}/register`,
        data,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );

      logInfo('Response register:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Registrasi gagal');
      }

      // Simpan token jika ada
      const token = response.data.data.token;
      if (token) {
        await AsyncStorage.setItem('token', token);
        logInfo('Token berhasil disimpan');
      }

      return response.data;
    } catch (error: any) {
      logError('Error saat register', error);

      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const message = error.response?.data?.message || error.message;

        switch (statusCode) {
          case 422:
            const errors = error.response?.data?.errors;
            if (errors) {
              const errorMessages = Object.values(errors).flat().join(', ');
              throw new Error(`Validasi gagal: ${errorMessages}`);
            }
            throw new Error(message);
          case 409:
            throw new Error('Email sudah terdaftar');
          default:
            throw new Error(`Terjadi kesalahan: ${message}`);
        }
      }

      throw new Error('Terjadi kesalahan saat registrasi');
    }
  },

  verify: async (data: VerifyRequest): Promise<ApiResponse<AuthResponse>> => {
    try {
      logInfo('Mencoba verifikasi email:', data.email);

      const response = await axios.post<ApiResponse<AuthResponse>>(
        `${API_BASE_URL}/verify`,
        data,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );

      logInfo('Response verifikasi:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Verifikasi gagal');
      }

      // Update token jika ada yang baru
      const token = response.data.data.token;
      if (token) {
        await AsyncStorage.setItem('token', token);
        logInfo('Token baru berhasil disimpan');
      }

      return response.data;
    } catch (error: any) {
      logError('Error saat verifikasi', error);

      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const message = error.response?.data?.message || error.message;

        switch (statusCode) {
          case 400:
            throw new Error('Kode OTP tidak valid');
          case 401:
            throw new Error('Email tidak terdaftar');
          case 422:
            const errors = error.response?.data?.errors;
            if (errors) {
              const errorMessages = Object.values(errors).flat().join(', ');
              throw new Error(`Validasi gagal: ${errorMessages}`);
            }
            throw new Error(message);
          case 429:
            throw new Error('Terlalu banyak percobaan, silakan coba lagi nanti');
          default:
            throw new Error(`Terjadi kesalahan: ${message}`);
        }
      }

      throw new Error('Terjadi kesalahan saat verifikasi');
    }
  },

  verifyOTP: async (data: VerifyOTPRequest): Promise<ApiResponse<any>> => {
    try {
      logInfo('Mencoba verifikasi OTP untuk nomor:', data.phone);

      const response = await axios.post<ApiResponse<any>>(
        `${API_BASE_URL}/verify-otp`,
        data,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );

      logInfo('Response verifikasi OTP:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Verifikasi OTP gagal');
      }

      return response.data;
    } catch (error: any) {
      logError('Error saat verifikasi OTP', error);

      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const message = error.response?.data?.message || error.message;

        switch (statusCode) {
          case 400:
            throw new Error('Kode OTP tidak valid');
          case 401:
            throw new Error('Nomor telepon tidak terdaftar');
          case 422:
            const errors = error.response?.data?.errors;
            if (errors) {
              const errorMessages = Object.values(errors).flat().join(', ');
              throw new Error(`Validasi gagal: ${errorMessages}`);
            }
            throw new Error(message);
          case 429:
            throw new Error('Terlalu banyak percobaan, silakan coba lagi nanti');
          default:
            throw new Error(`Terjadi kesalahan: ${message}`);
        }
      }

      throw new Error('Terjadi kesalahan saat verifikasi OTP');
    }
  },

  logout: async (): Promise<ApiResponse<void>> => {
    try {
      logInfo('Mencoba logout');

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Tidak ada sesi yang aktif');
      }

      const response = await axios.post<ApiResponse<void>>(
        `${API_BASE_URL}/logout`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        }
      );

      // Hapus token
      await AsyncStorage.removeItem('token');
      logInfo('Logout berhasil, token dihapus');

      return {
        success: true,
        message: 'Logout berhasil',
        data: undefined
      };
    } catch (error: any) {
      logError('Error saat logout', error);
      
      // Tetap hapus token lokal meskipun request gagal
      await AsyncStorage.removeItem('token');
      
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Gagal logout: ${message}`);
      }

      throw new Error('Terjadi kesalahan saat logout');
    }
  }
};

export default authService; 