import { View } from 'react-native';
import VerifyOTPForm from './components/auth/VerifyOTPForm';
import { Stack } from 'expo-router';
import { colors } from './constants/styles';

export default function VerifyOTPScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      <VerifyOTPForm />
    </View>
  );
} 