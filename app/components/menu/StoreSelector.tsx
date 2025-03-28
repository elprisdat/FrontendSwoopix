import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Store } from '../../services/menu';
import menuService from '../../services/menu';

interface StoreSelectorProps {
  selectedStore?: Store;
  onStoreSelect: (store: Store) => void;
}

const StoreSelector: React.FC<StoreSelectorProps> = ({
  selectedStore,
  onStoreSelect,
}) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await menuService.getStores();
      console.log('Loaded stores:', data);
      setStores(data);
    } catch (error: any) {
      console.error('Error loading stores:', error);
      setError(error.message || 'Gagal memuat daftar toko');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modalVisible) {
      loadStores();
    }
  }, [modalVisible]);

  const handleSelectStore = (store: Store) => {
    onStoreSelect(store);
    setModalVisible(false);
  };

  const renderStoreItem = ({ item }: { item: Store }) => (
    <TouchableOpacity
      style={[
        styles.storeItem,
        selectedStore?.id === item.id && styles.selectedStoreItem
      ]}
      onPress={() => handleSelectStore(item)}
    >
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{item.name}</Text>
        <Text style={styles.storeAddress}>{item.address}</Text>
        <View style={styles.storeDetails}>
          <View style={styles.storeDetailItem}>
            <Ionicons name="time-outline" size={16} color="#666666" />
            <Text style={styles.storeDetailText}>
              {item.open_time} - {item.close_time}
            </Text>
          </View>
          <View style={styles.storeDetailItem}>
            <Ionicons name="call-outline" size={16} color="#666666" />
            <Text style={styles.storeDetailText}>{item.phone}</Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          item.is_open ? styles.openBadge : styles.closedBadge
        ]}>
          <Text style={[
            styles.statusText,
            item.is_open ? styles.openText : styles.closedText
          ]}>
            {item.is_open ? 'Buka' : 'Tutup'}
          </Text>
        </View>
      </View>
      {selectedStore?.id === item.id && (
        <Ionicons name="checkmark-circle" size={24} color="#000000" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          <Ionicons name="location-outline" size={24} color="#000000" />
          <Text style={styles.selectorText}>
            {selectedStore ? selectedStore.name : 'Pilih Toko'}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={24} color="#000000" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Toko</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#000000" />
                <Text style={styles.loadingText}>Memuat daftar toko...</Text>
              </View>
            ) : error ? (
              <View style={styles.centerContainer}>
                <Ionicons name="alert-circle-outline" size={48} color="#F44336" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={loadStores}
                >
                  <Text style={styles.retryText}>Coba Lagi</Text>
                </TouchableOpacity>
              </View>
            ) : stores.length === 0 ? (
              <View style={styles.centerContainer}>
                <Ionicons name="location-outline" size={48} color="#666666" />
                <Text style={styles.emptyText}>Tidak ada toko tersedia</Text>
              </View>
            ) : (
              <FlatList
                data={stores}
                renderItem={renderStoreItem}
                keyExtractor={item => String(item.id)}
                contentContainerStyle={styles.storeList}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  selectorButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 12,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  storeList: {
    padding: 16,
  },
  storeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedStoreItem: {
    backgroundColor: '#F8F8F8',
    borderColor: '#000000',
    borderWidth: 1,
  },
  storeInfo: {
    flex: 1,
    marginRight: 16,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  storeAddress: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  storeDetails: {
    marginTop: 8,
  },
  storeDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  storeDetailText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 8,
  },
  statusBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  openBadge: {
    backgroundColor: '#E8F5E9',
  },
  closedBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  openText: {
    color: '#2E7D32',
  },
  closedText: {
    color: '#C62828',
  },
  centerContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
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
});

export default StoreSelector; 