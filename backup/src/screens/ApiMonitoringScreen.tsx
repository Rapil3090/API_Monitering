import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { ApiEndpointList } from '../components/ApiEndpointList';
import { ApiResponseList } from '../components/ApiResponseList';
import { ApiEndpointService } from '../services/apiEndpointService';
import { ApiEndpoint } from '../services/apiEndpointService';

const apiService = new ApiEndpointService('YOUR_API_BASE_URL');

export const ApiMonitoringScreen: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);

  const handleEndpointPress = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>API 모니터링</Text>
        {selectedEndpoint && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedEndpoint(null)}
          >
            <Text style={styles.backButtonText}>목록으로</Text>
          </TouchableOpacity>
        )}
      </View>

      {selectedEndpoint ? (
        <ApiResponseList
          apiService={apiService}
          urlId={selectedEndpoint.id}
        />
      ) : (
        <ApiEndpointList
          apiService={apiService}
          onEndpointPress={handleEndpointPress}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#2196F3',
    fontSize: 16,
  },
}); 