import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchZipporaLogs } from '../features/zipporaInfoSlice';

const ZipLogs: React.FC = () => {
  const dispatch = useAppDispatch();
  const { zipporaLog, loading } = useAppSelector((state) => state.zipporaInfo);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      await dispatch(fetchZipporaLogs());
      console.log("Zippora Logs: ", zipporaLog)
    } catch (error) {
      console.error('Error fetching logs:', error);
      Alert.alert('Error', 'Failed to fetch logs. Please try again.');
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadLogs();
    setIsRefreshing(false);
  };

  const renderLogItem = ({ item }: { item: any }) => {
    const isPickedUp = !!item.pickTime;
    return (
      <View style={[styles.logCard, isPickedUp ? styles.pickedUp : styles.notPickedUp]}>
        <View style={styles.logInfo}>
          <Text style={styles.courierName}>{item.courierCompanyName}</Text>
          <Text style={styles.pickCode}>
            Pick Code: <Text style={styles.bold}>{item.pickCode}</Text>
          </Text>
          <Text>
            Stored Time: <Text style={styles.bold}>{item.storeTime}</Text>
          </Text>
          <Text>
            {isPickedUp ? (
              <>
                Picked Time: <Text style={styles.bold}>{item.pickTime}</Text>
              </>
            ) : (
              'Not Picked Yet'
            )}
          </Text>
          <Text>
            Cabinet ID: <Text style={styles.bold}>{item.cabinetId}</Text>
          </Text>
        </View>
        <View style={styles.status}>
          <Text style={[styles.statusText, isPickedUp ? styles.statusPickedUp : styles.statusNotPicked]}>
            {isPickedUp ? 'Picked' : 'Pending Pickup'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Zippora Logs</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />
      ) : (
        <FlatList
          data={zipporaLog}
          keyExtractor={(item) => item.storeId}
          renderItem={renderLogItem}
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={<Text style={styles.noData}>No logs found.</Text>}
        />
      )}
      <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
  logCard: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logInfo: {
    flex: 1,
  },
  courierName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  pickCode: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
    color: '#333',
  },
  status: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusPickedUp: {
    color: 'green',
  },
  statusNotPicked: {
    color: 'red',
  },
  pickedUp: {
    borderLeftWidth: 5,
    borderLeftColor: 'green',
  },
  notPickedUp: {
    borderLeftWidth: 5,
    borderLeftColor: 'red',
  },
  noData: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
    fontSize: 16,
  },
  refreshButton: {
    backgroundColor: '#007BFF',
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default ZipLogs;
