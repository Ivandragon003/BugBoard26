import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('authToken')}`
});

export const allegatoService = {
  // Upload un nuovo allegato
  uploadAllegato: async (file: File, idIssue: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('idIssue', idIssue.toString());

    const response = await axios.post(
      `${API_BASE_URL}/allegato/upload`,
      formData,
      {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },

  // Ottieni tutti gli allegati di un'issue
  getAllegatiByIssue: async (idIssue: number) => {
    const response = await axios.get(
      `${API_BASE_URL}/allegato/issue/${idIssue}`,
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  },

  // Download allegato
  downloadAllegato: async (id: number) => {
    const response = await axios.get(
      `${API_BASE_URL}/allegato/download/${id}`,
      {
        headers: getAuthHeader(),
        responseType: 'blob'
      }
    );
    return response;
  },

  // Elimina allegato
  deleteAllegato: async (id: number) => {
    const response = await axios.delete(
      `${API_BASE_URL}/allegato/${id}`,
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  },

  // Ottieni conteggio allegati
  countAllegati: async (idIssue: number) => {
    const response = await axios.get(
      `${API_BASE_URL}/allegato/issue/${idIssue}/count`,
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  },

  // Ottieni dimensione totale
  getDimensioneTotale: async (idIssue: number) => {
    const response = await axios.get(
      `${API_BASE_URL}/allegato/issue/${idIssue}/dimensione-totale`,
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  }
};

export default allegatoService;