import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { apiService, ApiEndpoint } from '../services/apiService';

export const ApiListScreen = () => {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEndpoints = async () => {
    try {
      const data = await apiService.getEndpoints();
      setEndpoints(data);
    } catch (error) {
      console.error('Error fetching endpoints:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEndpoints();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEndpoints();
  };

  const renderItem = ({ item }: { item: ApiEndpoint }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.method}>{item.method}</Text>
      <Text style={styles.url}>{item.url}</Text>
      {item.description && (
        <Text style={styles.description}>{item.description}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={endpoints}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>등록된 API가 없습니다.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  method: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  url: {
    fontSize: 14,
    marginTop: 4,
    color: '#333',
  },
  description: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
}); 