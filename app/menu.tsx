import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import TabLayout from './components/layout/TabLayout';
import CustomAlert from './components/common/CustomAlert';
import menuService, { Category, MenuItem, PaymentChannel, Store, CreateOrderRequest } from './services/menu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StoreSelector from './components/menu/StoreSelector';
import PaymentWebView from './components/payment/PaymentWebView';

// Interfaces
interface CartItem extends MenuItem {
  quantity: number;
  notes: string;
}

// Helper untuk logging
const logError = (message: string, error: any) => {
  console.error(`[Menu Screen Error] ${message}:`, error);
};

const logInfo = (message: string, data?: any) => {
  console.log(`[Menu Screen Info] ${message}`, data || '');
};

export default function MenuScreen() {
  // States
  const [categories, setCategories] = useState<Category[]>([]);
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
  });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [paymentChannels, setPaymentChannels] = useState<PaymentChannel[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('CASH');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store>();
  const [orderNotes, setOrderNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  // Fetch categories and menus
  const fetchCategories = async () => {
    try {
      const data = await menuService.getCategories();
      setCategories(data);
    } catch (error: any) {
      logError('Error saat memuat kategori', error);
      showErrorAlert('Gagal memuat kategori');
      setCategories([]);
    }
  };

  const fetchMenus = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error state
      
      logInfo('Memulai fetch menu dengan parameter:', {
        kategori: selectedCategory,
        pencarian: searchQuery
      });
      
      const data = await menuService.getMenus(selectedCategory, searchQuery);
      
      logInfo('Menu berhasil dimuat:', {
        jumlahMenu: data.length
      });
      
      setMenus(data);
    } catch (error: any) {
      logError('Error saat memuat menu', error);
      
      let errorMessage = 'Gagal memuat menu';
      if (error.message.includes('Token')) {
        errorMessage = 'Sesi Anda telah berakhir, silakan login kembali';
      } else if (error.message.includes('koneksi')) {
        errorMessage = 'Periksa koneksi internet Anda';
      } else if (error.message.includes('server')) {
        errorMessage = 'Server sedang mengalami gangguan, silakan coba lagi nanti';
      }
      
      setError(errorMessage);
      setMenus([]);
    } finally {
      setLoading(false);
    }
  };

  // Tambahkan retry mechanism
  const retryFetchMenus = async () => {
    logInfo('Mencoba memuat ulang menu');
    await fetchMenus();
  };

  // Fetch payment channels
  const fetchPaymentChannels = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log('Token untuk payment channels:', token ? 'Ada' : 'Tidak ada');
      
      const channels = await menuService.getPaymentChannels();
      console.log('Payment channels:', channels);
      
      setPaymentChannels(channels);
      // Set default payment method jika belum dipilih
      if (!selectedPaymentMethod && channels.length > 0) {
        setSelectedPaymentMethod(channels[0].code);
      }
    } catch (error: any) {
      console.error('Error saat memuat payment channels:', error);
      const errorMessage = error.message || 'Gagal memuat metode pembayaran';
      showErrorAlert(errorMessage);
      
      // Set default ke CASH jika gagal load payment channels
      if (!selectedPaymentMethod) {
        setSelectedPaymentMethod('CASH');
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchPaymentChannels();
  }, []);

  // Cart functions
  const addToCart = (menu: MenuItem) => {
    const existingItem = cart.find(item => item.id === menu.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === menu.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...menu, quantity: 1, notes: '' }]);
    }
    showSuccessAlert('Menu ditambahkan ke keranjang');
    setShowCart(true);
  };

  const updateQuantity = (menuId: string, increment: boolean) => {
    setCart(cart.map(item => {
      if (item.id === menuId) {
        const newQuantity = increment ? item.quantity + 1 : item.quantity - 1;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const updateNotes = (menuId: string, notes: string) => {
    setCart(cart.map(item =>
      item.id === menuId ? { ...item, notes } : item
    ));
  };

  // Alert functions
  const showSuccessAlert = (message: string) => {
    setAlertConfig({
      title: 'Berhasil',
      message,
      type: 'success',
    });
    setShowAlert(true);
  };

  const showErrorAlert = (message: string) => {
    setAlertConfig({
      title: 'Error',
      message,
      type: 'error'
    });
    setShowAlert(true);
  };

  // Payment Modal
  const PaymentMethodModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showPaymentModal}
      onRequestClose={() => setShowPaymentModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.paymentModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pilih Metode Pembayaran</Text>
            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
              <Ionicons name="close" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.paymentList}>
            <TouchableOpacity
              style={[
                styles.paymentOption,
                selectedPaymentMethod === 'CASH' && styles.selectedPayment
              ]}
              onPress={() => {
                setSelectedPaymentMethod('CASH');
                setShowPaymentModal(false);
                handleCheckout();
              }}
            >
              <View style={styles.paymentInfo}>
                <Ionicons name="cash-outline" size={24} color="#000000" />
                <Text style={styles.paymentText}>Tunai</Text>
              </View>
              {selectedPaymentMethod === 'CASH' && (
                <Ionicons name="checkmark-circle" size={24} color="#000000" />
              )}
            </TouchableOpacity>

            {paymentChannels.map(channel => (
              <TouchableOpacity
                key={channel.code}
                style={[
                  styles.paymentOption,
                  selectedPaymentMethod === channel.code && styles.selectedPayment
                ]}
                onPress={() => {
                  setSelectedPaymentMethod(channel.code);
                  setShowPaymentModal(false);
                  handleCheckout();
                }}
              >
                <View style={styles.paymentInfo}>
                  <Image 
                    source={{ uri: channel.icon_url }} 
                    style={styles.paymentIcon} 
                  />
                  <Text style={styles.paymentText}>{channel.name}</Text>
                </View>
                {selectedPaymentMethod === channel.code && (
                  <Ionicons name="checkmark-circle" size={24} color="#000000" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // Update handleCheckout function
  const handleCheckout = async () => {
    try {
      if (cart.length === 0) {
        showErrorAlert('Keranjang masih kosong');
        return;
      }

      if (!selectedStore) {
        showErrorAlert('Silakan pilih toko terlebih dahulu');
        return;
      }

      if (!selectedPaymentMethod) {
        showErrorAlert('Silakan pilih metode pembayaran');
        return;
      }

      setIsProcessingPayment(true);

      // Format data pesanan
      const orderData: CreateOrderRequest = {
        store_id: String(selectedStore.id),
        items: cart.map(item => ({
          menu_id: item.id,
          quantity: item.quantity,
          notes: item.notes || null
        })),
        payment_method: selectedPaymentMethod === 'CASH' ? 'CASH' : selectedPaymentMethod.toLowerCase(), // Format sesuai yang diharapkan backend
        notes: orderNotes || null
      };

      logInfo('Data pesanan yang akan dikirim:', orderData);

      // Buat pesanan
      const response = await menuService.createOrder(orderData);
      
      if (response.data.payment.payment_url) {
        setPaymentUrl(response.data.payment.payment_url);
        setCart([]); // Kosongkan cart setelah berhasil checkout
      } else if (response.data.payment.payment_method === 'CASH') {
        showSuccessAlert('Pesanan berhasil dibuat. Silakan lakukan pembayaran di kasir.');
        setCart([]); // Kosongkan cart setelah berhasil checkout
        router.push('/orders' as any);
      } else {
        showErrorAlert('URL pembayaran tidak tersedia');
      }
    } catch (error: any) {
      logError('Error saat checkout:', error);
      showErrorAlert(error.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchCategories(), fetchMenus()]);
    setRefreshing(false);
  };

  return (
    <TabLayout activeTab="menu">
      <View style={styles.container}>
        <StoreSelector
          selectedStore={selectedStore}
          onStoreSelect={setSelectedStore}
        />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#666666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari menu..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Payment Method Modal */}
        <PaymentMethodModal />

        {/* Cart Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showCart}
          onRequestClose={() => setShowCart(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.cartModal}>
              <View style={styles.cartHeader}>
                <Text style={styles.cartTitle}>Keranjang</Text>
                <TouchableOpacity onPress={() => setShowCart(false)}>
                  <Ionicons name="close" size={24} color="#000000" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.cartItems}>
                {cart.map(item => (
                  <View key={item.id} style={styles.cartItem}>
                    <View style={styles.cartItemInfo}>
                      <Text style={styles.cartItemName}>{item.name}</Text>
                      <Text style={styles.cartItemPrice}>
                        Rp {item.price.toLocaleString('id-ID')}
                      </Text>
                      <TextInput
                        style={styles.notesInput}
                        placeholder="Tambahkan catatan..."
                        value={item.notes}
                        onChangeText={(text) => updateNotes(item.id, text)}
                      />
                    </View>
                    <View style={styles.quantityControl}>
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, false)}
                      >
                        <Ionicons name="remove" size={20} color="#000000" />
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>{item.quantity}</Text>
                      <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, true)}
                      >
                        <Ionicons name="add" size={20} color="#000000" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.cartFooter}>
                <TouchableOpacity 
                  style={styles.paymentMethodButton}
                  onPress={() => setShowPaymentModal(true)}
                >
                  <View style={styles.paymentMethodInfo}>
                    <Ionicons 
                      name={selectedPaymentMethod === 'CASH' ? 'cash-outline' : 'card-outline'} 
                      size={24} 
                      color="#000000" 
                    />
                    <Text style={styles.paymentMethodText}>
                      {selectedPaymentMethod === 'CASH' ? 'Tunai' : 'Pembayaran Online'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#000000" />
                </TouchableOpacity>

                <View style={styles.cartTotalRow}>
                  <Text style={styles.cartTotalLabel}>Total</Text>
                  <Text style={styles.cartTotalAmount}>
                    Rp {cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                      .toLocaleString('id-ID')}
                  </Text>
                </View>

                <TouchableOpacity 
                  style={[
                    styles.checkoutButton,
                    isProcessingPayment && styles.checkoutButtonDisabled
                  ]}
                  onPress={() => handleCheckout()}
                  disabled={isProcessingPayment || cart.length === 0}
                >
                  {isProcessingPayment ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.checkoutText}>Checkout</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Payment WebView Modal */}
        <Modal
          visible={!!paymentUrl}
          animationType="slide"
          onRequestClose={() => setPaymentUrl(null)}
        >
          {paymentUrl && (
            <PaymentWebView
              paymentUrl={paymentUrl}
              onClose={() => setPaymentUrl(null)}
            />
          )}
        </Modal>

        {/* Categories */}
        <View style={styles.categoriesWrapper}>
          <Text style={styles.sectionTitle}>Kategori</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            <TouchableOpacity
              style={[
                styles.categoryItem,
                !selectedCategory && styles.selectedCategory,
              ]}
              onPress={() => setSelectedCategory('')}
            >
              <Text style={[
                styles.categoryText,
                !selectedCategory && styles.selectedCategoryText,
              ]}>Semua</Text>
            </TouchableOpacity>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.id && styles.selectedCategory,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                {category.image ? (
                  <Image 
                    source={{ uri: category.image }} 
                    style={styles.categoryImage}
                  />
                ) : (
                  <View style={styles.categoryIcon}>
                    <Ionicons name="restaurant-outline" size={16} color={selectedCategory === category.id ? "#FFFFFF" : "#666666"} />
                  </View>
                )}
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category.id && styles.selectedCategoryText,
                ]}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Menu List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={styles.loadingText}>Memuat menu...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={retryFetchMenus}
            >
              <Text style={styles.retryText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        ) : menus.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={48} color="#666666" />
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'Tidak ada menu yang sesuai dengan pencarian'
                : selectedCategory
                ? 'Tidak ada menu dalam kategori ini'
                : 'Tidak ada menu tersedia'}
            </Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={retryFetchMenus}
            >
              <Text style={styles.retryText}>Muat Ulang</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            style={styles.menuList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {menus.map(menu => (
              <View key={menu.id} style={styles.menuItem}>
                {menu.image ? (
                  <Image
                    source={{ uri: menu.image }}
                    style={styles.menuImage}
                  />
                ) : (
                  <View style={styles.menuImagePlaceholder}>
                    <Ionicons name="restaurant-outline" size={32} color="#666666" />
                  </View>
                )}
                <View style={styles.menuInfo}>
                  <Text style={styles.menuName}>{menu.name}</Text>
                  <Text style={styles.menuDescription}>{menu.description}</Text>
                  <Text style={styles.menuPrice}>
                    Rp {menu.price.toLocaleString('id-ID')}
                  </Text>
                  {menu.is_available ? (
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => addToCart(menu)}
                    >
                      <Ionicons name="add" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  ) : (
                    <Text style={styles.unavailableText}>Tidak tersedia</Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Alert */}
        <CustomAlert
          visible={showAlert}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setShowAlert(false)}
        />
      </View>
    </TabLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
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
  categoriesWrapper: {
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  selectedCategory: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  categoryImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuList: {
    flex: 1,
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  menuImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuInfo: {
    flex: 1,
    marginLeft: 12,
  },
  menuName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  menuPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  addButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000000',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unavailableText: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    color: '#FF3B30',
    fontSize: 14,
  },
  cartSummaryButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingBottom: 32,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  cartInfo: {
    flex: 1,
  },
  cartItemCount: {
    fontSize: 14,
    color: '#666666',
  },
  cartTotal: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  viewCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  viewCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
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
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  cartSummaryDisabled: {
    opacity: 0.7,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  cartModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  cartItems: {
    maxHeight: '70%',
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  cartItemInfo: {
    flex: 1,
    marginRight: 16,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  notesInput: {
    fontSize: 14,
    color: '#666666',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 12,
    color: '#000000',
  },
  cartFooter: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 16,
  },
  cartTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cartTotalLabel: {
    fontSize: 16,
    color: '#666666',
  },
  cartTotalAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  checkoutButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  paymentList: {
    maxHeight: '70%',
  },
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  selectedPayment: {
    backgroundColor: '#F8F8F8',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  paymentText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 12,
  },
  paymentMethodButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginBottom: 16,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 8,
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
}); 