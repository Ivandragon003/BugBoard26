import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('authToken')}`
});

export const allegatoService = {

  uploadAllegato: async (file: File, idIssue: number) => {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      throw new Error('Il file supera il limite di 5MB');
    }

    const allowedFormats = [
      'image/jpeg', 
      'image/jpg', 
      'image/png', 
      'image/gif', 
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedFormats.includes(file.type)) {
      throw new Error('Formato file non supportato. Usa JPEG, PNG, GIF, WebP, PDF, DOC o DOCX');
    }

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


  getAllegatiByIssue: async (idIssue: number) => {
    const response = await axios.get(
      `${API_BASE_URL}/allegato/issue/${idIssue}`,
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  },

  
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

  
  deleteAllegato: async (id: number) => {
    const response = await axios.delete(
      `${API_BASE_URL}/allegato/${id}`,
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  },


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
