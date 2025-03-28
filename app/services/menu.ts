import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Base URL API
const API_BASE_URL = 'http://10.0.2.2:8000/api/v1';

// Tripay API URL (sandbox)
const TRIPAY_API_URL = 'https://tripay.co.id/api-sandbox';

// Payment callback URLs
const PAYMENT_CALLBACK = {
  SUCCESS: `${API_BASE_URL}/payment/success`,
  FAILED: `${API_BASE_URL}/payment/failed`,
  NOTIFICATION: `${API_BASE_URL}/payment/callback`
};

// Interfaces
export interface Category {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  is_available: boolean;
  category_id: string;
  store_id: string;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    description: string | null;
    image: string | null;
    is_active: boolean;
  };
}

export interface OrderItem {
  menu_id: string;
  quantity: number;
  notes?: string | null;
}

export interface OrderItemResponse {
  id: string;
  menu_id: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
  menu: {
    name: string;
    description: string | null;
  };
}

export interface Order {
  id: string;
  store_id: string;
  user_id: string;
  total_price: number;
  discount_amount: number;
  final_price: number;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_url?: string;
  payment_token?: string;
  expired_at: string;
  paid_at?: string;
  cancelled_at?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items: OrderItemResponse[];
}

export interface Payment {
  payment_method: string;
  payment_url: string | null;
  status: string;
  reference: string;
  expired_time: string;
}

export interface OrderResponse {
  order: Order;
  payment: Payment;
}

export interface CreateOrderRequest {
  store_id: string;
  items: OrderItem[];
  payment_method: string;
  notes?: string | null;
}

