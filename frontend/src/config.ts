// Configurazione API
// In sviluppo usa localhost, in produzione usa Azure

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export default API_BASE_URL;