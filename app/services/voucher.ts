import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://10.0.2.2:8000/api/v1'; // untuk Android Emulator
// const BASE_URL = 'http://192.168.x.x:8000/api/v1'; // untuk perangkat fisik

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Interface sesuai dengan API backend
interface ApiVoucher {
  id: string;
  code: string;
  // Sesuai backend atual
  discount_type?: 'percentage' | 'fixed';
  discount_value?: string;
  minimum_purchase?: string;
  // Sesuai dokumentasi API
  type?: 'percentage' | 'fixed';
  value?: string;
  min_order?: string;
  // Field-field lain
  max_discount: string | null;
  max_usage: number;
  used_count: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: null | string;
}

// Interface untuk digunakan dalam aplikasi
interface Voucher {
  id: string;
  code: string;
  name: string;
  description: string;
  discount: number;
  min_purchase: number;
  valid_until: string;
  is_used: boolean;
}

// Transform dari API ke format aplikasi
function transformVoucher(apiVoucher: ApiVoucher): Voucher {
  console.log('Transform voucher data:', apiVoucher);
  
  // Menangani kedua kemungkinan nama field
  const discountType = apiVoucher.discount_type || apiVoucher.type || 'fixed';
  const discountValue = parseFloat(apiVoucher.discount_value || apiVoucher.value || '0');
  const minPurchase = parseFloat(apiVoucher.minimum_purchase || apiVoucher.min_order || '0');
  
  const isUsed = apiVoucher.used_count > 0;
  
  let name: string;
  let description: string;
  
  if (discountType === 'percentage') {
    name = `Diskon ${discountValue}%`;
    description = `Hemat hingga ${apiVoucher.max_discount ? parseFloat(apiVoucher.max_discount).toLocaleString() : 'unlimited'}`;
  } else {
    name = `Diskon Rp${discountValue.toLocaleString()}`;
    description = 'Potongan langsung';
  }
  
  return {
    id: apiVoucher.id,
    code: apiVoucher.code,
    name,
    description,
    discount: discountValue,
    min_purchase: minPurchase,
    valid_until: apiVoucher.end_date,
    is_used: isUsed
  };
}

const voucherService = {
  getVouchers: async (): Promise<{ success: boolean; data: Voucher[]; message?: string }> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.log('Token tidak ditemukan');
        return { success: false, data: [], message: 'Token tidak ditemukan' };
      }
      
      console.log('Mulai fetch vouchers');
      const response = await axios.get(`${BASE_URL}/vouchers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('Response API vouchers raw:', response.data);
      
      // Validasi respons yang ketat
      if (!response || !response.data) {
        console.log('Response kosong');
        return { success: false, data: [], message: 'Response kosong' };
      }
      
      // Cek success flag
      if (response.data && response.data.success) {
        console.log('Success true');
        
        let vouchersArray: ApiVoucher[] = [];
        
        // Cek berbagai kemungkinan struktur data
        if (response.data.data) {
          if (Array.isArray(response.data.data)) {
            // Data langsung berupa array
            vouchersArray = response.data.data;
          } else if (response.data.data.vouchers && Array.isArray(response.data.data.vouchers)) {
            // Data dalam objek dengan property vouchers
            vouchersArray = response.data.data.vouchers;
          } else if (typeof response.data.data === 'object') {
            // Data yang tidak terduga, coba ekstrak nilai object
            const possibleArrays = Object.values(response.data.data).filter(val => Array.isArray(val));
            if (possibleArrays.length > 0) {
              vouchersArray = possibleArrays[0] as ApiVoucher[];
            }
          }
        }
        
        console.log('Vouchers array extracted:', vouchersArray.length);
        
        if (vouchersArray.length > 0) {
          // Transform vouchers ke format aplikasi
          const transformedVouchers = vouchersArray.map(transformVoucher);
          console.log('Transformed vouchers:', transformedVouchers.length);
          
          return {
            success: true,
            data: transformedVouchers,
            message: response.data.message
          };
        } else {
          console.log('Data vouchers kosong');
          return {
            success: true,
            data: [],
            message: 'Data voucher kosong'
          };
        }
      }
      
      console.log('Response success false:', response.data);
      return {
        success: false,
        data: [],
        message: response.data?.message || 'Format response tidak valid'
      };
    } catch (error: any) {
      console.error('Error fetching vouchers:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Gagal mengambil data voucher'
      };
    }
  },

  useVoucher: async (voucherId: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        return { success: false, message: 'Token tidak ditemukan' };
      }
      
      const response = await axios.post(
        `${BASE_URL}/vouchers/${voucherId}/use`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (response.data && response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Voucher berhasil digunakan'
        };
      }
      
      return {
        success: false,
        message: response.data?.message || 'Format response tidak valid'
      };
    } catch (error: any) {
      console.error('Error using voucher:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal menggunakan voucher'
      };
    }
  },
};

export default voucherService; 