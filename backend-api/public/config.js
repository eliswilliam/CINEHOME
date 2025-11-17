// Configuration pour CINEHOME Frontend
const CONFIG = {
  // URL do backend - altere conforme necessário
    API_BASE_URL: 'https://cinemaf.onrender.com', // Backend em produção no Render
  
  // Para desenvolvimento local, altere para:
  // API_BASE_URL: 'http://localhost:3001',
  
  // Endpoints da API
  ENDPOINTS: {
    LOGIN: '/api/users/login',
    REGISTER: '/api/users/register',
    FORGOT_PASSWORD: '/api/users/forgot-password',
    VERIFY_RESET_CODE: '/api/users/verify-reset-code',
    RESET_PASSWORD: '/api/users/reset-password',
    HEALTH: '/health'
  },
  
  // Configurações gerais
  SETTINGS: {
    REQUEST_TIMEOUT: 12000, // 12 segundos
    PASSWORD_MIN_LENGTH: 6,
    CODE_LENGTH: 6
  }
};

// Função helper para construir URLs completas
function getApiUrl(endpoint) {
  return CONFIG.API_BASE_URL + CONFIG.ENDPOINTS[endpoint];
}

// Verificar se o backend está disponível
async function checkBackendHealth() {
  try {
    const response = await fetch(getApiUrl('HEALTH'), {
      method: 'GET',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    console.warn('⚠️ Backend não disponível:', error.message);
    return false;
  }
}

console.log('🔧 Configuração carregada:', {
  baseUrl: CONFIG.API_BASE_URL,
  endpoints: Object.keys(CONFIG.ENDPOINTS).length
});