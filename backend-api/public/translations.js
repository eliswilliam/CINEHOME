// Sistema de tradução para múltiplos idiomas
// Suporta: PT-BR (Português), EN-US (English), ES-ES (Español)

const translations = {
  'pt-BR': {
    // Header
    'search.placeholder': 'Pesquisar filmes...',
    'btn.logout': 'Sair',
    'btn.login': 'Login',
    'btn.settings': 'Configurar TMDB',
    
    // Search
    'search.results': 'Resultados para',
    'search.found': 'resultados encontrados',
    'search.noResults': 'Nenhum resultado encontrado',
    'search.tryAgain': 'Tente usar palavras-chave diferentes',
    'search.loading': 'Procurando...',
    'search.error': 'Erro ao buscar. Tente novamente.',
    'search.minLength': 'Digite pelo menos 2 caracteres',
    'search.noOverview': 'Sem descrição disponível',
    
    // Hero
    'hero.watchNow': 'Assistir agora',
    'hero.details': 'Detalhes',
    'hero.watchMore': 'Mais títulos para assistir',
    'hero.plans': 'Planos',
    'hero.cta': 'Assista já',
    
    // Categories
    'nav.home': 'PÁGINA INICIAL',
    'nav.suspense': 'SUSPENSE',
    'nav.comedy': 'COMÉDIA',
    'nav.action': 'AÇÃO',
    'nav.horror': 'TERROR',
    'nav.drama': 'DRAMA',
    'nav.fiction': 'FICÇÃO',
    'nav.mystery': 'MISTÉRIO',
    
    // Sections
    'section.popular': 'Filmes Populares',
    'section.series': 'Séries em Alta',
    
    // Modal TMDB
    'modal.title': 'Configurar API do TMDB',
    'modal.description': 'Insira sua chave da API do TMDB para carregar catálogos reais. A chave será salva apenas no seu navegador (localStorage).',
    'modal.label': 'API Key',
    'modal.placeholder': 'Cole sua API key aqui',
    'modal.hint': 'Dica: você também pode usar ?tmdb_api_key=SUACHAVE na URL.',
    'modal.save': 'Salvar',
    'modal.clear': 'Remover',
    'modal.cancel': 'Cancelar',
    
    // Footer
    'footer.help': 'Central de Ajuda',
    'footer.terms': 'Termos de Uso',
    'footer.privacy': 'Política de Privacidade',
    'footer.corporate': 'Informações Corporativas',
    'footer.notices': 'Avisos Legais',
    'footer.legalHelp': 'Central de Ajuda Legal',
    'footer.terms': 'Termos de Uso',
    'footer.privacy': 'Privacidade',
    'footer.corporate': 'Informações corporativas',
    'footer.legal': 'Avisos legais',
    'footer.legalCenter': 'Centro de Ajuda Legal',
    'footer.language': 'Idioma',
    'footer.copyright': 'CineHome Brasil'
  },
  
  'en-US': {
    // Header
    'search.placeholder': 'Search movies...',
    'btn.logout': 'Logout',
    'btn.login': 'Login',
    'btn.settings': 'Configure TMDB',
    
    // Search
    'search.results': 'Results for',
    'search.found': 'results found',
    'search.noResults': 'No results found',
    'search.tryAgain': 'Try using different keywords',
    'search.loading': 'Searching...',
    'search.error': 'Error searching. Please try again.',
    'search.minLength': 'Enter at least 2 characters',
    'search.noOverview': 'No description available',
    
    // Hero
    'hero.watchNow': 'Watch now',
    'hero.details': 'Details',
    'hero.watchMore': 'More titles to watch',
    'hero.plans': 'Plans',
    'hero.cta': 'Watch now',
    
    // Categories
    'nav.home': 'HOME',
    'nav.suspense': 'THRILLER',
    'nav.comedy': 'COMEDY',
    'nav.action': 'ACTION',
    'nav.horror': 'HORROR',
    'nav.drama': 'DRAMA',
    'nav.fiction': 'FICTION',
    'nav.mystery': 'MYSTERY',
    
    // Sections
    'section.popular': 'Popular Movies',
    'section.series': 'Trending Series',
    
    // Modal TMDB
    'modal.title': 'Configure TMDB API',
    'modal.description': 'Enter your TMDB API key to load real catalogs. The key will be saved only in your browser (localStorage).',
    'modal.label': 'API Key',
    'modal.placeholder': 'Paste your API key here',
    'modal.hint': 'Tip: you can also use ?tmdb_api_key=YOURKEY in the URL.',
    'modal.save': 'Save',
    'modal.clear': 'Remove',
    'modal.cancel': 'Cancel',
    
    // Footer
    'footer.help': 'Help Center',
    'footer.terms': 'Terms of Use',
    'footer.privacy': 'Privacy Policy',
    'footer.corporate': 'Corporate Information',
    'footer.notices': 'Legal Notices',
    'footer.legalHelp': 'Legal Help Center',
    'footer.terms': 'Terms of Use',
    'footer.privacy': 'Privacy',
    'footer.corporate': 'Corporate Information',
    'footer.legal': 'Legal Notices',
    'footer.legalCenter': 'Legal Help Center',
    'footer.language': 'Language',
    'footer.copyright': 'CineHome Brazil'
  },
  
  'es-ES': {
    // Header
    'search.placeholder': 'Buscar películas...',
    'btn.logout': 'Salir',
    'btn.login': 'Iniciar sesión',
    'btn.settings': 'Configurar TMDB',
    
    // Search
    'search.results': 'Resultados para',
    'search.found': 'resultados encontrados',
    'search.noResults': 'No se encontraron resultados',
    'search.tryAgain': 'Intenta usar palabras clave diferentes',
    'search.loading': 'Buscando...',
    'search.error': 'Error al buscar. Inténtalo de nuevo.',
    'search.minLength': 'Ingrese al menos 2 caracteres',
    'search.noOverview': 'Sin descripción disponible',
    
    // Hero
    'hero.watchNow': 'Ver ahora',
    'hero.details': 'Detalles',
    'hero.watchMore': 'Más títulos para ver',
    'hero.plans': 'Planes',
    'hero.cta': 'Ver ahora',
    
    // Categories
    'nav.home': 'INICIO',
    'nav.suspense': 'SUSPENSO',
    'nav.comedy': 'COMEDIA',
    'nav.action': 'ACCIÓN',
    'nav.horror': 'TERROR',
    'nav.drama': 'DRAMA',
    'nav.fiction': 'FICCIÓN',
    'nav.mystery': 'MISTERIO',
    
    // Sections
    'section.popular': 'Películas Populares',
    'section.series': 'Series en Tendencia',
    
    // Modal TMDB
    'modal.title': 'Configurar API de TMDB',
    'modal.description': 'Ingrese su clave API de TMDB para cargar catálogos reales. La clave se guardará solo en su navegador (localStorage).',
    'modal.label': 'Clave API',
    'modal.placeholder': 'Pegue su clave API aquí',
    'modal.hint': 'Consejo: también puede usar ?tmdb_api_key=SUCLAVE en la URL.',
    'modal.save': 'Guardar',
    'modal.clear': 'Eliminar',
    'modal.cancel': 'Cancelar',
    
    // Footer
    'footer.help': 'Centro de Ayuda',
    'footer.terms': 'Términos de Uso',
    'footer.privacy': 'Política de Privacidad',
    'footer.corporate': 'Información Corporativa',
    'footer.notices': 'Avisos Legales',
    'footer.legalHelp': 'Centro de Ayuda Legal',
    'footer.terms': 'Términos de Uso',
    'footer.privacy': 'Privacidad',
    'footer.corporate': 'Información Corporativa',
    'footer.legal': 'Avisos Legales',
    'footer.legalCenter': 'Centro de Ayuda Legal',
    'footer.language': 'Idioma',
    'footer.copyright': 'CineHome Brasil'
  }
};

