import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface TabLayoutProps {
  children: React.ReactNode;
  activeTab: 'home' | 'menu' | 'orders' | 'profile';
}

export default function TabLayout({ children, activeTab }: TabLayoutProps) {
  return (
    <View style={styles.container}>
      {children}
      
      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'home' && styles.activeNavItem]}
          onPress={() => router.push('/home' as any)}
        >
          <Ionicons 
            name={activeTab === 'home' ? 'home' : 'home-outline'} 
            size={24} 
            color={activeTab === 'home' ? '#000000' : '#666666'} 
          />
          <Text style={[styles.navText, activeTab === 'home' && styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'menu' && styles.activeNavItem]}
          onPress={() => router.push('/menu' as any)}
        >
          <Ionicons 
            name={activeTab === 'menu' ? 'restaurant' : 'restaurant-outline'} 
            size={24} 
            color={activeTab === 'menu' ? '#000000' : '#666666'} 
          />
          <Text style={[styles.navText, activeTab === 'menu' && styles.activeNavText]}>Menu</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'orders' && styles.activeNavItem]}
          onPress={() => router.push('/orders' as any)}
        >
          <Ionicons 
            name={activeTab === 'orders' ? 'receipt' : 'receipt-outline'} 
            size={24} 
            color={activeTab === 'orders' ? '#000000' : '#666666'} 
          />
          <Text style={[styles.navText, activeTab === 'orders' && styles.activeNavText]}>Order</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'profile' && styles.activeNavItem]}
          onPress={() => router.push('/profile' as any)}
        >
          <Ionicons 
            name={activeTab === 'profile' ? 'person' : 'person-outline'} 
            size={24} 
            color={activeTab === 'profile' ? '#000000' : '#666666'} 
          />
          <Text style={[styles.navText, activeTab === 'profile' && styles.activeNavText]}>Me</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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