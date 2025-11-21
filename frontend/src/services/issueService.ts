import axios from 'axios';
const API_BASE_URL = 'http://localhost:8080/api';
export const issueService = {
  getAllIssues: async () => {
    const response = await axios.get(`${API_BASE_URL}/issues`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    return response.data;
  }
};