// Função para obter tradução
function t(key, lang = null) {
  const currentLang = lang || localStorage.getItem('app_lang') || document.documentElement.lang || 'pt-BR';
  return translations[currentLang]?.[key] || translations['pt-BR'][key] || key;
}

// Função para aplicar traduções na página
function applyTranslations(lang = null) {
  const currentLang = lang || localStorage.getItem('app_lang') || 'pt-BR';
  
  // Atualizar atributo lang do HTML
  document.documentElement.lang = currentLang;
  
  // Traduzir elementos com data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translation = t(key, currentLang);
    
    // Atualizar diferentes tipos de elementos
    if (el.tagName === 'INPUT' && el.type === 'text') {
      el.placeholder = translation;
    } else if (el.tagName === 'INPUT' && (el.type === 'submit' || el.type === 'button')) {
      el.value = translation;
    } else if (el.hasAttribute('aria-label')) {
      el.setAttribute('aria-label', translation);
    } else {
      el.textContent = translation;
    }
  });
  
  console.log(`✅ Traduções aplicadas: ${currentLang}`);
}

// Inicializar traduções quando a página carregar
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => applyTranslations());
} else {
  applyTranslations();
}

// Exportar para uso global
window.translations = translations;
window.t = t;
window.applyTranslations = applyTranslations;
