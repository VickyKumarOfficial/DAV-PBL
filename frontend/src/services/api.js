import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Health check
  health: async () => {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  // Make prediction
  predict: async (inputData) => {
    try {
      const response = await apiClient.post('/predict', inputData);
      return response.data;
    } catch (error) {
      console.error('Prediction error:', error);
      throw error;
    }
  },

  // Get insights
  getInsights: async () => {
    try {
      const response = await apiClient.get('/insights');
      return response.data;
    } catch (error) {
      console.error('Insights error:', error);
      throw error;
    }
  },

  // List charts
  listCharts: async () => {
    try {
      const response = await apiClient.get('/charts');
      return response.data;
    } catch (error) {
      console.error('Charts list error:', error);
      throw error;
    }
  },

  // Get chart URL
  getChartUrl: (filename) => {
    return `${API_BASE_URL}/charts/${filename}`;
  },
};

export default api;
