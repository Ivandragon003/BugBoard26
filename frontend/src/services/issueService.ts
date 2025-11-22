
import axios from 'axios';
import API_BASE_URL from '../config';

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('authToken')}`
});

export const issueService = {
  getAllIssues: async () => {
    const response = await axios.get(`${API_BASE_URL}/issue`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getIssueById: async (id: number) => {
    const response = await axios.get(`${API_BASE_URL}/issue/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  createIssue: async (issueData: any) => {
    const response = await axios.post(`${API_BASE_URL}/issue`, issueData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  updateIssue: async (id: number, issueData: any) => {
    const response = await axios.put(`${API_BASE_URL}/issue/${id}`, issueData, {
      headers: getAuthHeader()
    });
    return response.data;
  }
};