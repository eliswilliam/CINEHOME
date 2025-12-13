/**
 * Movie Cast and Recommendations Module
 * Módulo de Elenco e Recomendações para Projetos
 * 
 * USAGE: Importar este arquivo em seu projeto e usar as funções abaixo
 * 
 * Exemplo:
 * <script src="movie-cast-and-recommendations.js"></script>
 * 
 * Depois chamar:
 * renderCast(castArray);
 * renderSimilar(similarMoviesArray);
 */

// ============================================================================
// CONFIGURAÇÃO PADRÃO DO TMDB
// ============================================================================

const TMDB_IMG = {
    posterBase: 'https://image.tmdb.org/t/p/w500',
    backdropBase: 'https://image.tmdb.org/t/p/original',
    profileBase: 'https://image.tmdb.org/t/p/w185'
};

// ============================================================================
// 1. RENDER CAST (ELENCO)
// ============================================================================

/**
 * Renderiza os membros do elenco em cards
 * 
 * @param {Array} cast - Array de atores com: id, name, character, profilePath
 * @param {string} containerId - ID do container HTML (padrão: 'cast-grid')
 * 
 * Exemplo de dados esperados:
 * [
 *   {
 *     id: 1,
 *     name: "Actor Name",
 *     character: "Character Name",
 *     profilePath: "https://image.tmdb.org/t/p/w185/..."
 *   }
 * ]
 * 
 * HTML necessário:
 * <div id="cast-container">
 *   <h2>Elenco principal</h2>
 *   <div id="cast-grid" class="cast-grid"></div>
 * </div>
 */
function renderCast(cast, containerId = 'cast-grid') {
    const castGrid = document.getElementById(containerId);
    const castContainer = document.getElementById('cast-container');
    
    if (!castGrid) {
        console.warn(`❌ Elemento não encontrado: ${containerId}`);
        return;
    }

    if (!cast || cast.length === 0) {
        if (castContainer) castContainer.hidden = true;
        return;
    }

    castGrid.innerHTML = '';
    if (castContainer) castContainer.hidden = false;

    cast.forEach(actor => {
        const actorCard = document.createElement('div');
        actorCard.className = 'cast-card';
        
        const img = document.createElement('img');
        img.src = actor.profilePath || 'https://via.placeholder.com/185x278?text=No+Image';
        img.alt = actor.name;
        img.className = 'cast-image';
        img.loading = 'lazy';
        
        // Otimização de imagem
        if (actor.profilePath) {
            img.src = actor.profilePath;
            img.dataset.src = actor.profilePath;
        }
        
        // Fallback para imagem padrão em caso de erro
        img.onerror = function() { 
            this.src = 'https://via.placeholder.com/185x278?text=No+Photo'; 
        };

        const nameDiv = document.createElement('div');
        nameDiv.className = 'cast-name';
        nameDiv.textContent = actor.name;

        const characterDiv = document.createElement('div');
        characterDiv.className = 'cast-character';
        characterDiv.textContent = actor.character || 'Papel desconhecido';

        actorCard.appendChild(img);
        actorCard.appendChild(nameDiv);
        actorCard.appendChild(characterDiv);
        castGrid.appendChild(actorCard);
    });

    console.log(`✅ ${cast.length} atores renderizados`);
}

// ============================================================================
// 2. RENDER SIMILAR MOVIES (RECOMENDAÇÕES)
// ============================================================================

/**
 * Renderiza filmes similares/recomendados em carousel
 * 
 * @param {Array} similar - Array de filmes similares
 * @param {string} carouselId - ID do carousel (padrão: 'carousel-similar')
 * @param {string} containerId - ID do container (padrão: 'similar-container')
 * 
 * Exemplo de dados esperados:
 * [
 *   {
 *     id: 123,
 *     title: "Movie Title",
 *     poster: "https://image.tmdb.org/t/p/w500/...",
 *     rating: "8.5",
 *     year: "2023",
 *     mediaType: "movie"
 *   }
 * ]
 * 
 * HTML necessário:
 * <div id="similar-container">
 *   <h2>Recomendações</h2>
 *   <div class="carousel-wrapper">
 *     <button id="nav-similar-left" class="carousel-nav left">❮</button>
 *     <div id="carousel-similar" class="carousel"></div>
 *     <button id="nav-similar-right" class="carousel-nav right">❯</button>
 *   </div>
 * </div>
 */