export interface PaymentChannel {
  code: string;
  name: string;
  icon_url?: string;
  description?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Store {
  id: number;
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

// Tambahkan interface untuk payment status
export interface PaymentStatus {
  order_id: string;
  status: string;
  message: string;
  payment_url?: string;
  payment_method?: string;
  expired_time?: string;
}

// Helper untuk logging
const logError = (message: string, error: any) => {
  console.error(`[Menu Service Error] ${message}:`, error);
};

const logInfo = (message: string, data?: any) => {
  console.log(`[Menu Service Info] ${message}`, data || '');
};

// Service methods
export const menuService = {
  // Get categories
  getCategories: async (): Promise<Category[]> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }
      
      logInfo('Memulai fetch kategori');
      
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      logInfo('Status response kategori:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token tidak valid atau expired');
        } else if (response.status === 403) {
          throw new Error('Tidak memiliki akses');
        } else if (response.status === 404) {
          throw new Error('Data tidak ditemukan');
        } else if (response.status === 500) {
          throw new Error('Terjadi kesalahan pada server');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logInfo('Response kategori:', data);

      if (!data.success) {
        throw new Error(data.message || 'Gagal memuat kategori');
      }

      if (!data.data?.categories || !Array.isArray(data.data.categories)) {
        throw new Error('Format data kategori tidak valid');
      }

      return data.data.categories;
    } catch (error) {
      logError('Error saat memuat kategori', error);
      throw error;
    }
  },

  // Get menus with optional filters
  getMenus: async (categoryId?: string, search?: string): Promise<MenuItem[]> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Silakan login terlebih dahulu');
      }

      let url = `${API_BASE_URL}/menus`;
      if (categoryId) {
        url = `${API_BASE_URL}/menus/category/${categoryId}`;
      } else if (search) {
        url = `${API_BASE_URL}/menus/search?query=${encodeURIComponent(search)}`;
      }

      logInfo('Fetching menus from URL:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      logInfo('Menu response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sesi Anda telah berakhir. Silakan login kembali.');
        } else if (response.status === 403) {
          throw new Error('Anda tidak memiliki akses ke menu ini.');
        } else if (response.status === 404) {
          throw new Error('Menu tidak ditemukan.');
        } else if (response.status === 500) {
          throw new Error('Terjadi kesalahan pada server. Silakan coba lagi nanti.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logInfo('Menu response data:', data);

      if (!data.success) {
        throw new Error(data.message || 'Gagal memuat menu');
      }

      const menus = data.data?.menus;
      if (!menus || !Array.isArray(menus)) {
        throw new Error('Data menu tidak valid');
      }

      return menus;
    } catch (error: any) {
      logError('Error detail saat memuat menu:', error);
      if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.');
      }
      throw error;
    }
  },

  // Get payment channels
  async getPaymentChannels(): Promise<PaymentChannel[]> {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }

      logInfo('Memulai fetch payment channels');
      
      const response = await axios.get<ApiResponse<PaymentChannel[]>>(`${API_BASE_URL}/payment-channels`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      logInfo('Response payment channels:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Gagal memuat payment channels');
      }

      if (!Array.isArray(response.data.data)) {
        throw new Error('Format data payment channels tidak valid');
      }

      // Validasi setiap payment channel
      const validChannels = response.data.data.filter(channel => {
        return channel && typeof channel === 'object' 
          && typeof channel.code === 'string'
          && typeof channel.name === 'string';
      });

      if (validChannels.length === 0) {
        // Jika tidak ada channel yang valid, tambahkan opsi CASH
        return [{
          code: 'CASH',
          name: 'Bayar Tunai',
          description: 'Pembayaran tunai di kasir'
        }];
      }

      return validChannels;
    } catch (error: any) {
      logError('Error saat mengambil payment channels', error);
      // Jika gagal mengambil payment channels, kembalikan opsi CASH
      return [{
        code: 'CASH',
        name: 'Bayar Tunai',
        description: 'Pembayaran tunai di kasir'
      }];
    }
  },

  // Handle payment callback
  handlePaymentCallback: async (reference: string): Promise<ApiResponse<PaymentStatus>> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }

      logInfo('Checking payment status for reference:', reference);

      const response = await axios.get<ApiResponse<PaymentStatus>>(
        `${API_BASE_URL}/payment/status/${reference}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        }
      );

      logInfo('Payment status response:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Gagal mendapatkan status pembayaran');
      }

      return response.data;
    } catch (error: any) {
      logError('Error saat mengecek status pembayaran', error);

      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const message = error.response?.data?.message || error.message;

        switch (statusCode) {
          case 401:
            throw new Error('Silakan login terlebih dahulu');
          case 404:
            throw new Error('Data pembayaran tidak ditemukan');
          case 500:
            throw new Error('Terjadi kesalahan pada server');
          default:
            throw new Error(`Terjadi kesalahan: ${message}`);
        }
      }

      throw new Error('Terjadi kesalahan saat mengecek status pembayaran');
    }
  },

  // Get payment URL
  getPaymentUrl: async (orderId: string): Promise<string> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }

      logInfo('Getting payment URL for order:', orderId);

      const response = await axios.get<ApiResponse<{ payment_url: string }>>(
        `${API_BASE_URL}/orders/${orderId}/payment-url`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        }
      );

      logInfo('Payment URL response:', response.data);

      if (!response.data.success || !response.data.data.payment_url) {
        throw new Error(response.data.message || 'Gagal mendapatkan URL pembayaran');
      }

      return response.data.data.payment_url;
    } catch (error: any) {
      logError('Error saat mengambil URL pembayaran', error);

      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const message = error.response?.data?.message || error.message;

        switch (statusCode) {
          case 401:
            throw new Error('Silakan login terlebih dahulu');
          case 404:
            throw new Error('Order tidak ditemukan');
          case 500:
            throw new Error('Terjadi kesalahan pada server');
          default:
            throw new Error(`Terjadi kesalahan: ${message}`);
        }
      }

      throw new Error('Terjadi kesalahan saat mengambil URL pembayaran');
    }
  },

  // Create order (update dengan callback URLs)
  createOrder: async (orderData: CreateOrderRequest): Promise<ApiResponse<OrderResponse>> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }

      // Validasi data sebelum dikirim
      if (!orderData.store_id) {
        throw new Error('store_id harus diisi');
      }

      if (!orderData.items || orderData.items.length === 0) {
        throw new Error('items tidak boleh kosong');
      }

      // Validasi setiap item
      orderData.items.forEach((item, index) => {
        if (!item.menu_id) {
          throw new Error(`menu_id pada item ke-${index + 1} harus diisi`);
        }
        if (typeof item.quantity !== 'number' || item.quantity < 1) {
          throw new Error(`quantity pada item ke-${index + 1} harus lebih dari 0`);
        }
      });

      // Format data sesuai dengan yang diharapkan backend
      const requestBody = {
        ...orderData // Gunakan data dari screen tanpa modifikasi
      };

      logInfo('Membuat pesanan dengan data:', requestBody);

      const response = await axios.post<ApiResponse<OrderResponse>>(
        `${API_BASE_URL}/orders`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        }
      );

      logInfo('Response pembuatan pesanan:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Gagal membuat pesanan');
      }

      return response.data;
    } catch (error: any) {
      logError('Error saat membuat pesanan', error);

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
          case 401:
            throw new Error('Silakan login terlebih dahulu');
          case 404:
            throw new Error('Toko atau menu tidak ditemukan');
          case 500:
            logError('Server error details:', error.response?.data);
            throw new Error('Terjadi kesalahan pada server. Silakan coba lagi nanti');
          default:
            throw new Error(`Terjadi kesalahan: ${message}`);
        }
      }

      throw new Error('Terjadi kesalahan saat membuat pesanan');
    }
  },

  // Get stores
  getStores: async (): Promise<Store[]> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }

      logInfo('Memulai fetch stores');

      const response = await axios.get<ApiResponse<{ stores: Store[] }>>(
        `${API_BASE_URL}/stores`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        }
      );

      logInfo('Response stores:', response.data);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Gagal memuat daftar toko');
      }

      if (!response.data.data?.stores || !Array.isArray(response.data.data.stores)) {
        throw new Error('Format data toko tidak valid');
      }

      return response.data.data.stores;
    } catch (error: any) {
      logError('Error saat memuat daftar toko', error);
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const message = error.response?.data?.message || error.message;

        switch (statusCode) {
          case 401:
            throw new Error('Silakan login terlebih dahulu');
          case 403:
            throw new Error('Anda tidak memiliki akses');
          case 404:
            throw new Error('Data toko tidak ditemukan');
          case 500:
            throw new Error('Terjadi kesalahan pada server');
          default:
            throw new Error(`Terjadi kesalahan: ${message}`);
        }
      }
      throw new Error('Terjadi kesalahan saat memuat daftar toko');
    }
  },
};

export default menuService; 