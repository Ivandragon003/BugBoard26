import axios from 'axios';
import API_BASE_URL from '../config';

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/utenza/login`, {
        email,
        password
      });
      
      console.log('Login response:', response.data); // Debug
      
      if (response.data.token && response.data.utente) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.utente));
        
        console.log('Token salvato:', response.data.token); // Debug
        console.log('User salvato:', response.data.utente); // Debug
      } else {
        console.error('Token o utente mancante nella risposta');
      }
      
      return response.data;
    } catch (error) {
      console.error('Errore durante il login:', error);
      throw error;
    }
  },
  
  recuperaPassword: async (email: string) => {
    const response = await axios.post(`${API_BASE_URL}/utenza/recupera-password`, {
      email
    });
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    console.log('Logout effettuato, storage pulito'); // Debug
  },
  
  getToken: () => {
    const token = localStorage.getItem('authToken');
    console.log('Token recuperato:', token); // Debug
    return token;
  },
  
  getUser: () => {
    const userStr = localStorage.getItem('user');
    console.log('User string da localStorage:', userStr); // Debug
    
    if (!userStr) {
      console.log('Nessun user trovato in localStorage');
      return null;
    }
    
    try {
      const user = JSON.parse(userStr);
      console.log('User parsato:', user); // Debug
      return user;
    } catch (error) {
      console.error('Errore nel parsing del user:', error);
      return null;
    }
  },
  
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    const isAuth = !!token;
    console.log('Is authenticated:', isAuth); // Debug
    return isAuth;
  },
  
  isAdmin: () => {
    const user = authService.getUser();
    const isAdm = user?.ruolo === 'Amministratore';
    console.log('Is admin:', isAdm, 'User role:', user?.ruolo); // Debug
    return isAdm;
  },
  
  isUtente: () => {
    const user = authService.getUser();
    const isUsr = user?.ruolo === 'Utente';
    console.log('Is utente:', isUsr, 'User role:', user?.ruolo); // Debug
    return isUsr;
  }
};