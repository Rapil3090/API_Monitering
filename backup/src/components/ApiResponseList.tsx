import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { ApiResponse, ApiEndpointService } from '../services/apiEndpointService';

interface ApiResponseListProps {
  apiService: ApiEndpointService;
  urlId: number;
}

export const ApiResponseList: React.FC<ApiResponseListProps> = ({
  apiService,
  urlId,
}) => {
  const [responses, setResponses] = useState<ApiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResponses();
  }, [urlId]);

  const loadResponses = async () => {
    try {
      setLoading(true);
      const data = await apiService.getApiResponse(urlId);
      setResponses(data);
    } catch (err) {
      setError('API 응답을 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: ApiResponse }) => (
    <View style={styles.responseItem}>
      <View style={styles.headerContainer}>
        <Text style={styles.timestampText}>{item.timestamp}</Text>
        <View style={[
          styles.statusContainer,
          { backgroundColor: item.success ? '#4CAF50' : '#F44336' }
        ]}>
          <Text style={styles.statusText}>
            {item.success ? '성공' : '실패'}
          </Text>
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>상태 코드: {item.statusCode}</Text>
        <Text style={styles.detailText}>응답 시간: {item.responseTime}ms</Text>
      </View>

      <ScrollView style={styles.responseBodyContainer}>
        <Text style={styles.responseBodyText}>{item.responseBody}</Text>
      </ScrollView>
    </View>
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
      data={responses}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  responseItem: {
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timestampText: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailsContainer: {
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  responseBodyContainer: {
    maxHeight: 200,
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
  },
  responseBodyText: {
    fontSize: 12,
    color: '#333',
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