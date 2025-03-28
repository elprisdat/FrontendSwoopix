import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL API
const API_BASE_URL = 'http://10.0.2.2:8000/api/v1';

// Interfaces
export interface OrderItem {
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
  store: {
    name: string;
    address: string;
  };
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
  items: OrderItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// Helper untuk logging
const logError = (message: string, error: any) => {
  console.error(`[Order Service Error] ${message}:`, error);
};

const logInfo = (message: string, data?: any) => {
  console.log(`[Order Service Info] ${message}`, data || '');
};

export const orderService = {
  // Get order history
  getOrders: async (): Promise<Order[]> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }

      logInfo('Memulai fetch order history');

      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      logInfo('Status response order history:', response.status);

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
      logInfo('Response order history:', data);

      if (!data.success) {
        throw new Error(data.message || 'Gagal memuat riwayat pesanan');
      }

      return data.data.orders;
    } catch (error: any) {
      logError('Error saat memuat riwayat pesanan', error);
      throw error;
    }
  },

  // Get order detail
  getOrderDetail: async (orderId: string): Promise<Order> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }

      logInfo('Memulai fetch order detail:', orderId);

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      logInfo('Status response order detail:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token tidak valid atau expired');
        } else if (response.status === 403) {
          throw new Error('Tidak memiliki akses');
        } else if (response.status === 404) {
          throw new Error('Pesanan tidak ditemukan');
        } else if (response.status === 500) {
          throw new Error('Terjadi kesalahan pada server');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logInfo('Response order detail:', data);

      if (!data.success) {
        throw new Error(data.message || 'Gagal memuat detail pesanan');
      }

      return data.data.order;
    } catch (error: any) {
      logError('Error saat memuat detail pesanan', error);
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (orderId: string): Promise<void> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }

      logInfo('Memulai cancel order:', orderId);

      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      logInfo('Status response cancel order:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Token tidak valid atau expired');
        } else if (response.status === 403) {
          throw new Error('Tidak memiliki akses');
        } else if (response.status === 404) {
          throw new Error('Pesanan tidak ditemukan');
        } else if (response.status === 500) {
          throw new Error('Terjadi kesalahan pada server');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      logInfo('Response cancel order:', data);

      if (!data.success) {
        throw new Error(data.message || 'Gagal membatalkan pesanan');
      }
    } catch (error: any) {
      logError('Error saat membatalkan pesanan', error);
      throw error;
    }
  }
};

export default orderService; 