function renderSimilar(similar, carouselId = 'carousel-similar', containerId = 'similar-container') {
    const carousel = document.getElementById(carouselId);
    const similarContainer = document.getElementById(containerId);
    
    if (!carousel) {
        console.warn(`❌ Elemento não encontrado: ${carouselId}`);
        return;
    }

    if (!similar || similar.length === 0) {
        if (similarContainer) similarContainer.hidden = true;
        return;
    }

    carousel.innerHTML = '';
    if (similarContainer) similarContainer.hidden = false;

    similar.forEach(item => {
        if (!item.poster) return; // Pula se não tiver poster

        const card = document.createElement('button');
        card.className = 'movie-card';
        card.type = 'button';
        card.title = `${item.title} (${item.year})`;
        
        // Redireciona para página de detalhes do filme
        card.onclick = () => {
            const movieType = item.mediaType || 'movie';
            window.location.href = `movie-details.html?id=${item.id}&type=${movieType}&title=${encodeURIComponent(item.title)}`;
        };

        card.innerHTML = `
            <img class="movie-image" 
                 src="${item.poster}" 
                 alt="${item.title}" 
                 loading="lazy"
                 onerror="this.src='https://via.placeholder.com/185x278?text=No+Image'">
            <div class="movie-info">
                <div class="movie-title">${item.title}</div>
                <div class="movie-year">${item.year || 'N/A'}</div>
                <div class="movie-rating">
                    <span class="stars">★</span>
                    <span>${item.rating || 'N/A'}</span>
                </div>
            </div>
        `;
        carousel.appendChild(card);
    });

    // Inicializar navegação do carousel
    initCarouselNav('similar');

    console.log(`✅ ${similar.length} filmes recomendados renderizados`);
}

// ============================================================================
// 3. INICIALIZAR NAVEGAÇÃO DO CAROUSEL
// ============================================================================

/**
 * Inicializa os botões de navegação do carousel
 * 
 * @param {string} carouselId - ID base do carousel (sem 'carousel-' no prefixo)
 * 
 * HTML necessário:
 * <button id="nav-{carouselId}-left" class="carousel-nav left">❮</button>
 * <div id="carousel-{carouselId}" class="carousel"></div>
 * <button id="nav-{carouselId}-right" class="carousel-nav right">❯</button>
 */
function initCarouselNav(carouselId) {
    const carousel = document.getElementById(`carousel-${carouselId}`);
    const leftBtn = document.getElementById(`nav-${carouselId}-left`);
    const rightBtn = document.getElementById(`nav-${carouselId}-right`);

    if (!carousel || !leftBtn || !rightBtn) {
        console.warn(`⚠️ Carousel ${carouselId}: elementos não encontrados`);
        return;
    }

    // Scroll para esquerda
    leftBtn.onclick = () => {
        carousel.scrollBy({ left: -300, behavior: 'smooth' });
    };

    // Scroll para direita
    rightBtn.onclick = () => {
        carousel.scrollBy({ left: 300, behavior: 'smooth' });
    };

    console.log(`✅ Navegação do carousel '${carouselId}' inicializada`);
}

// ============================================================================
// 4. RENDER SOCIAL LINKS (LINKS DE REDES SOCIAIS)
// ============================================================================

/**
 * Renderiza links de redes sociais do filme
 * 
 * @param {Object} social - Objeto com IDs de redes sociais
 * @param {string} containerId - ID do container (padrão: 'movie-social-links')
 * 
 * Exemplo de dados:
 * {
 *   imdb_id: "tt1234567",
 *   facebook_id: "123456789",
 *   instagram_id: "movieaccount",
 *   twitter_id: "moviehandle"
 * }
 * 
 * HTML necessário:
 * <div id="movie-social-links" class="social-links"></div>
 */
function renderSocialLinks(social, containerId = 'movie-social-links') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn(`❌ Elemento não encontrado: ${containerId}`);
        return;
    }

    container.innerHTML = '';

    const icons = {
        imdb: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M13.665 0h-2.133v24h2.133v-11.741l1.979 11.741h2.064l1.979-11.741v11.741h2.133v-24h-2.133l-2.967 15.609-2.966-15.609zm-13.665 0h2.133v24h-2.133v-24zm10.133 0h-2.133v24h2.133v-24zm-6.666 0h-3.467v24h2.133v-10.666h1.334c2.444 0 4.267-1.6 4.267-6.667s-1.822-6.667-4.267-6.667zm-.133 11.2h-1.2v-9.066h1.2c1.334 0 2.133.533 2.133 4.533s-.8 4.533-2.133 4.533z"/></svg>',
        facebook: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
        instagram: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
        twitter: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>'
    };

    const createLink = (id, platform, icon) => {
        if (!id) return null;
        const link = document.createElement('a');
        link.href = getSocialUrl(platform, id);
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = `social-link ${platform}`;
        link.title = platform.charAt(0).toUpperCase() + platform.slice(1);
        link.innerHTML = icon;
        return link;
    };

    if (social.imdb_id) {
        const link = createLink(social.imdb_id, 'imdb', icons.imdb);
        if (link) container.appendChild(link);
    }
    if (social.facebook_id) {
        const link = createLink(social.facebook_id, 'facebook', icons.facebook);
        if (link) container.appendChild(link);
    }
    if (social.instagram_id) {
        const link = createLink(social.instagram_id, 'instagram', icons.instagram);
        if (link) container.appendChild(link);
    }
    if (social.twitter_id) {
        const link = createLink(social.twitter_id, 'twitter', icons.twitter);
        if (link) container.appendChild(link);
    }

    console.log(`✅ Links de redes sociais renderizados`);
}

