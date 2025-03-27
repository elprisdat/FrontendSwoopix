import React, { useState, useRef, useEffect } from 'react';
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
import { router } from 'expo-router';
import { globalStyles, colors } from '../../constants/styles';
import { useAuth } from '../../context/AuthContext';
import CustomAlert from '../common/CustomAlert';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertConfig {
  title: string;
  message: string;
  type: AlertType;
}

export default function VerifyOTPForm() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(-1);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    title: '',
    message: '',
    type: 'error',
  });
  const { verifyOTP, registerPhone } = useAuth();
  
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (!registerPhone) {
      router.replace('/register');
    }
  }, [registerPhone]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      value = value[value.length - 1];
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setLoading(true);

      const otpCode = otp.join('');
      if (otpCode.length !== 6) {
        setAlertConfig({
          title: 'Kode OTP Tidak Lengkap',
          message: 'Kode OTP harus 6 digit',
          type: 'warning',
        });
        setShowAlert(true);
        return;
      }

      await verifyOTP(otpCode);
    } catch (err: any) {
      setAlertConfig({
        title: 'Verifikasi Gagal',
        message: err.message || 'Terjadi kesalahan saat verifikasi OTP',
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
          <Text style={globalStyles.title}>Verifikasi OTP</Text>
          <Text style={globalStyles.subtitle}>
            Masukkan kode OTP yang telah dikirim ke nomor {registerPhone}
          </Text>

          <View style={globalStyles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => inputRefs.current[index] = ref}
                style={[
                  globalStyles.otpInput,
                  focusedInput === index && globalStyles.otpInputFocused
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                keyboardType="number-pad"
                maxLength={1}
                onFocus={() => setFocusedInput(index)}
                onBlur={() => setFocusedInput(-1)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                placeholderTextColor={colors.textSecondary}
              />
            ))}
          </View>

          <TouchableOpacity
            style={globalStyles.button}
            onPress={handleVerifyOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={globalStyles.buttonText}>Verifikasi</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={globalStyles.linkButton}
            onPress={() => router.replace('/register')}
          >
            <Text style={globalStyles.linkText}>
              Ubah nomor telepon
            </Text>
          </TouchableOpacity>
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