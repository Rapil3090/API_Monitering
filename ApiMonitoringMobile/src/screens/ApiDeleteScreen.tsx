import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { apiService, ApiEndpoint } from '../services/apiService';

export const ApiDeleteScreen = () => {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEndpoints = async () => {
    try {
      const data = await apiService.getEndpoints();
      setEndpoints(data);
    } catch (error) {
      console.error('Error fetching endpoints:', error);
      Alert.alert('오류', 'API 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEndpoints();
  }, []);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      Alert.alert('알림', '삭제할 API를 선택해주세요.');
      return;
    }

    Alert.alert(
      '확인',
      '선택한 API를 삭제하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteMultipleEndpoints(selectedIds);
              Alert.alert('성공', '선택한 API가 삭제되었습니다.');
              setSelectedIds([]);
              fetchEndpoints();
            } catch (error) {
              Alert.alert('오류', 'API 삭제 중 오류가 발생했습니다.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: ApiEndpoint }) => (
    <TouchableOpacity
      style={[
        styles.itemContainer,
        selectedIds.includes(item.id) && styles.selectedItem,
      ]}
      onPress={() => toggleSelection(item.id)}
    >
      <View style={styles.itemContent}>
        <Text style={styles.method}>{item.method}</Text>
        <Text style={styles.url}>{item.url}</Text>
        {item.description && (
          <Text style={styles.description}>{item.description}</Text>
        )}
      </View>
      <View style={styles.checkbox}>
        <View
          style={[
            styles.checkboxInner,
            selectedIds.includes(item.id) && styles.checkboxChecked,
          ]}
        />
      </View>
    </TouchableOpacity>
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
        ListEmptyComponent={
          <Text style={styles.emptyText}>삭제할 API가 없습니다.</Text>
        }
      />
      {endpoints.length > 0 && (
        <TouchableOpacity
          style={[
            styles.deleteButton,
            selectedIds.length === 0 && styles.deleteButtonDisabled,
          ]}
          onPress={handleDelete}
          disabled={selectedIds.length === 0}
        >
          <Text style={styles.deleteButtonText}>
            선택한 API 삭제 ({selectedIds.length})
          </Text>
        </TouchableOpacity>
      )}
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
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: '#f0f8ff',
  },
  itemContent: {
    flex: 1,
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginLeft: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    backgroundColor: '#ccc',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 