// ============================================================================
// 5. GET SOCIAL URL (GERA URL DE REDE SOCIAL)
// ============================================================================

/**
 * Gera a URL correta para cada rede social
 * 
 * @param {string} platform - Nome da plataforma ('imdb', 'facebook', 'instagram', 'twitter')
 * @param {string} id - ID da conta/página
 * @returns {string} URL da rede social
 */
function getSocialUrl(platform, id) {
    const urls = {
        imdb: `https://www.imdb.com/title/${id}`,
        facebook: `https://www.facebook.com/${id}`,
        instagram: `https://www.instagram.com/${id}`,
        twitter: `https://twitter.com/${id}`
    };
    return urls[platform] || '#';
}

// ============================================================================
// 6. RENDER COLLECTION (COLEÇÃO DE FILMES)
// ============================================================================

/**
 * Renderiza informações da coleção do filme
 * 
 * @param {Object} collection - Dados da coleção
 * @param {string} containerId - ID do container (padrão: 'collection-container')
 * 
 * Exemplo de dados:
 * {
 *   id: 123,
 *   name: "Collection Name",
 *   poster_path: "/...",
 *   backdrop_path: "/..."
 * }
 * 
 * HTML necessário:
 * <div id="collection-container">
 *   <h2 id="collection-title">Coleção</h2>
 *   <div id="collection-content"></div>
 * </div>
 */
function renderCollection(collection, containerId = 'collection-container') {
    const container = document.getElementById(containerId);
    const content = document.getElementById('collection-content');
    
    if (!container || !content) {
        console.warn(`❌ Elementos de coleção não encontrados`);
        return;
    }

    if (!collection) {
        container.hidden = true;
        return;
    }

    container.hidden = false;
    
    // Usar backdrop se disponível, senão poster
    const image = collection.backdrop || collection.poster || '';
    
    content.innerHTML = `
        <div class="collection-card" style="background-image: linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 100%), url('${image}')">
            <div class="collection-info">
                <h3>${collection.name}</h3>
                <button class="btn btn-primary btn-sm" onclick="window.open('https://www.themoviedb.org/collection/${collection.id}', '_blank')">
                    Ver Coleção
                </button>
            </div>
        </div>
    `;

    console.log(`✅ Coleção '${collection.name}' renderizada`);
}

// ============================================================================
// 7. RENDER SIDEBAR (BARRA LATERAL COM INFORMAÇÕES)
// ============================================================================

/**
 * Renderiza informações na barra lateral
 * 
 * @param {Object} movie - Dados completos do filme
 * 
 * HTML necessário:
 * <div id="watch-provider-container"></div>
 * <div id="sidebar-social" class="social-links"></div>
 * <div id="sidebar-info"></div>
 * <div id="keywords-list"></div>
 */
