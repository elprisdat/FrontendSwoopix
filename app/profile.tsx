import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { colors, globalStyles } from './constants/styles';
import profileService from './services/profile';
import authService from './services/auth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import CustomAlert from './components/common/CustomAlert';
import TabLayout from './components/layout/TabLayout';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  store: {
    name: string;
    logo: string | null;
  };
}

// Komponen sederhana
export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'error' as 'success' | 'error' | 'warning' | 'info'
  });
  
  // Fungsi untuk mengambil data
  const fetchData = async () => {
    console.log('Mengambil data...');
    setLoading(true);
    
    try {
      // Data profil
      const profileRes = await profileService.getProfile();
      if (profileRes.success && profileRes.data) {
        setUser(profileRes.data.user);
        console.log('Profil berhasil diambil');
      }

      // Data order history
      const orderRes = await profileService.getOrders();
      if (orderRes.success && orderRes.data) {
        setOrders(orderRes.data.orders);
        console.log('Order history berhasil diambil');
      }
    } catch (err) {
      console.error('Error mengambil data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Load data saat komponen dipasang
  useEffect(() => {
    console.log('ProfileScreen mounted');
    fetchData();
  }, []);
  
  // Loading indicator
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    setShowLogoutAlert(true);
  };

  const confirmLogout = async () => {
    try {
      const response = await authService.logout();
      if (response.success) {
        router.replace('/login' as any);
      } else {
        showErrorAlert('Gagal logout: ' + response.message);
      }
    } catch (error: any) {
      console.error('Error logging out:', error);
      showErrorAlert(error.message || 'Terjadi kesalahan saat logout');
    }
  };

  // Helper function untuk menampilkan error alert
  const showErrorAlert = (message: string) => {
    setAlertConfig({
      title: 'Error',
      message,
      type: 'error'
    });
    setShowAlert(true);
  };

  // Render komponen
  return (
    <TabLayout activeTab="profile">
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Profil dengan Gradient */}
        <LinearGradient
          colors={['#000000', '#1a1a1a']}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#333333', '#4a4a4a']}
                  style={styles.avatarGradient}
                >
                  <Ionicons name="person" size={40} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                </View>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.name}>{user?.name || 'Pengguna'}</Text>
                <View style={styles.contactInfo}>
                  <Ionicons name="call-outline" size={16} color="#CCCCCC" />
                  <Text style={styles.contactText}>{user?.phone || '-'}</Text>
                </View>
                <View style={styles.contactInfo}>
                  <Ionicons name="mail-outline" size={16} color="#CCCCCC" />
                  <Text style={styles.contactText}>{user?.email || '-'}</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Statistik dengan Cards */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={['#ffffff', '#f8f8f8']}
            style={styles.statsCard}
          >
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{orders.length}</Text>
              <Text style={styles.statLabel}>Total Pesanan</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {orders.filter(order => order.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>Selesai</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {orders.filter(order => order.status === 'pending').length}
              </Text>
              <Text style={styles.statLabel}>Aktif</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Menu Aksi */}
        <View style={styles.actionMenuContainer}>
          <TouchableOpacity style={styles.actionMenuItem}>
            <View style={styles.actionMenuIcon}>
              <Ionicons name="wallet-outline" size={24} color="#000000" />
            </View>
            <View style={styles.actionMenuContent}>
              <Text style={styles.actionMenuTitle}>Dompet Digital</Text>
              <Text style={styles.actionMenuSubtitle}>Rp 0</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionMenuItem}>
            <View style={styles.actionMenuIcon}>
              <Ionicons name="gift-outline" size={24} color="#000000" />
            </View>
            <View style={styles.actionMenuContent}>
              <Text style={styles.actionMenuTitle}>Reward Points</Text>
              <Text style={styles.actionMenuSubtitle}>0 pts</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionMenuItem}>
            <View style={styles.actionMenuIcon}>
              <Ionicons name="ticket-outline" size={24} color="#000000" />
            </View>
            <View style={styles.actionMenuContent}>
              <Text style={styles.actionMenuTitle}>Voucher Saya</Text>
              <Text style={styles.actionMenuSubtitle}>0 voucher aktif</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666666" />
          </TouchableOpacity>
        </View>

        {/* Riwayat Pesanan */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Riwayat Pesanan</Text>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => router.push('/orders' as any)}
            >
              <Text style={styles.seeAllText}>Lihat Semua</Text>
              <Ionicons name="arrow-forward" size={16} color="#666666" />
            </TouchableOpacity>
          </View>
          
          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#666666" />
              <Text style={styles.emptyStateText}>Belum ada pesanan</Text>
              <TouchableOpacity 
                style={styles.emptyStateButton}
                onPress={() => router.push('/menu' as any)}
              >
                <Text style={styles.emptyStateButtonText}>Mulai Pesan</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.orderList}>
              {orders.map((order) => (
                <TouchableOpacity 
                  key={order.id} 
                  style={styles.orderCard}
                  onPress={() => router.push(`/orders/${order.id}` as any)}
                >
                  <LinearGradient
                    colors={['#ffffff', '#f8f8f8']}
                    style={styles.orderCardContent}
                  >
                    <View style={styles.orderHeader}>
                      <View style={styles.storeInfo}>
                        {order.store.logo ? (
                          <Image 
                            source={{ uri: order.store.logo }} 
                            style={styles.storeLogo}
                          />
                        ) : (
                          <View style={styles.storeLogoPlaceholder}>
                            <Ionicons name="storefront" size={20} color="#000000" />
                          </View>
                        )}
                        <Text style={styles.storeName}>{order.store.name}</Text>
                      </View>
                      <View style={[
                        styles.orderStatusBadge,
                        { backgroundColor: order.status === 'completed' ? '#E8F5E9' : '#FFF3E0' }
                      ]}>
                        <Text style={[
                          styles.orderStatusText,
                          { color: order.status === 'completed' ? '#2E7D32' : '#E65100' }
                        ]}>
                          {order.status === 'completed' ? 'Selesai' : 'Aktif'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.orderDetails}>
                      <Text style={styles.orderDate}>
                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </Text>
                      <Text style={styles.orderPrice}>
                        Rp{order.total_price.toLocaleString('id-ID')}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Tombol Logout */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <LinearGradient
            colors={['#ff4b4b', '#ff0000']}
            style={styles.logoutGradient}
          >
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
            <Text style={styles.logoutText}>Keluar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      <CustomAlert
        visible={showLogoutAlert}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar?"
        onClose={() => setShowLogoutAlert(false)}
        onConfirm={confirmLogout}
      />

      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setShowAlert(false)}
      />
    </TabLayout>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  heroSection: {
    paddingTop: 40,
    paddingBottom: 30,
  },
  heroContent: {
    padding: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 2,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  contactText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginLeft: 8,
  },
  statsContainer: {
    padding: 20,
    marginTop: -25,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#EEEEEE',
    marginHorizontal: 15,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
  },
  actionMenuContainer: {
    padding: 20,
  },
  actionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  actionMenuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionMenuContent: {
    flex: 1,
  },
  actionMenuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  actionMenuSubtitle: {
    fontSize: 13,
    color: '#666666',
  },
  sectionContainer: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    color: '#666666',
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#F8F8F8',
    borderRadius: 15,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 12,
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  orderList: {
    gap: 15,
  },
  orderCard: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  orderCardContent: {
    padding: 15,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  storeLogoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 12,
  },
  orderStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  orderStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  orderDate: {
    fontSize: 13,
    color: '#666666',
  },
  orderPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  logoutButton: {
    margin: 20,
    marginBottom: 40,
    borderRadius: 30,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
}); 