import { View } from 'react-native';
import LoginForm from './components/auth/LoginForm';
import { Stack } from 'expo-router';
import { colors } from './constants/styles';

export default function LoginScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      <LoginForm />
    </View>
  );
} 