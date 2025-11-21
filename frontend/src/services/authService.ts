import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const authService = {
  login: async (username: string, password: string) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
    // supponiamo che il backend risponda con { token, user }
    localStorage.setItem('authToken', response.data.token);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('authToken');
  }
};
