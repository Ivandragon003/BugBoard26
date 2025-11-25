// src/config.ts
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://bugboard26-h7a9g8eaasd4azdv.italynorth-01.azurewebsites.net/api'
  : process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export default API_BASE_URL;