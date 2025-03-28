# Swoopix Frontend Mobile App

Aplikasi mobile untuk manajemen pesanan makanan dan minuman dengan integrasi pembayaran Tripay.

## 🚀 Teknologi yang Digunakan

- React Native dengan Expo
- TypeScript
- React Navigation
- AsyncStorage untuk penyimpanan lokal
- Integrasi Tripay untuk pembayaran

## 📱 Fitur Utama

1. **Manajemen Toko**
   - Daftar toko
   - Detail informasi toko
   - Lokasi toko

2. **Katalog Menu**
   - Daftar menu per toko
   - Detail menu
   - Kategori menu
   - Pencarian menu

3. **Keranjang & Pemesanan**
   - Tambah ke keranjang
   - Ubah jumlah pesanan
   - Checkout pesanan
   - Pilihan metode pembayaran

4. **Riwayat Pesanan**
   - Daftar pesanan
   - Status pesanan real-time
   - Detail pesanan
   - Pembatalan pesanan

5. **Pembayaran**
   - Integrasi Tripay
   - Multiple payment methods
   - Status pembayaran real-time
   - Invoice digital

## 💻 Cara Instalasi

1. **Prasyarat**
   ```bash
   # Pastikan sudah terinstall
   - Node.js (versi 14 atau lebih tinggi)
   - npm atau yarn
   - Expo CLI
   - Android Studio (untuk emulator)
   ```

2. **Clone Repository**
   ```bash
   git clone https://github.com/username/FrontendSwoopix.git
   cd FrontendSwoopix
   ```

3. **Install Dependencies**
   ```bash
   npm install
   # atau
   yarn install
   ```

4. **Setup Environment**
   ```bash
   # Copy file .env.example
   cp .env.example .env

   # Isi variabel yang diperlukan
   API_BASE_URL=http://your-api-url
   TRIPAY_API_KEY=your-tripay-api-key
   ```

## 🎯 Cara Menjalankan

1. **Development Mode**
   ```bash
   # Start development server
   npm start
   # atau
   yarn start
   ```

2. **Running di Emulator**
   ```bash
   # Android
   npm run android
   # atau
   yarn android

   # iOS
   npm run ios
   # atau
   yarn ios
   ```

3. **Running di Device Fisik**
   - Install Expo Go di device
   - Scan QR Code yang muncul di terminal
   - Pastikan device dan komputer dalam jaringan yang sama

## 📁 Struktur Kode

```
app/
├── components/         # Reusable components
│   ├── common/        # Shared components (Alert, Button, etc)
│   └── layout/        # Layout components (Header, TabBar, etc)
├── constants/         # Constants dan konfigurasi
├── services/          # API services
├── hooks/            # Custom hooks
├── types/            # TypeScript types/interfaces
└── screens/          # Screen components
```

## 🔄 Alur Kerja Services

### 1. Order Service (`services/order.ts`)
```typescript
// Mengambil riwayat pesanan
const orders = await orderService.getOrders();

// Mengambil detail pesanan
const detail = await orderService.getOrderDetail(orderId);

// Membatalkan pesanan
await orderService.cancelOrder(orderId);
```

### 2. Menu Service (`services/menu.ts`)
```typescript
// Mengambil daftar menu
const menus = await menuService.getMenus(storeId);

// Membuat pesanan
const order = await menuService.createOrder({
  store_id: "1",
  items: [{menu_id: "1", quantity: 2}],
  payment_method: "CASH"
});
```

## 🔐 Autentikasi

Aplikasi menggunakan token-based authentication:
- Token disimpan di AsyncStorage
- Setiap request API menyertakan token di header
- Auto-logout jika token expired
- Refresh token mechanism

## 🎨 UI/UX Features

1. **Loading States**
   - Skeleton loading
   - Loading indicators
   - Pull-to-refresh

2. **Error Handling**
   - Error boundaries
   - Custom error messages
   - Retry mechanisms

3. **Responsive Design**
   - Adaptive layouts
   - Dynamic sizing
   - Cross-platform compatibility

## 📝 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run e2e
```

## 🔍 Debugging

1. **React Native Debugger**
   - Network requests
   - Redux state
   - Component hierarchy

2. **Console Logging**
   - Service layer logging
   - Error tracking
   - Performance monitoring

## 📱 Build & Deploy

```bash
# Build Android APK
eas build -p android --profile preview

# Build iOS IPA
eas build -p ios --profile preview
```

## 🤝 Kontribusi

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Kontak

Your Name - [@yourtwitter](https://twitter.com/yourtwitter) - email@example.com

Project Link: [https://github.com/username/FrontendSwoopix](https://github.com/username/FrontendSwoopix)
