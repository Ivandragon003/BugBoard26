import axios from 'axios';
import API_BASE_URL from '../config';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/utenza/login`, { 
      email, 
      password 
    });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },

  getToken: () => {
    return localStorage.getItem('authToken');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  }
};