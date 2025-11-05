import axios from 'axios';

// Use environment variable for production, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
      console.log('Sending prediction request with data:', inputData);
      const response = await apiClient.post('/predict', inputData);
      console.log('Prediction response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Prediction error details:', error);
      if (error.response) {
        // Server responded with error
        console.error('Error response:', error.response.data);
        throw new Error(error.response.data.detail || 'Server error');
      } else if (error.request) {
        // Request made but no response
        console.error('No response received:', error.request);
        throw new Error('Cannot connect to server. Please check if backend is running.');
      } else {
        // Error in request setup
        console.error('Request setup error:', error.message);
        throw new Error(error.message);
      }
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
