import { View } from 'react-native';
import RegisterForm from './components/auth/RegisterForm';
import { Stack } from 'expo-router';
import { colors } from './constants/styles';

export default function RegisterScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      <RegisterForm />
    </View>
  );
} 