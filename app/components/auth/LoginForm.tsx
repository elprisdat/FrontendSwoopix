import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { globalStyles, colors } from '../../constants/styles';
import { useAuth } from '../../context/AuthContext';
import CustomAlert from '../common/CustomAlert';
import { api, BASE_URL } from '../../../utils/api';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertConfig {
  title: string;
  message: string;
  type: AlertType;
}

interface LoginFormProps {
  onLoginSuccess: (userData: any) => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    title: '',
    message: '',
    type: 'error',
  });
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Mohon isi nomor telepon dan password');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/login', {
        phone,
        password,
      });

      if (response.data.success) {
        onLoginSuccess(response.data.data);
      } else {
        Alert.alert('Error', response.data.message || 'Login gagal');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan saat login';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={globalStyles.container}
    >
      <ScrollView 
        contentContainerStyle={globalStyles.formContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={globalStyles.appTitle}>SWOOPIX</Text>
        <Text style={globalStyles.appSubtitle}>Selamat datang di Swoopix</Text>

        <View style={globalStyles.formSection}>
          <Text style={globalStyles.title}>Login</Text>
          <Text style={globalStyles.subtitle}>
            Masukkan nomor telepon dan password Anda untuk melanjutkan
          </Text>

          <TextInput
            style={[
              globalStyles.input,
              focusedInput === 'phone' && globalStyles.inputFocused
            ]}
            placeholder="Nomor Telepon"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoCapitalize="none"
            onFocus={() => setFocusedInput('phone')}
            onBlur={() => setFocusedInput('')}
            placeholderTextColor={colors.textSecondary}
          />

          <TextInput
            style={[
              globalStyles.input,
              focusedInput === 'password' && globalStyles.inputFocused
            ]}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            onFocus={() => setFocusedInput('password')}
            onBlur={() => setFocusedInput('')}
            placeholderTextColor={colors.textSecondary}
          />

          <TouchableOpacity
            style={[globalStyles.button, loading && globalStyles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={globalStyles.buttonText}>
              {loading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                'Login'
              )}
            </Text>
          </TouchableOpacity>

          <Link href="/register" asChild>
            <TouchableOpacity style={globalStyles.linkButton}>
              <Text style={globalStyles.linkText}>
                Belum punya akun? Daftar sekarang
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>

      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setShowAlert(false)}
      />
    </KeyboardAvoidingView>
  );
} 