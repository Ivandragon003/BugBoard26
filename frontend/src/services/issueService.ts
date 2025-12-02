import axios from 'axios';
import API_BASE_URL from '../config';

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('authToken')}`
});

export const issueService = {
  getAllIssues: async () => {
    const response = await axios.get(`${API_BASE_URL}/issue/visualizza-lista`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getArchivedIssues: async () => {
    const response = await axios.get(`${API_BASE_URL}/issue/visualizza-lista?archiviata=true`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getActiveIssues: async () => {
    const response = await axios.get(`${API_BASE_URL}/issue/visualizza-lista?archiviata=false`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  getIssueById: async (id: number) => {
    const response = await axios.get(`${API_BASE_URL}/issue/visualizza/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  createIssue: async (issueData: any) => {
    const response = await axios.post(`${API_BASE_URL}/issue/crea`, issueData, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  deleteIssue: async (id: number) => {
    const response = await axios.delete(`${API_BASE_URL}/issue/elimina/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  archiveIssue: async (id: number, idArchiviatore: number) => {
    const response = await axios.delete(
      `${API_BASE_URL}/issue/archivia/${id}?idArchiviatore=${idArchiviatore}`, 
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  },

  unarchiveIssue: async (id: number) => {
    const response = await axios.put(
      `${API_BASE_URL}/issue/disarchivia/${id}`,
      {},
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  },

  getStatistics: async () => {
    const response = await axios.get(`${API_BASE_URL}/issue/statistiche`, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  searchIssues: async (titolo: string) => {
    const response = await axios.get(
      `${API_BASE_URL}/issue/cerca?titolo=${encodeURIComponent(titolo)}`, 
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  },

  filterIssues: async (stato?: string, priorita?: string, tipo?: string) => {
    let url = `${API_BASE_URL}/issue/filtra?`;
    if (stato) url += `stato=${stato}&`;
    if (priorita) url += `priorita=${priorita}&`;
    if (tipo) url += `tipo=${tipo}`;
    
    const response = await axios.get(url, {
      headers: getAuthHeader()
    });
    return response.data;
  },

  // NUOVA FUNZIONE: Filtraggio avanzato con ricerca e ordinamento
  filterIssuesAdvanced: async (params: {
    stato?: string;
    priorita?: string;
    tipo?: string;
    ricerca?: string;
    ordinamento?: string;
    archiviata?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params.stato) queryParams.append('stato', params.stato);
    if (params.priorita) queryParams.append('priorita', params.priorita);
    if (params.tipo) queryParams.append('tipo', params.tipo);
    if (params.ricerca) queryParams.append('ricerca', params.ricerca);
    if (params.ordinamento) queryParams.append('ordinamento', params.ordinamento);
    if (params.archiviata !== undefined) queryParams.append('archiviata', params.archiviata.toString());
    
    const response = await axios.get(
      `${API_BASE_URL}/issue/filtra-avanzato?${queryParams.toString()}`,
      {
        headers: getAuthHeader()
      }
    );
    return response.data;
  }
};