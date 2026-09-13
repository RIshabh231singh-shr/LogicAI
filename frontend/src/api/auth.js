import { apiClient } from './client';

export const authApi = {
  /**
   * Registers a new user account and persists JWT
   */
  signup: async ({ email, password, name }) => {
    const res = await apiClient.post('/api/auth/signup', {
      email,
      password,
      name,
    });
    if (res.token) {
      localStorage.setItem('logicai_auth_token', res.token);
    }
    return res;
  },

  /**
   * Logs in an existing user and persists JWT
   */
  login: async ({ email, password }) => {
    const res = await apiClient.post('/api/auth/login', {
      email,
      password,
    });
    if (res.token) {
      localStorage.setItem('logicai_auth_token', res.token);
    }
    return res;
  },

  /**
   * Fetches current authenticated user profile
   */
  getMe: async () => {
    return apiClient.get('/api/auth/me');
  },

  /**
   * Clears auth token
   */
  logout: () => {
    localStorage.removeItem('logicai_auth_token');
  },

  /**
   * Checks if user has a stored JWT
   */
  isAuthenticated: () => {
    return Boolean(localStorage.getItem('logicai_auth_token'));
  },
};
