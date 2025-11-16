/**
 * Serviço para integração com a API do TMDB (The Movie Database)
 * Permite buscar informações de filmes e séries em tempo real
 */

const axios = require('axios');

// URL base da API TMDB
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

/**
 * Obtém a chave API do TMDB
 * Pode vir de variável de ambiente ou de configuração do usuário
 */
function getTMDBApiKey() {
  // Verificar se há chave no .env
  if (process.env.TMDB_API_KEY) {
    console.log('✅ TMDB API Key encontrada');
    return process.env.TMDB_API_KEY;
  }
  
  // Chave padrão (você deve adicionar sua própria chave)
  // Obtenha gratuitamente em: https://www.themoviedb.org/settings/api
  console.warn('⚠️ TMDB API Key NÃO encontrada em .env');
  return null;
}

/**
 * Busca filme por título na API TMDB
 * @param {string} query - Termo de busca (título do filme)
 * @param {string} language - Idioma dos resultados (padrão: pt-BR)
 * @returns {Promise<Object>} - Resultados da busca
 */
async function searchMovie(query, language = 'pt-BR') {
  const apiKey = getTMDBApiKey();
  
  if (!apiKey) {
    throw new Error('Chave API do TMDB não configurada. Configure TMDB_API_KEY no arquivo .env');
  }
  
  try {
    console.log(`🔍 Buscando no TMDB: "${query}" (idioma: ${language})`);
    const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
      params: {
        api_key: apiKey,
        query: query,
        language: language,
        page: 1
      },
      timeout: 10000
    });
    
    console.log(`✅ TMDB retornou ${response.data.results?.length || 0} resultados`);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao buscar filme no TMDB:', error.message);
    throw error;
  }
}

/**
 * Obtém detalhes completos de um filme específico
 * @param {number} movieId - ID do filme no TMDB
 * @param {string} language - Idioma dos resultados
 * @returns {Promise<Object>} - Detalhes do filme
 */
async function getMovieDetails(movieId, language = 'pt-BR') {
  const apiKey = getTMDBApiKey();
  
  if (!apiKey) {
    throw new Error('Chave API do TMDB não configurada');
  }
  
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: apiKey,
        language: language,
        append_to_response: 'credits,videos,similar'
      },
      timeout: 10000
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao obter detalhes do filme:', error.message);
    throw error;
  }
}

/**
 * Busca filmes populares do momento
 * @param {string} language - Idioma dos resultados
 * @param {number} page - Página dos resultados
 * @returns {Promise<Object>} - Lista de filmes populares
 */
async function getPopularMovies(language = 'pt-BR', page = 1) {
  const apiKey = getTMDBApiKey();
  
  if (!apiKey) {
    throw new Error('Chave API do TMDB não configurada');
  }
  
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
      params: {
        api_key: apiKey,
        language: language,
        page: page
      },
      timeout: 10000
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao obter filmes populares:', error.message);
    throw error;
  }
}

/**
 * Busca filmes mais bem avaliados
 * @param {string} language - Idioma dos resultados
 * @param {number} page - Página dos resultados
 * @returns {Promise<Object>} - Lista de filmes bem avaliados
 */
async function getTopRatedMovies(language = 'pt-BR', page = 1) {
  const apiKey = getTMDBApiKey();
  
  if (!apiKey) {
    throw new Error('Chave API do TMDB não configurada');
  }
  
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/top_rated`, {
      params: {
        api_key: apiKey,
        language: language,
        page: page
      },
      timeout: 10000
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao obter filmes bem avaliados:', error.message);
    throw error;
  }
}

/**
 * Formata informações do filme para exibição amigável
 * @param {Object} movie - Objeto do filme retornado pela API
 * @returns {Object} - Informações formatadas
 */
function formatMovieInfo(movie) {
  // Extraire la bande-annonce YouTube depuis les vidéos
  const trailerVideo = movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  
  // Extraire le réalisateur depuis les crédits
  const director = movie.credits?.crew?.find(c => c.job === 'Director')?.name || 'N/A';
  
  // Extraire les scénaristes depuis les crédits
  const writers = movie.credits?.crew?.filter(c => c.job === 'Writer' || c.job === 'Screenplay')
    .map(w => w.name)
    .slice(0, 2)
    .join(', ') || 'N/A';
  
  // Formater la durée
  const durationFormatted = movie.runtime 
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` 
    : 'N/A';
  
  // Formater le budget et revenue
  const formatCurrency = (amount) => {
    if (!amount || amount === 0) return 'N/A';
    return '$' + amount.toLocaleString('en-US');
  };
  
  return {
    id: movie.id,
    titulo: movie.title || movie.original_title,
    tituloOriginal: movie.original_title,
    ano: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
    avaliacao: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
    numeroVotos: movie.vote_count || 0,
    sinopse: movie.overview || 'Sinopse não disponível',
    posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
    backdropUrl: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
    generos: movie.genres ? movie.genres.map(g => g.name).join(', ') : 'N/A',
    duracao: durationFormatted,
    idioma: movie.original_language,
    popularidade: movie.popularity || 0,
    // Informations supplémentaires pour la page de détails
    diretor: director,
    roteirista: writers,
    dataLancamento: movie.release_date || 'N/A',
    orcamento: formatCurrency(movie.budget),
    receita: formatCurrency(movie.revenue),
    trailerYoutubeId: trailerVideo?.key || null,
    status: movie.status || 'Released',
    certificacao: 'PG-13' // TMDB ne fournit pas toujours cette info
  };
}

/**
 * Busca e formata informações de um filme
 * @param {string} query - Nome do filme
 * @returns {Promise<Object>} - Informações formatadas do filme
 */
async function searchAndFormatMovie(query) {
  try {
    // Buscar filme
    const searchResults = await searchMovie(query);
    
    if (!searchResults.results || searchResults.results.length === 0) {
      return {
        encontrado: false,
        mensagem: `Nenhum filme encontrado com o termo "${query}"`
      };
    }
    
    // Pegar o primeiro resultado (mais relevante)
    const firstResult = searchResults.results[0];
    
    // Obter detalhes completos
    const movieDetails = await getMovieDetails(firstResult.id);
    
    // Formatar informações
    const formattedInfo = formatMovieInfo(movieDetails);
    
    return {
      encontrado: true,
      filme: formattedInfo,
      resultadosAdicionais: searchResults.results.length - 1
    };
  } catch (error) {
    console.error('Erro ao buscar e formatar filme:', error.message);
    return {
      encontrado: false,
      erro: error.message
    };
  }
}

module.exports = {
  searchMovie,
  getMovieDetails,
  getPopularMovies,
  getTopRatedMovies,
  formatMovieInfo,
  searchAndFormatMovie,
  getTMDBApiKey
};
