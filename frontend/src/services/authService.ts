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
      localStorage.setItem('user', JSON.stringify(response.data.utente));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getToken: () => {
    return localStorage.getItem('authToken');
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  }
};