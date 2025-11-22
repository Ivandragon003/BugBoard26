// Configurazione API
// In sviluppo usa localhost, in produzione usa Azure

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://bugboard26-h7a9g8eaasd4azdv.italynorth-01.azurewebsites.net/api';

export default API_BASE_URL;