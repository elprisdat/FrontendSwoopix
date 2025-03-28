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
} from 'react-native';
import { Link } from 'expo-router';
import { globalStyles, colors } from '../../constants/styles';
import { useAuth } from '../../context/AuthContext';
import CustomAlert from '../common/CustomAlert';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertConfig {
  title: string;
  message: string;
  type: AlertType;
}

export default function LoginForm() {
  const [phoneNumber, setPhoneNumber] = useState('');
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
    try {
      setLoading(true);
      
      if (!phoneNumber || !password) {
        setAlertConfig({
          title: 'Data Tidak Lengkap',
          message: 'Nomor telepon dan password harus diisi',
          type: 'warning',
        });
        setShowAlert(true);
        return;
      }

      await login(phoneNumber, password);
    } catch (err: any) {
      setAlertConfig({
        title: 'Login Gagal',
        message: err.message || 'Terjadi kesalahan saat login',
        type: 'error',
      });
      setShowAlert(true);
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
            value={phoneNumber}
            onChangeText={setPhoneNumber}
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
            style={globalStyles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={globalStyles.buttonText}>Login</Text>
            )}
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