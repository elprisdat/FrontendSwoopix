import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { globalStyles, colors } from './constants/styles';
import profileService from './services/profile';
import locationService from './services/location';
import TabLayout from './components/layout/TabLayout';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface Store {
  id: string;
  name: string;
  address: string;
  distance: number;
  is_open: boolean;
}

interface WeatherRecommendation {
  weather: {
    temp: number;
    feels_like: number;
    humidity: number;
    weather: {
      id: number;
      main: string;
      description: string;
    };
  };
  conditions: string[];
  menus: Menu[];
}

interface Menu {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  is_available: boolean;
  image_url?: string;
}

// Fungsi helper untuk logging
const logInfo = (message: string, data?: any) => {
  console.log(`[HOME] ${message}`, data ? data : '');
};

const logWarning = (message: string, data?: any) => {
  console.warn(`[HOME] ${message}`, data ? data : '');
};

const logError = (message: string, error: any) => {
  console.error(`[HOME] ${message}`, {
    message: error.message,
    stack: error.stack,
    response: error.response?.data,
    status: error.response?.status,
  });
};

const HomeScreen = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<User | null>(null);
  const [nearbyStores, setNearbyStores] = useState<Store[]>([]);
  const [weatherRecommendations, setWeatherRecommendations] = useState<WeatherRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      logInfo('Memulai fetch data...');
      setLoading(true);
      setError(null);
      
      // Fetch profile
      logInfo('Mengambil data profil...');
      const profileResponse = await profileService.getProfile();
      if (profileResponse.success && profileResponse.data?.user) {
        setProfile(profileResponse.data.user);
        logInfo('Data profil berhasil diambil', { name: profileResponse.data.user.name });
      }

      // Get location and fetch nearby stores
      logInfo('Mendapatkan lokasi dan data toko terdekat...');
      const location = await locationService.getCurrentLocation();
      const storesResponse = await locationService.getNearbyStores(location.latitude, location.longitude);
      if (storesResponse.success && storesResponse.data?.stores) {
        setNearbyStores(storesResponse.data.stores);
        logInfo('Data toko terdekat berhasil diambil', { 
          count: storesResponse.data.stores.length 
        });
      }

      // Get weather recommendations
      logInfo('Mengambil rekomendasi menu berdasarkan cuaca...');
      const weatherResponse = await locationService.getWeatherRecommendations(location.latitude, location.longitude);
      if (weatherResponse.success && weatherResponse.data) {
        setWeatherRecommendations(weatherResponse.data);
        logInfo('Data rekomendasi menu berhasil diambil', {
          temp: weatherResponse.data.weather.temp,
          menuCount: weatherResponse.data.menus.length
        });
      }

      logInfo('Semua data berhasil diambil');
    } catch (error: any) {
      logError('Gagal memuat data', error);
      setError('Gagal memuat data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    logInfo('Home screen mounted, memulai fetch data...');
    fetchData();
    return () => {
      logInfo('Home screen unmounted');
    };
  }, []);

  const onRefresh = useCallback(() => {
    logInfo('Memulai refresh data...');
    setRefreshing(true);
    fetchData().finally(() => {
      setRefreshing(false);
      logInfo('Refresh data selesai');
    });
  }, []);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <Text style={styles.loadingText}>Memuat data lokasi...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TabLayout activeTab="home">
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Section */}
        <Animated.View 
          entering={FadeInDown.duration(1000).springify()}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <View style={styles.profileSection}>
              <View>
                <Text style={styles.greeting}>Hi, {profile?.name || 'User'}</Text>
                <Text style={styles.subGreeting}>Selamat datang di Swoopix</Text>
              </View>
              <Animated.View 
                entering={FadeInDown.delay(200).duration(1000).springify()}
                style={styles.pointsContainer}
              >
                <Text style={styles.points}>0</Text>
                <Text style={styles.pointsLabel}>pts</Text>
              </Animated.View>
            </View>
            
            {/* Weather Info */}
            {weatherRecommendations && (
              <Animated.View 
                entering={FadeInDown.delay(400).duration(1000).springify()}
                style={styles.weatherContainer}
              >
                <View style={styles.weatherInfo}>
                  <Ionicons name="thermometer-outline" size={24} color="#FFFFFF" />
                  <Text style={styles.weatherText}>
                    {Math.round(weatherRecommendations.weather.temp)}°C
                  </Text>
                </View>
                <Text style={styles.weatherDescription}>
                  {weatherRecommendations.weather.weather.description}
                </Text>
              </Animated.View>
            )}
          </View>

          {/* Hero Banner */}
          <Animated.View 
            entering={FadeInDown.delay(600).duration(1000).springify()}
            style={styles.heroBanner}
          >
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000&auto=format&fit=crop' }}
              style={styles.heroImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
              style={styles.heroOverlay}
            >
              <Text style={styles.heroTitle}>Special Menu</Text>
              <Text style={styles.heroSubtitle}>Diskon hingga 50%</Text>
              <TouchableOpacity style={styles.heroButton}>
                <Text style={styles.heroButtonText}>Lihat Menu</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View 
          entering={FadeInDown.delay(800).duration(1000).springify()}
          style={styles.actionsContainer}
        >
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/menu' as any)}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="restaurant-outline" size={24} color="#000000" />
            </View>
            <Text style={styles.actionText}>Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/delivery' as any)}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="bicycle-outline" size={24} color="#000000" />
            </View>
            <Text style={styles.actionText}>Delivery</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/stores' as any)}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="location-outline" size={24} color="#000000" />
            </View>
            <Text style={styles.actionText}>Stores</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/orders' as any)}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="receipt-outline" size={24} color="#000000" />
            </View>
            <Text style={styles.actionText}>Orders</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Promo Banners */}
        <Animated.View 
          entering={FadeInDown.delay(1000).duration(1000).springify()}
          style={styles.promoBannersContainer}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.promoBannerCard}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop' }}
                style={styles.promoBannerImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
                style={styles.promoBannerContent}
              >
                <Text style={styles.promoBannerTitle}>Weekend Special</Text>
                <Text style={styles.promoBannerSubtitle}>Diskon 30%</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.promoBannerCard}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop' }}
                style={styles.promoBannerImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
                style={styles.promoBannerContent}
              >
                <Text style={styles.promoBannerTitle}>Happy Hour</Text>
                <Text style={styles.promoBannerSubtitle}>14:00 - 17:00</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>

        {/* Nearby Stores Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Stores</Text>
            <TouchableOpacity onPress={() => router.push('/stores' as any)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {nearbyStores.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {nearbyStores.map((store) => (
                <TouchableOpacity 
                  key={store.id} 
                  style={styles.storeCard}
                  onPress={() => router.push(`/(tabs)/stores/${store.id}` as any)}
                >
                  <View style={styles.storeInfo}>
                    <Text style={styles.storeName}>{store.name}</Text>
                    <Text style={styles.storeAddress}>{store.address}</Text>
                    <Text style={styles.storeDistance}>{store.distance.toFixed(1)} km</Text>
                  </View>
                  <View style={[styles.storeStatus, { backgroundColor: store.is_open ? '#4CAF50' : '#F44336' }]}>
                    <Text style={styles.storeStatusText}>
                      {store.is_open ? 'Open' : 'Closed'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="location-outline" size={48} color="#666666" />
              <Text style={styles.emptyStateText}>Tidak ada toko terdekat</Text>
              <Text style={styles.emptyStateSubText}>Coba ubah lokasi atau perbesar radius pencarian</Text>
            </View>
          )}
        </View>

        {/* Weather Recommendations Section */}
        {weatherRecommendations && (
          <Animated.View 
            entering={FadeInDown.delay(1200).duration(1000).springify()}
            style={styles.recommendedSection}
          >
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Recommended for Today</Text>
                <Text style={styles.sectionSubtitle}>Berdasarkan cuaca {weatherRecommendations.weather.weather.description}</Text>
              </View>
              <TouchableOpacity 
                style={styles.seeAllButton}
                onPress={() => router.push('/(tabs)/menu' as any)}
              >
                <Text style={styles.seeAllText}>Lihat Semua</Text>
                <Ionicons name="arrow-forward" size={16} color="#666666" />
              </TouchableOpacity>
            </View>

            {weatherRecommendations.menus.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recommendedScrollContent}
              >
                {weatherRecommendations.menus.map((menu) => (
                  <TouchableOpacity 
                    key={menu.id} 
                    style={styles.recommendedCard}
                    onPress={() => router.push(`/(tabs)/menu/${menu.id}` as any)}
                  >
                    <Image 
                      source={{ 
                        uri: menu.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' 
                      }}
                      style={styles.recommendedImage}
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
                      style={styles.recommendedOverlay}
                    >
                      <View style={styles.recommendedInfo}>
                        <Text style={styles.recommendedName} numberOfLines={2}>
                          {menu.name}
                        </Text>
                        <Text style={styles.recommendedDescription} numberOfLines={2}>
                          {menu.description}
                        </Text>
                        <View style={styles.recommendedBottom}>
                          <Text style={styles.recommendedPrice}>
                            Rp {menu.price.toLocaleString()}
                          </Text>
                          <View style={styles.recommendedBadge}>
                            <Ionicons name="flash" size={14} color="#FFFFFF" />
                            <Text style={styles.recommendedBadgeText}>Recommended</Text>
                          </View>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="restaurant-outline" size={48} color="#666666" />
                <Text style={styles.emptyStateText}>Tidak ada rekomendasi menu</Text>
                <Text style={styles.emptyStateSubText}>Coba lagi nanti</Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* Mission/Promo Section */}
        <View style={styles.missionContainer}>
          <View style={styles.missionHeader}>
            <Text style={styles.missionTitle}>Special Offers</Text>
            <Text style={styles.missionDate}>Ends on 31/12/2024</Text>
          </View>

          <TouchableOpacity style={styles.missionCard}>
            <View style={styles.missionInfo}>
              <View style={styles.freeTag}>
                <Text style={styles.freeTagText}>FREE</Text>
              </View>
              <Text style={styles.missionName}>Buy 1 Get 1 Free</Text>
            </View>
            <TouchableOpacity style={styles.startButton}>
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </TabLayout>
  );
};

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  heroSection: {
    backgroundColor: '#000000',
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  heroContent: {
    padding: 20,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 32,
    fontFamily: 'System',
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 4,
  },
  subGreeting: {
    fontSize: 16,
    fontFamily: 'System',
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 0.5,
  },
  pointsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  points: {
    fontSize: 28,
    fontFamily: 'System',
    fontWeight: '900',
    color: '#FFFFFF',
    marginRight: 4,
  },
  pointsLabel: {
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  weatherText: {
    fontSize: 24,
    fontFamily: 'System',
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  weatherDescription: {
    fontSize: 16,
    fontFamily: 'System',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'capitalize',
  },
  heroBanner: {
    height: 220,
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontFamily: 'System',
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 20,
    fontFamily: 'System',
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  heroButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 30,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  heroButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    marginTop: -24,
    marginHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButton: {
    alignItems: 'center',
    width: '23%',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'System',
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.2,
  },
  sectionContainer: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: 'System',
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: 'System',
    fontWeight: '600',
    color: '#666666',
    marginRight: 4,
  },
  storeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 17,
    fontFamily: 'System',
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  storeAddress: {
    fontSize: 14,
    fontFamily: 'System',
    color: '#666666',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  storeDistance: {
    fontSize: 13,
    fontFamily: 'System',
    fontWeight: '500',
    color: '#999999',
    letterSpacing: 0.2,
  },
  storeStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  storeStatusText: {
    fontSize: 13,
    fontFamily: 'System',
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    width: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuInfo: {
    flex: 1,
  },
  menuName: {
    fontSize: 17,
    fontFamily: 'System',
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  menuPrice: {
    fontSize: 15,
    fontFamily: 'System',
    fontWeight: '500',
    color: '#666666',
    letterSpacing: 0.2,
  },
  missionContainer: {
    padding: 16,
    marginBottom: 100,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  missionTitle: {
    fontSize: 22,
    fontFamily: 'System',
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
  },
  missionDate: {
    fontSize: 14,
    fontFamily: 'System',
    fontWeight: '500',
    color: '#666666',
    letterSpacing: 0.2,
  },
  missionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  missionInfo: {
    flex: 1,
  },
  freeTag: {
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  freeTagText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'System',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  missionName: {
    fontSize: 17,
    fontFamily: 'System',
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.3,
  },
  startButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'System',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  promoBannersContainer: {
    paddingHorizontal: 20,
    marginVertical: 24,
  },
  promoBannerCard: {
    width: 300,
    height: 140,
    borderRadius: 20,
    marginRight: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  promoBannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  promoBannerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  promoBannerTitle: {
    fontSize: 24,
    fontFamily: 'System',
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  promoBannerSubtitle: {
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '600',
    color: '#666666',
    marginTop: 12,
  },
  emptyStateSubText: {
    fontSize: 14,
    fontFamily: 'System',
    color: '#999999',
    marginTop: 4,
    textAlign: 'center',
  },
  recommendedSection: {
    paddingVertical: 24,
  },
  recommendedScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  recommendedCard: {
    width: 280,
    height: 320,
    marginRight: 16,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  recommendedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  recommendedOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  recommendedInfo: {
    width: '100%',
  },
  recommendedName: {
    fontSize: 20,
    fontFamily: 'System',
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  recommendedDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  recommendedBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendedPrice: {
    fontSize: 18,
    fontFamily: 'System',
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedBadgeText: {
    fontSize: 12,
    fontFamily: 'System',
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
});

export default HomeScreen; 