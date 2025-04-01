import axios from 'axios';

export interface ApiEndpoint {
  id: number;
  url: string;
  parameters: Parameter[];
  callTime: number;
}

export interface Parameter {
  key: string;
  value: string;
  type: string;
}

export interface ApiResponse {
  id: string;
  url: string;
  statusCode: number;
  responseTime: number;
  success: boolean;
  timestamp: string;
  responseBody: string;
}

export class ApiEndpointService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async getAllEndpoints(): Promise<ApiEndpoint[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api-endpoint`);
      return response.data;
    } catch (error) {
      console.error('API 엔드포인트 조회 실패:', error);
      throw error;
    }
  }

  async getApiResponse(urlId: number): Promise<ApiResponse[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api-endpoint/${urlId}/response`);
      return response.data;
    } catch (error) {
      console.error('API 응답 조회 실패:', error);
      throw error;
    }
  }

  async createApiEndpoint(endpoint: Omit<ApiEndpoint, 'id'>): Promise<ApiEndpoint> {
    try {
      const response = await axios.post(`${this.baseUrl}/api-endpoint`, endpoint);
      return response.data;
    } catch (error) {
      console.error('API 엔드포인트 생성 실패:', error);
      throw error;
    }
  }

  async updateApiEndpoint(id: number, endpoint: Partial<ApiEndpoint>): Promise<ApiEndpoint> {
    try {
      const response = await axios.patch(`${this.baseUrl}/api-endpoint/${id}`, endpoint);
      return response.data;
    } catch (error) {
      console.error('API 엔드포인트 업데이트 실패:', error);
      throw error;
    }
  }

  async deleteApiEndpoint(id: number): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/api-endpoint/${id}`);
    } catch (error) {
      console.error('API 엔드포인트 삭제 실패:', error);
      throw error;
    }
  }
} 