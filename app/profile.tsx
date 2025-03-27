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
      const res = await authService.logout();
      if (res.success) {
        router.replace('/login');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
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
        {/* Header Profil */}
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person-circle" size={80} color="#FFFFFF" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.name}>{user?.name || 'Pengguna'}</Text>
                <Text style={styles.phone}>{user?.phone || '-'}</Text>
                <Text style={styles.email}>{user?.email || '-'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Statistik */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{orders.length}</Text>
            <Text style={styles.statLabel}>Total Pesanan</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {orders.filter(order => order.status === 'completed').length}
            </Text>
            <Text style={styles.statLabel}>Pesanan Selesai</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {orders.filter(order => order.status === 'pending').length}
            </Text>
            <Text style={styles.statLabel}>Pesanan Aktif</Text>
          </View>
        </View>

        {/* Riwayat Pesanan */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Riwayat Pesanan</Text>
            <TouchableOpacity onPress={() => router.push('/orders' as any)}>
              <Text style={styles.seeAllText}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          
          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>Belum ada pesanan</Text>
            </View>
          ) : (
            <View style={styles.orderList}>
              {orders.map((order) => (
                <TouchableOpacity 
                  key={order.id} 
                  style={styles.orderCard}
                  onPress={() => router.push('/orders' as any)}
                >
                  <View style={styles.orderHeader}>
                    <View style={styles.storeInfo}>
                      {order.store.logo ? (
                        <Image 
                          source={{ uri: order.store.logo }} 
                          style={styles.storeLogo}
                        />
                      ) : (
                        <Ionicons name="storefront-outline" size={24} color={colors.primary} />
                      )}
                      <Text style={styles.storeName}>{order.store.name}</Text>
                    </View>
                    <Text style={[
                      styles.orderStatus,
                      { color: order.status === 'completed' ? colors.success : colors.primary }
                    ]}>
                      {order.status === 'completed' ? 'Selesai' : 'Aktif'}
                    </Text>
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
          <Ionicons name="log-out-outline" size={20} color={colors.background} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
      </ScrollView>

      <CustomAlert
        visible={showLogoutAlert}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar?"
        onClose={() => setShowLogoutAlert(false)}
        onConfirm={confirmLogout}
      />
    </TabLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 100,
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
    backgroundColor: '#000000',
    paddingBottom: 24,
  },
  heroContent: {
    padding: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 28,
    fontFamily: 'System',
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  phone: {
    fontSize: 16,
    fontFamily: 'System',
    color: '#CCCCCC',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    fontFamily: 'System',
    color: '#CCCCCC',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: -20,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'System',
    fontWeight: '900',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'System',
    color: '#666666',
  },
  sectionContainer: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'System',
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
  },
  seeAllText: {
    fontSize: 15,
    fontFamily: 'System',
    fontWeight: '500',
    color: '#666666',
    letterSpacing: 0.2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'System',
    color: '#666666',
    marginTop: 8,
  },
  orderList: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    gap: 8,
  },
  storeLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  storeName: {
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '600',
    color: '#000000',
  },
  orderStatus: {
    fontSize: 14,
    fontFamily: 'System',
    fontWeight: '500',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderDate: {
    fontSize: 14,
    fontFamily: 'System',
    color: '#666666',
  },
  orderPrice: {
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '600',
    color: '#000000',
  },
  logoutButton: {
    margin: 16,
    backgroundColor: '#F44336',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  logoutIcon: {
    marginRight: 4,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  activeNavItem: {
    backgroundColor: '#F5F5F5',
  },
  navText: {
    fontSize: 13,
    fontFamily: 'System',
    fontWeight: '500',
    marginTop: 4,
    color: '#666666',
    letterSpacing: 0.2,
  },
  activeNavText: {
    color: '#000000',
    fontWeight: '600',
  },
}); 