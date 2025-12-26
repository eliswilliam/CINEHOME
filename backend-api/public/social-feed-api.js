/**
 * Social Feed Module - Threads-like social network for movies with API Backend
 * Utilise l'API backend pour gérer les posts, likes et commentaires
 */

console.log('🎬 Social Feed API: Chargement du module...');

(function() {
    'use strict';

    // Configuration de l'API
    const API_BASE_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:10000/api' 
        : '/api';
    
    console.log('🔧 Social Feed API: URL configurée:', API_BASE_URL);

    // État du feed social
    let socialPosts = [];
    let currentUserProfile = null;
    let currentRating = 0;
    let currentPage = 1;
    let isLoading = false;
    let hasMore = true;

    // Initialiser au chargement du DOM
    document.addEventListener('DOMContentLoaded', initSocialFeed);

    /**
     * Initialise le module de feed social
     */
    function initSocialFeed() {
        console.log('🚀 Social Feed: Initialisation...');
        currentUserProfile = getCurrentUserProfile();
        console.log('👤 Profil utilisateur:', currentUserProfile);
        setupEventListeners();
        loadPosts();
        populateMovieDropdown();
        setupHeaderButton();
        setupInfiniteScroll();
        console.log('✅ Social Feed: Initialisé!');
    }

    /**
     * Configure le bouton du header pour ouvrir la page social
     */
    function setupHeaderButton() {
        const socialBtn = document.getElementById('social-btn');
        if (socialBtn) {
            socialBtn.addEventListener('click', () => {
                window.location.href = 'social-feed.html';
            });
        }
    }

    /**
     * Configure le scroll infini
     */
    function setupInfiniteScroll() {
        window.addEventListener('scroll', () => {
            if (isLoading || !hasMore) return;

            const scrollHeight = document.documentElement.scrollHeight;
            const scrollTop = document.documentElement.scrollTop;
            const clientHeight = document.documentElement.clientHeight;

            if (scrollTop + clientHeight >= scrollHeight - 500) {
                loadPosts(currentPage + 1);
            }
        });
    }

    /**
     * Configure tous les écouteurs d'événements
     */
    function setupEventListeners() {
        // Bouton "Nouveau Post"
        const newPostBtn = document.getElementById('social-new-post-btn');
        if (newPostBtn) {
            newPostBtn.addEventListener('click', openComposer);
        }

        // Input du compositeur (ouverture au clic)
        const postCreatorInput = document.querySelector('.post-creator-input');
        if (postCreatorInput) {
            postCreatorInput.addEventListener('click', openComposer);
        }

        // Modal - Fermeture
        document.querySelectorAll('[data-action="close-composer"]').forEach(btn => {
            btn.addEventListener('click', closeComposer);
        });

        // Modal - Soumission
        const submitBtn = document.getElementById('composer-submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', submitPost);
        }

        // Stars de notation
        document.querySelectorAll('.star-btn').forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                setRating(rating);
            });

            star.addEventListener('mouseenter', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                previewRating(rating);
            });
        });

        // Remettre à zéro la notation au départ
        document.querySelectorAll('.rating-stars').forEach(container => {
            container.addEventListener('mouseleave', updateRatingDisplay);
        });

        // Fermer le modal en cliquant en dehors
        const modal = document.getElementById('social-composer-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeComposer();
                }
            });
        }
    }

    /**
     * Ouvre le compositeur de post
     */
    function openComposer() {
        const modal = document.getElementById('social-composer-modal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            const textarea = document.getElementById('composer-textarea');
            if (textarea) {
                textarea.focus();
            }
        }
    }

    /**
     * Ferme le compositeur de post
     */
    function closeComposer() {
        const modal = document.getElementById('social-composer-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            resetComposer();
        }
    }

    /**
     * Réinitialise le formulaire du compositeur
     */
    function resetComposer() {
        const textarea = document.getElementById('composer-textarea');
        const movieSelect = document.getElementById('composer-movie-select');
        
        if (textarea) textarea.value = '';
        if (movieSelect) movieSelect.value = '';
        currentRating = 0;
        updateRatingDisplay();
    }

    /**
     * Définit la notation
     */
    function setRating(rating) {
        currentRating = rating;
        updateRatingDisplay();
    }

    /**
     * Aperçu de la notation au survol
     */
    function previewRating(rating) {
        const stars = document.querySelectorAll('.rating-stars .star-btn');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.style.color = '#ffc107';
            } else {
                star.style.color = currentRating > index ? '#ffc107' : '#666666';
            }
        });
    }

    /**
     * Met à jour l'affichage des stars
     */
    function updateRatingDisplay() {
        const stars = document.querySelectorAll('.rating-stars .star-btn');
        stars.forEach((star, index) => {
            if (index < currentRating) {
                star.classList.add('active');
                star.style.color = '#ffc107';
            } else {
                star.classList.remove('active');
                star.style.color = '#666666';
            }
        });
    }

    /**
     * Soumet un nouveau post via l'API
     */
    async function submitPost() {
        const text = document.getElementById('composer-textarea').value.trim();
        const movieSelect = document.getElementById('composer-movie-select');
        const movieId = movieSelect.value;

        if (!text) {
            alert('Escreva algo antes de publicar!');
            return;
        }

        // Obtenir les infos du film sélectionné
        let movieTitle = null;
        let moviePoster = null;
        
        if (movieId) {
            const moviePosters = {
                'oppenheimer': 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
                'duna-parte-dois': 'https://image.tmdb.org/t/p/w500/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg',
                'parasita': 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
                'shutter-island': 'https://image.tmdb.org/t/p/w500/kve20tXwUZpu4GUX8l6X7Z4jmL6.jpg',
                'deadpool': 'https://image.tmdb.org/t/p/w500/fSRb7vyIP8rQpL0I47P3qUsEKX3.jpg',
                'mad-max': 'https://image.tmdb.org/t/p/w500/8tZYtuWezp8JbcsvHYO0O46tFbo.jpg',
                'o-iluminado': 'https://image.tmdb.org/t/p/w500/b6ko0IKC8MdYBBPkkA1aBPLe2yz.jpg',
                'matrix': 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
                'forrest-gump': 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
                'interestelar': 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg'
            };
            
            movieTitle = movieSelect.options[movieSelect.selectedIndex].text;
            moviePoster = moviePosters[movieId] || null;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    author: currentUserProfile.name,
                    handle: currentUserProfile.handle,
                    avatar: currentUserProfile.avatar,
                    text: text,
                    movieId: movieId || null,
                    movieTitle: movieTitle,
                    moviePoster: moviePoster,
                    rating: currentRating
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao criar post');
            }

            closeComposer();
            showNotification('Post publicado com sucesso!', 'success');
            
            // Recharger les posts
            currentPage = 1;
            socialPosts = [];
            await loadPosts(1);
            
        } catch (error) {
            console.error('Erro ao publicar post:', error);
            showNotification('Erro ao publicar post. Tente novamente.', 'error');
        }
    }

    /**
     * Charge les posts depuis l'API
     */
    async function loadPosts(page = 1) {
        console.log('📥 Chargement des posts... Page:', page);
        
        if (isLoading) {
            console.log('⏳ Déjà en chargement, ignoré');
            return;
        }
        
        isLoading = true;
        showLoader();

        try {
            const url = `${API_BASE_URL}/posts?page=${page}&limit=20`;
            console.log('🌐 Requête API:', url);
            
            const response = await fetch(url);
            console.log('📡 Réponse API:', response.status, response.ok);
            
            if (!response.ok) {
                throw new Error('Erro ao carregar posts');
            }

            const data = await response.json();
            console.log('📦 Données reçues:', data);
            console.log('📝 Nombre de posts:', data.posts?.length);
            
            if (page === 1) {
                socialPosts = data.posts;
            } else {
                socialPosts = [...socialPosts, ...data.posts];
            }

            currentPage = data.pagination.currentPage;
            hasMore = data.pagination.hasMore;

            console.log('✅ Posts chargés! Total:', socialPosts.length);
            renderFeed();
        } catch (error) {
            console.error('❌ Erro ao carregar posts:', error);
            showNotification('Erro ao carregar posts', 'error');
        } finally {
            isLoading = false;
            hideLoader();
        }
    }

    /**
     * Afficher le loader
     */
    function showLoader() {
        let loader = document.getElementById('social-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'social-loader';
            loader.style.cssText = `
                text-align: center;
                padding: 20px;
                color: #888;
            `;
            loader.textContent = 'Carregando...';
            document.getElementById('social-feed-container')?.appendChild(loader);
        }
        loader.style.display = 'block';
    }

    /**
     * Masquer le loader
     */
    function hideLoader() {
        const loader = document.getElementById('social-loader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    /**
     * Rendre le feed
     */
    function renderFeed() {
        const feedContainer = document.getElementById('social-feed-container');
        if (!feedContainer) return;

        // Garder le loader
        const loader = document.getElementById('social-loader');
        
        feedContainer.innerHTML = socialPosts.map(post => createPostElement(post)).join('');
        
        // Réattacher le loader
        if (loader) {
            feedContainer.appendChild(loader);
        }

        // Attacher les événements
        attachPostEventListeners(feedContainer);
    }

    /**
     * Attache les événements aux posts
     */
    function attachPostEventListeners(feedContainer) {
        // Actions sur les posts
        feedContainer.querySelectorAll('.social-post-action').forEach(action => {
            action.addEventListener('click', handlePostAction);
        });

        // Inputs de commentaires
        feedContainer.querySelectorAll('.social-comment-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && input.value.trim()) {
                    submitComment(input.dataset.postId, input.value);
                }
            });
        });

        feedContainer.querySelectorAll('.social-comment-submit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = btn.dataset.postId;
                const input = feedContainer.querySelector(`.social-comment-input[data-post-id="${postId}"]`);
                if (input && input.value.trim()) {
                    submitComment(postId, input.value);
                }
            });
        });

        // Écouteurs pour les actions sur les commentaires
        feedContainer.querySelectorAll('.social-comment-action').forEach(action => {
            action.addEventListener('click', handleCommentAction);
        });

        // Menu du post
        feedContainer.querySelectorAll('.social-post-menu').forEach(menu => {
            menu.addEventListener('click', (e) => {
                const postId = menu.dataset.postId;
                showPostMenu(postId, e);
            });
        });
    }

    /**
     * Crée un élément HTML pour un post
     */
    function createPostElement(post) {
        const ratingStars = '★'.repeat(post.rating) + '☆'.repeat(5 - post.rating);
        const timeAgo = getTimeAgo(post.timestamp);
        const commentsCount = post.comments ? post.comments.length : 0;
        
        // Vérifier si l'utilisateur a liké le post
        const liked = post.likedBy && post.likedBy.includes(currentUserProfile.handle);
        const saved = post.savedBy && post.savedBy.includes(currentUserProfile.handle);

        let movieBadgeHTML = '';
        if (post.movieTitle && post.moviePoster) {
            movieBadgeHTML = `
                <div class="social-post-movie-badge" data-movie-id="${post.movieId}">
                    <img src="${post.moviePoster}" alt="${post.movieTitle}" class="social-post-movie-poster">
                    <div class="social-post-movie-info">
                        <div class="social-post-movie-title">${post.movieTitle}</div>
                        <div class="social-post-rating">${ratingStars}</div>
                    </div>
                </div>
            `;
        }

        // HTML des commentaires
        let commentsHTML = '';
        if (post.comments && post.comments.length > 0) {
            const displayComments = post.comments.slice(0, 2);
            const remainingCount = post.comments.length - 2;
            
            commentsHTML = `
                <div class="social-post-comments">
                    ${displayComments.map(comment => `
                        <div class="social-comment" data-comment-id="${comment._id}">
                            <img src="${comment.avatar}" alt="${comment.author}" class="social-comment-avatar">
                            <div class="social-comment-content">
                                <div class="social-comment-header">
                                    <span class="social-comment-author">${comment.author}</span>
                                    <span class="social-comment-handle">@${comment.handle}</span>
                                    <span class="social-comment-time">· ${getTimeAgo(comment.timestamp)}</span>
                                </div>
                                <p class="social-comment-text">${comment.text}</p>
                                <div class="social-comment-actions">
                                    <button class="social-comment-action" data-action="like-comment" data-comment-id="${comment._id}" data-post-id="${post._id}">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                        </svg>
                                        <span>${comment.likes || 0}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                    ${remainingCount > 0 ? `
                        <button class="social-view-more-comments" data-post-id="${post._id}">
                            Ver mais ${remainingCount} comentário${remainingCount > 1 ? 's' : ''}
                        </button>
                    ` : ''}
                </div>
            `;
        }

        const commentInputHTML = `
            <div class="social-comment-input-wrapper">
                <img src="${currentUserProfile.avatar}" alt="Seu avatar" class="social-comment-input-avatar">
                <input type="text" class="social-comment-input" placeholder="Escreva um comentário..." data-post-id="${post._id}">
                <button class="social-comment-submit" data-post-id="${post._id}" title="Enviar comentário">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        `;

        return `
            <div class="social-post" data-post-id="${post._id}">
                <div class="social-post-header">
                    <img src="${post.avatar}" alt="${post.author}" class="social-post-avatar">
                    <div class="social-post-user-info">
                        <p class="social-post-name">${post.author}</p>
                        <div class="social-post-meta">
                            <span class="social-post-handle">@${post.handle}</span>
                            <span class="social-post-time">· ${timeAgo}</span>
                        </div>
                    </div>
                    <button class="social-post-menu" data-post-id="${post._id}" title="Mais opções">⋯</button>
                </div>

                <div class="social-post-content">
                    <p class="social-post-text">${post.text}</p>
                    ${movieBadgeHTML}
                </div>

                <div class="social-post-actions">
                    <button class="social-post-action ${liked ? 'liked' : ''}" data-action="like" data-post-id="${post._id}">
                        <svg class="heart-icon" viewBox="0 0 24 24" fill="${liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <span>${post.likes}</span>
                    </button>
                    <button class="social-post-action" data-action="comment" data-post-id="${post._id}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>${commentsCount}</span>
                    </button>
                    <button class="social-post-action" data-action="share" data-post-id="${post._id}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                            <polyline points="16 6 12 2 8 6"></polyline>
                            <line x1="12" y1="2" x2="12" y2="15"></line>
                        </svg>
                    </button>
                    <button class="social-post-action ${saved ? 'saved' : ''}" data-action="save" data-post-id="${post._id}">
                        <svg viewBox="0 0 24 24" fill="${saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                        </svg>
                    </button>
                </div>

                ${commentsHTML}
                ${commentInputHTML}
            </div>
        `;
    }

    /**
     * Gère les actions sur les posts
     */
    async function handlePostAction(e) {
        const action = e.currentTarget.dataset.action;
        const postId = e.currentTarget.dataset.postId;

        if (action === 'like') {
            await toggleLike(postId, e.currentTarget);
        } else if (action === 'comment') {
            focusCommentInput(postId);
        } else if (action === 'share') {
            sharePost(postId);
        } else if (action === 'save') {
            await toggleSave(postId, e.currentTarget);
        }
    }

    /**
     * Focus sur l'input de commentaire
     */
    function focusCommentInput(postId) {
        const input = document.querySelector(`.social-comment-input[data-post-id="${postId}"]`);
        if (input) {
            input.focus();
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    /**
     * Soumet un commentaire via l'API
     */
    async function submitComment(postId, text) {
        if (!text.trim()) return;

        try {
            const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    author: currentUserProfile.name,
                    handle: currentUserProfile.handle,
                    avatar: currentUserProfile.avatar,
                    text: text.trim()
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao adicionar comentário');
            }

            showNotification('Comentário publicado!', 'success');
            
            // Recharger les posts
            currentPage = 1;
            socialPosts = [];
            await loadPosts(1);
            
        } catch (error) {
            console.error('Erro ao adicionar comentário:', error);
            showNotification('Erro ao adicionar comentário', 'error');
        }
    }

    /**
     * Gère les actions sur les commentaires
     */
    async function handleCommentAction(e) {
        const action = e.currentTarget.dataset.action;
        const commentId = e.currentTarget.dataset.commentId;
        const postId = e.currentTarget.dataset.postId;

        if (action === 'like-comment') {
            await toggleCommentLike(postId, commentId);
        }
    }

    /**
     * Toggle like sur un commentaire via l'API
     */
    async function toggleCommentLike(postId, commentId) {
        try {
            const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    handle: currentUserProfile.handle
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao curtir comentário');
            }

            // Mise à jour locale
            const post = socialPosts.find(p => p._id === postId);
            if (post && post.comments) {
                const comment = post.comments.find(c => c._id === commentId);
                if (comment) {
                    const data = await response.json();
                    comment.likes = data.likes;
                    renderFeed();
                }
            }
            
        } catch (error) {
            console.error('Erro ao curtir comentário:', error);
            showNotification('Erro ao curtir comentário', 'error');
        }
    }

    /**
     * Afficher le menu du post
     */
    function showPostMenu(postId, event) {
        document.querySelectorAll('.social-post-menu-dropdown').forEach(m => m.remove());

        const menu = document.createElement('div');
        menu.className = 'social-post-menu-dropdown';
        menu.innerHTML = `
            <button class="social-menu-item" data-action="delete" data-post-id="${postId}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Excluir post
            </button>
        `;

        menu.style.position = 'absolute';
        menu.style.top = `${event.target.offsetTop + 30}px`;
        menu.style.right = '16px';
        menu.style.background = '#1a1a1a';
        menu.style.borderRadius = '8px';
        menu.style.padding = '8px';
        menu.style.zIndex = '1000';

        event.target.closest('.social-post').appendChild(menu);

        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 10);

        menu.querySelectorAll('.social-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = item.dataset.action;
                if (action === 'delete') {
                    deletePost(postId);
                }
                menu.remove();
            });
        });
    }

    /**
     * Supprimer un post via l'API
     */
    async function deletePost(postId) {
        if (!confirm('Tem certeza que deseja excluir este post?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    handle: currentUserProfile.handle
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao excluir post');
            }

            showNotification('Post excluído!', 'success');
            
            // Recharger les posts
            currentPage = 1;
            socialPosts = [];
            await loadPosts(1);
            
        } catch (error) {
            console.error('Erro ao excluir post:', error);
            showNotification('Erro ao excluir post', 'error');
        }
    }

    /**
     * Toggle like d'un post via l'API
     */
    async function toggleLike(postId, button) {
        try {
            const response = await fetch(`${API_BASE_URL}/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    handle: currentUserProfile.handle
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao curtir post');
            }

            const data = await response.json();
            
            // Mise à jour locale
            const post = socialPosts.find(p => p._id === postId);
            if (post) {
                post.likes = data.likes;
                
                if (data.liked) {
                    if (!post.likedBy) post.likedBy = [];
                    post.likedBy.push(currentUserProfile.handle);
                } else {
                    post.likedBy = (post.likedBy || []).filter(h => h !== currentUserProfile.handle);
                }
                
                // Animation
                if (button && data.liked) {
                    button.classList.add('like-animation');
                    setTimeout(() => button.classList.remove('like-animation'), 300);
                }
                
                renderFeed();
            }
            
        } catch (error) {
            console.error('Erro ao curtir post:', error);
            showNotification('Erro ao curtir post', 'error');
        }
    }

    /**
     * Toggle sauvegarde d'un post via l'API
     */
    async function toggleSave(postId, button) {
        try {
            const response = await fetch(`${API_BASE_URL}/posts/${postId}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    handle: currentUserProfile.handle
                })
            });

            if (!response.ok) {
                throw new Error('Erro ao salvar post');
            }

            const data = await response.json();
            
            // Mise à jour locale
            const post = socialPosts.find(p => p._id === postId);
            if (post) {
                if (data.saved) {
                    if (!post.savedBy) post.savedBy = [];
                    post.savedBy.push(currentUserProfile.handle);
                } else {
                    post.savedBy = (post.savedBy || []).filter(h => h !== currentUserProfile.handle);
                }
                
                if (button && data.saved) {
                    button.classList.add('save-animation');
                    setTimeout(() => button.classList.remove('save-animation'), 300);
                }
                
                renderFeed();
                showNotification(data.saved ? 'Post salvo!' : 'Post removido dos salvos', 'success');
            }
            
        } catch (error) {
            console.error('Erro ao salvar post:', error);
            showNotification('Erro ao salvar post', 'error');
        }
    }

    /**
     * Partage un post
     */
    function sharePost(postId) {
        const post = socialPosts.find(p => p._id === postId);
        if (post) {
            const shareText = `Confira esta opinião sobre ${post.movieTitle || 'um filme'}: "${post.text}" - CineHome`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'Opinião CineHome',
                    text: shareText,
                    url: window.location.href
                }).catch(err => console.log('Partage annulé'));
            } else {
                navigator.clipboard.writeText(shareText).then(() => {
                    showNotification('Texto copiado para a área de transferência!', 'success');
                }).catch(err => {
                    alert('Não foi possível copiar o texto');
                });
            }
        }
    }

    /**
     * Peuple le dropdown des films
     */
    function populateMovieDropdown() {
        const select = document.getElementById('composer-movie-select');
        if (!select) return;

        const movies = [
            { id: 'oppenheimer', title: 'Oppenheimer' },
            { id: 'duna-parte-dois', title: 'Duna: Parte Dois' },
            { id: 'parasita', title: 'Parasita' },
            { id: 'shutter-island', title: 'Shutter Island' },
            { id: 'deadpool', title: 'Deadpool' },
            { id: 'mad-max', title: 'Mad Max: Estrada da Fúria' },
            { id: 'o-iluminado', title: 'O Iluminado' },
            { id: 'matrix', title: 'Matrix' },
            { id: 'forrest-gump', title: 'Forrest Gump' },
            { id: 'interestelar', title: 'Interestelar' }
        ];

        movies.forEach(movie => {
            const option = document.createElement('option');
            option.value = movie.id;
            option.textContent = movie.title;
            select.appendChild(option);
        });
    }

    /**
     * Retourne le profil utilisateur actuel
     */
    function getCurrentUserProfile() {
        const stored = localStorage.getItem('cinehome_user_profile');
        if (stored) {
            return JSON.parse(stored);
        }

        return {
            name: 'Você',
            handle: 'cinephile',
            avatar: 'imagens/avatar-01.svg'
        };
    }

    /**
     * Formate le temps écoulé
     */
    function getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - new Date(date);
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'agora';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;

        return new Date(date).toLocaleDateString('pt-BR');
    }

    /**
     * Affiche une notification
     */
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Ajouter les animations au style
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
        .social-menu-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: transparent;
            border: none;
            color: white;
            cursor: pointer;
            width: 100%;
            text-align: left;
            border-radius: 4px;
        }
        .social-menu-item:hover {
            background: rgba(255,255,255,0.1);
        }
    `;
    document.head.appendChild(style);

})();
