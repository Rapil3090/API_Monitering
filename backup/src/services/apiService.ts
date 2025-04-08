import axios from 'axios';

const BASE_URL = 'http://localhost:3000'; // 실제 서버 URL로 변경 필요

export interface ApiEndpoint {
  id: string;
  url: string;
  method: string;
  description?: string;
}

export const apiService = {
  // API 엔드포인트 조회
  getEndpoints: async (): Promise<ApiEndpoint[]> => {
    const response = await axios.get(`${BASE_URL}/api/endpoints`);
    return response.data;
  },

  // API 엔드포인트 생성
  createEndpoint: async (endpoint: Omit<ApiEndpoint, 'id'>): Promise<ApiEndpoint> => {
    const response = await axios.post(`${BASE_URL}/api/endpoints`, endpoint);
    return response.data;
  },

  // API 엔드포인트 삭제
  deleteEndpoint: async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/api/endpoints/${id}`);
  },

  // 여러 API 엔드포인트 삭제
  deleteMultipleEndpoints: async (ids: string[]): Promise<void> => {
    await axios.post(`${BASE_URL}/api/endpoints/delete-multiple`, { ids });
  },
}; 