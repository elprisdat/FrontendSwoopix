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

export default function RegisterForm() {
  const [name, setName] = useState('');
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
  const { register } = useAuth();

  const handleRegister = async () => {
    try {
      setLoading(true);
      
      if (!name || !phoneNumber || !password) {
        setAlertConfig({
          title: 'Data Tidak Lengkap',
          message: 'Semua field harus diisi',
          type: 'warning',
        });
        setShowAlert(true);
        return;
      }

      const formattedPhone = phoneNumber.startsWith('0') 
        ? `62${phoneNumber.slice(1)}` 
        : phoneNumber.startsWith('62') 
          ? phoneNumber 
          : `62${phoneNumber}`;

      await register(name, formattedPhone, password);
    } catch (err: any) {
      setAlertConfig({
        title: 'Registrasi Gagal',
        message: err.message || 'Terjadi kesalahan saat mendaftar',
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
          <Text style={globalStyles.title}>Daftar</Text>
          <Text style={globalStyles.subtitle}>
            Lengkapi data diri Anda untuk membuat akun baru
          </Text>

          <TextInput
            style={[
              globalStyles.input,
              focusedInput === 'name' && globalStyles.inputFocused
            ]}
            placeholder="Nama Lengkap"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            onFocus={() => setFocusedInput('name')}
            onBlur={() => setFocusedInput('')}
            placeholderTextColor={colors.textSecondary}
          />

          <View style={globalStyles.phoneInputContainer}>
            <Text style={globalStyles.phonePrefix}>+62</Text>
            <TextInput
              style={[
                globalStyles.input,
                globalStyles.phoneInput,
                focusedInput === 'phone' && globalStyles.inputFocused
              ]}
              placeholder="8xxxxxxxxxx"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoCapitalize="none"
              onFocus={() => setFocusedInput('phone')}
              onBlur={() => setFocusedInput('')}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

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
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={globalStyles.buttonText}>Daftar</Text>
            )}
          </TouchableOpacity>

          <Link href="/login" asChild>
            <TouchableOpacity style={globalStyles.linkButton}>
              <Text style={globalStyles.linkText}>
                Sudah punya akun? Login sekarang
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