import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { globalStyles, colors } from './constants/styles';
import profileService from './services/profile';
import locationService from './services/location';
import TabLayout from './components/layout/TabLayout';

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
}

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
      setLoading(true);
      setError(null);
      
      // Fetch profile
      const profileResponse = await profileService.getProfile();
      if (profileResponse.success && profileResponse.data?.user) {
        setProfile(profileResponse.data.user);
      }

      // Get location and fetch nearby stores
      const location = await locationService.getCurrentLocation();
      const storesResponse = await locationService.getNearbyStores(location.latitude, location.longitude);
      if (storesResponse.success && storesResponse.data?.stores) {
        setNearbyStores(storesResponse.data.stores);
      }

      // Get weather recommendations
      const weatherResponse = await locationService.getWeatherRecommendations(location.latitude, location.longitude);
      if (weatherResponse.success && weatherResponse.data) {
        setWeatherRecommendations(weatherResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Gagal memuat data. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, []);

  if (loading && !refreshing) {
    return (
      <TabLayout activeTab="home">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Memuat data lokasi...</Text>
        </View>
      </TabLayout>
    );
  }

  if (error) {
    return (
      <TabLayout activeTab="home">
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </TabLayout>
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
        <View style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={styles.profileSection}>
              <View>
                <Text style={styles.greeting}>Hi, {profile?.name || 'User'}</Text>
                <Text style={styles.subGreeting}>Selamat datang di Swoopix</Text>
              </View>
              <View style={styles.pointsContainer}>
                <Text style={styles.points}>0</Text>
                <Text style={styles.pointsLabel}>pts</Text>
              </View>
            </View>
            
            {/* Weather Info */}
            {weatherRecommendations && (
              <View style={styles.weatherContainer}>
                <View style={styles.weatherInfo}>
                  <Ionicons name="thermometer-outline" size={24} color="#FFFFFF" />
                  <Text style={styles.weatherText}>
                    {Math.round(weatherRecommendations.weather.temp)}°C
                  </Text>
                </View>
                <Text style={styles.weatherDescription}>
                  {weatherRecommendations.weather.weather.description}
                </Text>
              </View>
            )}
          </View>

          {/* Hero Banner */}
          <View style={styles.heroBanner}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1000&auto=format&fit=crop' }}
              style={styles.heroImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0, 0, 0, 0.3)']}
              style={styles.heroOverlay}
            >
              <Text style={styles.heroTitle}>Special Menu</Text>
              <Text style={styles.heroSubtitle}>Diskon hingga 50%</Text>
              <TouchableOpacity style={styles.heroButton}>
                <Text style={styles.heroButtonText}>Lihat Menu</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
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
        </View>

        {/* Promo Banners */}
        <View style={styles.promoBannersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.promoBannerCard}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop' }}
                style={styles.promoBannerImage}
              />
              <View style={styles.promoBannerContent}>
                <Text style={styles.promoBannerTitle}>Weekend Special</Text>
                <Text style={styles.promoBannerSubtitle}>Diskon 30%</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.promoBannerCard}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop' }}
                style={styles.promoBannerImage}
              />
              <View style={styles.promoBannerContent}>
                <Text style={styles.promoBannerTitle}>Happy Hour</Text>
                <Text style={styles.promoBannerSubtitle}>14:00 - 17:00</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Nearby Stores Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Stores</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/stores' as any)}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
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
        </View>

        {/* Weather Recommendations Section */}
        {weatherRecommendations && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recommended for Today</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/menu' as any)}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {weatherRecommendations.menus.map((menu) => (
                <TouchableOpacity 
                  key={menu.id} 
                  style={styles.menuCard}
                  onPress={() => router.push(`/(tabs)/menu/${menu.id}` as any)}
                >
                  <View style={styles.menuInfo}>
                    <Text style={styles.menuName}>{menu.name}</Text>
                    <Text style={styles.menuPrice}>Rp {menu.price.toLocaleString()}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
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
  },
  heroContent: {
    padding: 16,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'System',
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 16,
    fontFamily: 'System',
    color: '#CCCCCC',
    marginTop: 4,
    letterSpacing: 0.2,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  points: {
    fontSize: 24,
    fontFamily: 'System',
    fontWeight: '900',
    color: '#FFFFFF',
    marginRight: 4,
  },
  pointsLabel: {
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '500',
    color: '#FFFFFF',
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  weatherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  weatherText: {
    fontSize: 22,
    fontFamily: 'System',
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  weatherDescription: {
    fontSize: 16,
    fontFamily: 'System',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  heroBanner: {
    height: 200,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: 'System',
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 18,
    fontFamily: 'System',
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.2,
  },
  heroButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heroButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionText: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: 'System',
    fontWeight: '500',
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
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  promoBannerCard: {
    width: 280,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  promoBannerImage: {
    width: '100%',
    height: '100%',
  },
  promoBannerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  promoBannerTitle: {
    fontSize: 20,
    fontFamily: 'System',
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  promoBannerSubtitle: {
    fontSize: 15,
    fontFamily: 'System',
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

export default HomeScreen; 