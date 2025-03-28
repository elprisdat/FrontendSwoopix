import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Image,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import storeService, { Store } from './services/store';
import TabLayout from './components/layout/TabLayout';

const { width } = Dimensions.get('window');

export default function StoresScreen() {
  const [stores, setStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await storeService.getAllStores();
      if (response.success && response.data) {
        setStores(response.data.stores);
        setFilteredStores(response.data.stores);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mengambil data toko');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    let result = [...stores];
    
    // Filter berdasarkan pencarian
    if (searchQuery) {
      result = result.filter(store => 
        store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        store.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter toko yang buka
    if (showOpenOnly) {
      result = result.filter(store => store.is_open);
    }
    
    setFilteredStores(result);
  }, [searchQuery, showOpenOnly, stores]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStores();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Memuat data toko...</Text>
      </View>
    );
  }

  return (
    <TabLayout activeTab="stores">
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color="#666666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari nama toko atau alamat..."
              placeholderTextColor="#666666"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#666666" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, showOpenOnly && styles.filterButtonActive]}
            onPress={() => setShowOpenOnly(!showOpenOnly)}
          >
            <Ionicons 
              name={showOpenOnly ? "time" : "time-outline"} 
              size={20} 
              color={showOpenOnly ? "#FFFFFF" : "#CCCCCC"} 
            />
            <Text style={[styles.filterButtonText, showOpenOnly && styles.filterButtonTextActive]}>
              Buka Saja
            </Text>
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchStores}>
              <Text style={styles.retryButtonText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={styles.content}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {filteredStores.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="storefront-outline" size={48} color="#666666" />
                <Text style={styles.emptyStateText}>
                  {searchQuery 
                    ? 'Tidak ada toko yang sesuai dengan pencarian'
                    : showOpenOnly 
                      ? 'Tidak ada toko yang sedang buka'
                      : 'Tidak ada toko tersedia'}
                </Text>
                {(searchQuery || showOpenOnly) && (
                  <TouchableOpacity 
                    style={styles.resetButton}
                    onPress={() => {
                      setSearchQuery('');
                      setShowOpenOnly(false);
                    }}
                  >
                    <Text style={styles.resetButtonText}>Reset Filter</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.storeList}>
                {filteredStores.map((store) => (
                  <TouchableOpacity
                    key={store.id}
                    style={styles.storeCard}
                    onPress={() => router.push(`/store/${store.id}` as any)}
                  >
                    <LinearGradient
                      colors={['#ffffff', '#f8f8f8']}
                      style={styles.storeCardContent}
                    >
                      <View style={styles.storeHeader}>
                        <View style={styles.storeInfo}>
                          {store.logo ? (
                            <Image
                              source={{ uri: store.logo }}
                              style={styles.storeLogo}
                            />
                          ) : (
                            <View style={styles.storeLogoPlaceholder}>
                              <Ionicons name="storefront" size={24} color="#000000" />
                            </View>
                          )}
                          <View style={styles.storeDetails}>
                            <Text style={styles.storeName}>{store.name}</Text>
                            <Text style={styles.storeAddress}>{store.address}</Text>
                            <View style={styles.storeContact}>
                              <Ionicons name="call-outline" size={14} color="#666666" />
                              <Text style={styles.storePhone}>{store.phone}</Text>
                            </View>
                          </View>
                        </View>
                        <View style={[
                          styles.storeStatus,
                          { backgroundColor: store.is_open ? '#E8F5E9' : '#FFEBEE' }
                        ]}>
                          <Text style={[
                            styles.storeStatusText,
                            { color: store.is_open ? '#2E7D32' : '#C62828' }
                          ]}>
                            {store.is_open ? 'Buka' : 'Tutup'}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.storeSchedule}>
                        <Ionicons name="time-outline" size={14} color="#666666" />
                        <Text style={styles.scheduleText}>
                          {store.open_time} - {store.close_time}
                        </Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </TabLayout>
  );
}

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
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000000',
  },
  filterContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: '#000000',
  },
  filterButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#CCCCCC',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  resetButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  storeList: {
    padding: 20,
    gap: 16,
  },
  storeCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  storeCardContent: {
    padding: 16,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  storeInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  storeLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  storeLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeDetails: {
    marginLeft: 12,
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  storeContact: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storePhone: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  storeStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 12,
  },
  storeStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  storeSchedule: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  scheduleText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
}); 