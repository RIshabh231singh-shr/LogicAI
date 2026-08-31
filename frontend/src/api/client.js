import axios from 'axios';

// Base URLs derived from environment or proxy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const AI_BASE_URL = import.meta.env.VITE_AI_BASE_URL || '/ai';

/**
 * Primary Axios client for Node.js Express Gateway endpoints (/api/*)
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Dedicated Axios client for Python FastAPI AI Service endpoints (/api/v1/*)
 */
export const aiClient = axios.create({
  baseURL: AI_BASE_URL,
  timeout: 45000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach request interceptors
const handleRequest = (config) => {
  const token = localStorage.getItem('logicai_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

apiClient.interceptors.request.use(handleRequest, (err) => Promise.reject(err));
aiClient.interceptors.request.use(handleRequest, (err) => Promise.reject(err));

// Attach response error normalizer
const handleResponseError = (error) => {
  let message = 'An unexpected error occurred';
  let status = error.response ? error.response.status : null;

  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data === 'string') {
      message = data;
    } else if (data.detail) {
      message = typeof data.detail === 'string' 
        ? data.detail 
        : data.detail.detail || JSON.stringify(data.detail);
    } else if (data.error) {
      message = data.error;
    } else if (data.message) {
      message = data.message;
    }
  } else if (error.request) {
    message = 'Unable to connect to LogicAI services. Please check network connectivity.';
  } else {
    message = error.message;
  }

  const normalizedError = new Error(message);
  normalizedError.status = status;
  normalizedError.originalError = error;
  normalizedError.data = error.response?.data;

  return Promise.reject(normalizedError);
};

apiClient.interceptors.response.use((res) => res.data, handleResponseError);
aiClient.interceptors.response.use((res) => res.data, handleResponseError);

export default apiClient;
