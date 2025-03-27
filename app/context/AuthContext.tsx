import React, { createContext, useContext, useState } from 'react';
import { router } from 'expo-router';
import authService from '../services/auth';

interface AuthContextType {
  registerPhone: string;
  setRegisterPhone: (phone: string) => void;
  clearRegisterData: () => void;
  verifyOTP: (otp: string) => Promise<void>;
  login: (phone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, password: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [registerPhone, setRegisterPhone] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const clearRegisterData = () => {
    setRegisterPhone('');
  };

  const verifyOTP = async (otp: string) => {
    try {
      const response = await authService.verifyOTP({ 
        phone: registerPhone, 
        otp 
      });
      
      if (response.success) {
        clearRegisterData();
        router.replace('/login');
      } else {
        throw new Error(response.message || 'Verifikasi OTP gagal');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Terjadi kesalahan saat verifikasi OTP');
    }
  };

  const login = async (phone: string, password: string) => {
    try {
      const response = await authService.login({ phone, password });
      if (response.success) {
        setIsAuthenticated(true);
        router.replace('/home');
      } else {
        throw new Error(response.message || 'Login gagal');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Terjadi kesalahan saat login');
    }
  };

  const register = async (name: string, phone: string, password: string) => {
    try {
      const response = await authService.register({
        name,
        phone,
        password,
      });
      
      if (response.success) {
        setRegisterPhone(phone);
        router.push('/verify-otp');
      } else {
        throw new Error(response.message || 'Registrasi gagal');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Terjadi kesalahan saat mendaftar');
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        registerPhone, 
        setRegisterPhone, 
        clearRegisterData,
        verifyOTP,
        login,
        register,
        isAuthenticated
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider; 