function renderSidebar(movie) {
    // 1. Botão "Assistir Agora"
    const watchContainer = document.getElementById('watch-provider-container');
    if (watchContainer) {
        const provider = movie.providers && movie.providers.length > 0 ? movie.providers[0] : null;
        if (provider) {
            watchContainer.innerHTML = `
                <button class="btn-watch-now" onclick="window.open('https://www.themoviedb.org/movie/${movie.id}/watch', '_blank')">
                    <img src="${TMDB_IMG.posterBase}${provider.logo_path}" class="provider-logo" alt="${provider.provider_name}">
                    <div class="watch-text">
                        <span class="watch-label">Disponível em</span>
                        <span class="watch-action">Assista Agora</span>
                    </div>
                </button>
            `;
        } else {
            watchContainer.innerHTML = '';
        }
    }

    // 2. Links Sociais (Barra Lateral)
    const socialContainer = document.getElementById('sidebar-social');
    if (socialContainer && movie.social) {
        const icons = {
            facebook: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
            instagram: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
            twitter: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>',
            imdb: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M13.665 0h-2.133v24h2.133v-11.741l1.979 11.741h2.064l1.979-11.741v11.741h2.133v-24h-2.133l-2.967 15.609-2.966-15.609zm-13.665 0h2.133v24h-2.133v-24zm10.133 0h-2.133v24h2.133v-24zm-6.666 0h-3.467v24h2.133v-10.666h1.334c2.444 0 4.267-1.6 4.267-6.667s-1.822-6.667-4.267-6.667zm-.133 11.2h-1.2v-9.066h1.2c1.334 0 2.133.533 2.133 4.533s-.8 4.533-2.133 4.533z"/></svg>'
        };

        const createLink = (id, platform, icon) => {
            if (!id) return '';
            const url = getSocialUrl(platform, id);
            return `<a href="${url}" target="_blank" class="sidebar-social-link" title="${platform}">
                        ${icon}
                    </a>`;
        };
        
        let html = '';
        html += createLink(movie.social.facebook_id, 'facebook', icons.facebook);
        html += createLink(movie.social.instagram_id, 'instagram', icons.instagram);
        html += createLink(movie.social.twitter_id, 'twitter', icons.twitter);
        html += createLink(movie.social.imdb_id, 'imdb', icons.imdb);
        
        socialContainer.innerHTML = html;
    }

    // 3. Info Block (Status, Rede, Tipo, Idioma)
    const infoContainer = document.getElementById('sidebar-info');
    if (infoContainer) {
        let infoHtml = '';
        
        // Status
        infoHtml += `<div class="info-item"><strong>Situação</strong><span>${movie.status || 'Desconhecido'}</span></div>`;
        
        // Rede (se for série)
        if (movie.networks && movie.networks.length > 0) {
            const network = movie.networks[0];
            const networkLogo = network.logo_path ? `<img src="${TMDB_IMG.posterBase}${network.logo_path}" alt="${network.name}" style="height:20px; vertical-align:middle;">` : network.name;
            infoHtml += `<div class="info-item"><strong>Emissora</strong><span>${networkLogo}</span></div>`;
        }
        
        // Tipo
        infoHtml += `<div class="info-item"><strong>Tipo</strong><span>${movie.mediaType === 'tv' ? 'Série' : 'Filme'}</span></div>`;
        
        // Idioma Original
        infoHtml += `<div class="info-item"><strong>Idioma</strong><span>${(movie.originalLanguage || 'en').toUpperCase()}</span></div>`;
        
        infoContainer.innerHTML = infoHtml;
    }

    // 4. Keywords (Palavras-chave)
    const keywordsContainer = document.getElementById('keywords-list');
    if (keywordsContainer && movie.keywords && movie.keywords.length > 0) {
        keywordsContainer.innerHTML = movie.keywords
            .map(k => `<span class="keyword-tag">${k.name || k}</span>`)
            .join('');
    }

    console.log(`✅ Informações da barra lateral renderizadas`);
}

// ============================================================================
// 8. RENDER SEASONS (TEMPORADAS - APENAS PARA SÉRIES)
// ============================================================================

/**
 * Renderiza informações das temporadas (apenas para séries TV)
 * 
 * @param {Object} movie - Dados do filme/série com array de seasons
 * 
 * HTML necessário:
 * <div id="seasons-container" hidden>
 *   <h2>Temporada Atual</h2>
 *   <div id="current-season-card"></div>
 * </div>
 */
function renderSeasons(movie) {
    const container = document.getElementById('seasons-container');
    const card = document.getElementById('current-season-card');
    
    if (!container || !card || !movie.seasons || movie.seasons.length === 0) {
        return;
    }

    container.hidden = false;
    
    // Encontrar última temporada (geralmente a atual)
    const lastSeason = movie.seasons[movie.seasons.length - 1];
    const poster = lastSeason.poster_path ? `${TMDB_IMG.posterBase}${lastSeason.poster_path}` : movie.poster;
    const year = lastSeason.air_date ? lastSeason.air_date.split('-')[0] : '';
    
    card.innerHTML = `
        <div class="season-poster">
            <img src="${poster}" alt="${lastSeason.name}" loading="lazy">
        </div>
        <div class="season-info">
            <h3>${lastSeason.name}</h3>
            <div class="season-meta">
                <span class="season-rating">★ ${lastSeason.vote_average || 'N/A'}</span>
                <span>${year} • ${lastSeason.episode_count || 0} episódios</span>
            </div>
            <p class="season-overview">${lastSeason.overview || 'Sinopse não disponível para esta temporada.'}</p>
        </div>
    `;

    console.log(`✅ Temporadas renderizadas`);
}
