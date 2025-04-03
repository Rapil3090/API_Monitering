import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ApiEndpoint, ApiEndpointService } from '../services/apiEndpointService';

interface ApiEndpointListProps {
  apiService: ApiEndpointService;
  onEndpointPress: (endpoint: ApiEndpoint) => void;
}

export const ApiEndpointList: React.FC<ApiEndpointListProps> = ({
  apiService,
  onEndpointPress,
}) => {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEndpoints();
  }, []);

  const loadEndpoints = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllEndpoints();
      setEndpoints(data);
    } catch (err) {
      setError('API 엔드포인트를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: ApiEndpoint }) => (
    <TouchableOpacity
      style={styles.endpointItem}
      onPress={() => onEndpointPress(item)}
    >
      <Text style={styles.urlText}>{item.url}</Text>
      <Text style={styles.callTimeText}>호출 주기: {item.callTime}초</Text>
      <Text style={styles.parameterCountText}>
        파라미터 수: {item.parameters.length}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={endpoints}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  endpointItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  urlText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  callTimeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  parameterCountText: {
    fontSize: 14,
    color: '#666',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
}); 