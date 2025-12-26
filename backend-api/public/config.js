const CONFIG = {
  // Détection automatique de l'environnement
  API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:10000'  // Développement local
    : 'https://cinehome1.vercel.app',  // Production
  
  ENDPOINTS: {
    LOGIN: '/api/users/login',
    REGISTER: '/api/users/register',
    FORGOT_PASSWORD: '/api/users/request-password-reset',  // Utiliser le bon endpoint
    VERIFY_RESET_CODE: '/api/users/verify-reset-code',
    RESET_PASSWORD: '/api/users/reset-password',
    HEALTH: '/health'
  },
  
  SETTINGS: {
    REQUEST_TIMEOUT: 12000,
    PASSWORD_MIN_LENGTH: 6,
    CODE_LENGTH: 6
  }
};

function getApiUrl(endpoint) {
  return CONFIG.API_BASE_URL + CONFIG.ENDPOINTS[endpoint];
}

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

const TMDBConfig = {
  verificarConfiguracao() {
    try {
      const apiKey = localStorage.getItem('tmdb_api_key');
      return !!(apiKey && apiKey.trim().length > 0);
    } catch (error) {
      console.error('Erro ao verificar configuração TMDB:', error);
      return false;
    }
  },
  
  atualizarBotaoTMDB() {
    const botao = document.getElementById('btn-open-settings');
    if (!botao) return;
    
    const configurado = this.verificarConfiguracao();
    
    if (configurado) {
      botao.textContent = 'Configurado';
      botao.classList.remove('btn-secondary');
      botao.classList.add('btn-primary', 'tmdb-configurado');
      botao.title = 'Clique para gerenciar configuração TMDB';
    } else {
      botao.textContent = 'Configurar TMDB';
      botao.classList.remove('btn-primary', 'tmdb-configurado');
      botao.classList.add('btn-secondary');
      botao.title = 'Configurar TMDB';
    }
  },
  
  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.atualizarBotaoTMDB());
    } else {
      this.atualizarBotaoTMDB();
    }
    
    window.addEventListener('storage', (e) => {
      if (e.key === 'tmdb_api_key') {
        this.atualizarBotaoTMDB();
      }
    });
  }
};

TMDBConfig.init();

console.log('🔧 Configuração carregada:', {
  baseUrl: CONFIG.API_BASE_URL,
  endpoints: Object.keys(CONFIG.ENDPOINTS).length
});