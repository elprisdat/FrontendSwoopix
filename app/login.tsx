import { View } from 'react-native';
import LoginForm from './components/auth/LoginForm';
import { Stack, router } from 'expo-router';
import { colors } from './constants/styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const handleLoginSuccess = async (userData: any) => {
    try {
      // Simpan token
      await AsyncStorage.setItem('@auth_token', userData.token);
      
      // Simpan data user
      await AsyncStorage.setItem('@user_data', JSON.stringify(userData.user));
      
      // Redirect ke home screen dengan TabLayout
      router.replace('/home');
    } catch (error) {
      console.error('Error menyimpan data login:', error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      <LoginForm onLoginSuccess={handleLoginSuccess} />
    </View>
  );
} 