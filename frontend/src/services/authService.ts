import axios from 'axios';
import API_BASE_URL from '../config';

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/utenza/login`, {
        email,
        password
      });
      
      if (response.data.token && response.data.utente) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.utente));
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  recuperaPassword: async (email: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/utenza/recupera-password`, {
        email
      });
      return response.data;
    } catch (error) {
      console.error('Errore recupero password:', error);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },
  
  getToken: () => {
    return localStorage.getItem('authToken');
  },
  
  getUser: () => {
    const userStr = localStorage.getItem('user');
    
    if (!userStr) {
      return null;
    }
    
    try {
      const user = JSON.parse(userStr);
      return user;
    } catch (error) {
      return null;
    }
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
  
  isAdmin: () => {
    const user = authService.getUser();
    return user?.ruolo === 'Amministratore';
  },
  
  isUtente: () => {
    const user = authService.getUser();
    return user?.ruolo === 'Utente';
  }
};