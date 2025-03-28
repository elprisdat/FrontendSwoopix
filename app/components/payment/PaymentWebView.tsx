import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { router } from 'expo-router';

interface PaymentWebViewProps {
  paymentUrl: string;
  onClose: () => void;
}

const PaymentWebView: React.FC<PaymentWebViewProps> = ({ paymentUrl, onClose }) => {
  // Handle navigation state change
  const handleNavigationStateChange = (navState: any) => {
    // Cek jika URL mengandung callback success atau failed
    if (navState.url.includes('/payment/success')) {
      onClose();
      router.push('/orders');
    } else if (navState.url.includes('/payment/failed')) {
      onClose();
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: paymentUrl }}
        style={styles.webview}
        onNavigationStateChange={handleNavigationStateChange}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000000" />
          </View>
        )}
        startInLoadingState={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default PaymentWebView; 