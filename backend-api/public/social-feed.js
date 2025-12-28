/**
 * Social Feed Module - Threads-like social network for movies
 * Permet aux utilisateurs de partager leurs opinions sur les films
 */

(function() {
    'use strict';

    // État du feed social
    let socialPosts = [];
    let currentUserProfile = null;
    let currentRating = 0;
    let currentPage = 1;
    let hasMorePosts = false;
    let isLoadingPosts = false;

    // Initialiser au chargement du DOM
    document.addEventListener('DOMContentLoaded', initSocialFeed);

    /**
     * Initialise le module de feed social
     */
    function initSocialFeed() {
        currentUserProfile = getCurrentUserProfile();
        loadAPIScript(() => {
            setupEventListeners();
            loadPostsFromBackend();
            populateMovieDropdown();
            setupHeaderButton();
            setupInfiniteScroll();
        });
    }

    /**
     * Charge dynamiquement le script API
     */
    function loadAPIScript(callback) {
        // Vérifier si l'API est déjà chargée
        if (window.SocialFeedAPI) {
            callback();
            return;
        }

        const script = document.createElement('script');
        script.src = 'social-feed-backend-api.js';
        script.onload = callback;
        script.onerror = () => {
            console.error('Falha ao carregar o script da API');
            showNotification('Erro ao carregar API. Usando modo offline.', 'error');
            // Fallback vers les posts locaux
            loadSamplePosts();
        };
        document.head.appendChild(script);
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
            document.body.style.overflow = ''; // Réactiver le scroll
            // Réinitialiser le formulaire
            resetComposer();
        }
    }

    /**
     * Réinitialise le formulaire du compositeur
     */
    function resetComposer() {
        document.getElementById('composer-textarea').value = '';
        document.getElementById('composer-movie-select').value = '';
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
     * Soumet un nouveau post
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

        // Créer les données du post
        const postData = {
            author: currentUserProfile.name,
            handle: currentUserProfile.handle,
            avatar: currentUserProfile.avatar,
            text: text,
            movieId: movieId || null,
            movieTitle: movieTitle,
            moviePoster: moviePoster,
            rating: currentRating
        };

        try {
            // Envoyer au backend
            const response = await window.SocialFeedAPI.createPost(postData);
            
            // Fermer le modal
            closeComposer();
            document.body.style.overflow = '';
            
            // Recharger les posts depuis le début
            currentPage = 1;
            await loadPostsFromBackend(1);
            
            // Notification
            showNotification('Post publicado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao criar post:', error);
            showNotification('Erro ao publicar post. Tente novamente.', 'error');
        }
    }

    /**
     * Charge les posts depuis le backend
     */
    async function loadPostsFromBackend(page = 1) {
        if (isLoadingPosts) return;
        
        isLoadingPosts = true;
        showLoadingIndicator();

        try {
            const response = await window.SocialFeedAPI.getAllPosts(page, 20);
            
            if (page === 1) {
                // Nouvelle chargement: remplacer les posts
                socialPosts = response.posts || [];
            } else {
                // Pagination: ajouter à la suite
                socialPosts = [...socialPosts, ...(response.posts || [])];
            }

            currentPage = response.pagination?.currentPage || 1;
            hasMorePosts = response.pagination?.hasMore || false;

            // Enrichir les posts avec les infos de like/save pour l'utilisateur actuel
            enrichPostsWithUserData();
            
            renderFeed();
        } catch (error) {
            console.error('Erro ao carregar posts do backend:', error);
            showNotification('Erro ao carregar posts. Usando modo offline.', 'error');
            // Fallback vers des posts d'exemple
            if (socialPosts.length === 0) {
                socialPosts = getDefaultPosts();
                renderFeed();
            }
        } finally {
            isLoadingPosts = false;
            hideLoadingIndicator();
        }
    }

    /**
     * Enrichit les posts avec les données utilisateur (liked, saved)
     */
    function enrichPostsWithUserData() {
        socialPosts = socialPosts.map(post => ({
            ...post,
            id: post._id || post.id,
            liked: post.likedBy?.includes(currentUserProfile.handle) || false,
            saved: post.savedBy?.includes(currentUserProfile.handle) || false
        }));
    }

    /**
     * Affiche un indicateur de chargement
     */
    function showLoadingIndicator() {
        const feedContainer = document.getElementById('social-posts-feed');
        if (!feedContainer) return;

        const indicator = document.createElement('div');
        indicator.id = 'loading-indicator';
        indicator.style.cssText = `
            text-align: center;
            padding: 20px;
            color: #999;
        `;
        indicator.innerHTML = `
            <svg width="40" height="40" viewBox="0 0 50 50" style="animation: spin 1s linear infinite;">
                <circle cx="25" cy="25" r="20" fill="none" stroke="#5f5dff" stroke-width="5" stroke-dasharray="31.4 31.4" stroke-linecap="round" />
            </svg>
            <style>
                @keyframes spin { to { transform: rotate(360deg); } }
            </style>
        `;
        feedContainer.appendChild(indicator);
    }

    /**
     * Cache l'indicateur de chargement
     */
    function hideLoadingIndicator() {
        const indicator = document.getElementById('loading-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * Configure le scroll infini
     */
    function setupInfiniteScroll() {
        window.addEventListener('scroll', () => {
            if (isLoadingPosts || !hasMorePosts) return;

            const scrollPosition = window.innerHeight + window.scrollY;
            const threshold = document.documentElement.scrollHeight - 500;

            if (scrollPosition >= threshold) {
                loadPostsFromBackend(currentPage + 1);
            }
        });
    }

    /**
     * Charge les posts d'exemple (fallback)
     */
    function loadSamplePosts() {
        socialPosts = getDefaultPosts();
        renderFeed();
    }

    /**
     * Retourne les posts par défaut
     */
    function getDefaultPosts() {
        return [
            {
                id: 1,
                author: 'Ana Silva',
                handle: 'anaaaaa',
                avatar: 'imagens/avatar-02.svg',
                text: 'Oppenheimer é uma obra-prima! A cinematografia é absolutamente deslumbrante. Recomendo muito! 🎬',
                movieId: 'oppenheimer',
                movieTitle: 'Oppenheimer',
                moviePoster: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
                rating: 5,
                timestamp: new Date(Date.now() - 7200000),
                likes: 24,
                comments: [
                    {
                        id: 101,
                        author: 'Carlos Mendes',
                        handle: 'carlosm',
                        avatar: 'imagens/avatar-03.svg',
                        text: 'Concordo totalmente! Cillian Murphy mereceu o Oscar! 🏆',
                        timestamp: new Date(Date.now() - 3600000),
                        likes: 8
                    },
                    {
                        id: 102,
                        author: 'Julia Santos',
                        handle: 'juliasantos',
                        avatar: 'imagens/avatar-04.svg',
                        text: 'A trilha sonora é incrível também!',
                        timestamp: new Date(Date.now() - 1800000),
                        likes: 5
                    }
                ],
                liked: false,
                saved: false
            },
            {
                id: 2,
                author: 'Marcus Costa',
                handle: 'marcustech',
                avatar: 'imagens/avatar-03.svg',
                text: 'Duna Parte 2 superou minhas expectativas! A trilha sonora é épica! Hans Zimmer se superou novamente. 🏜️',
                movieId: 'duna-parte-dois',
                movieTitle: 'Duna: Parte Dois',
                moviePoster: 'https://image.tmdb.org/t/p/w500/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg',
                rating: 5,
                timestamp: new Date(Date.now() - 14400000),
                likes: 42,
                comments: [
                    {
                        id: 201,
                        author: 'Ana Silva',
                        handle: 'anaaaaa',
                        avatar: 'imagens/avatar-02.svg',
                        text: 'Timothée Chalamet está perfeito como Paul! Não vejo a hora da parte 3!',
                        timestamp: new Date(Date.now() - 10800000),
                        likes: 12
                    }
                ],
                liked: false,
                saved: false
            },
            {
                id: 3,
                author: 'Carolina Mendes',
                handle: 'carlofilms',
                avatar: 'imagens/avatar-01.svg',
                text: 'Parasita continua sendo um dos melhores filmes que já assisti. A direção de Bong Joon-ho é impecável. Cada cena é pensada nos mínimos detalhes. 🎭',
                movieId: 'parasita',
                movieTitle: 'Parasita',
                moviePoster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
                rating: 5,
                timestamp: new Date(Date.now() - 21600000),
                likes: 58,
                comments: [],
                liked: false,
                saved: false
            }
        ];
    }



    /**
     * Affiche le feed
     */
    function renderFeed() {
        const feedContainer = document.getElementById('social-posts-feed');
        if (!feedContainer) return;

        if (socialPosts.length === 0) {
            feedContainer.innerHTML = `
                <div class="social-empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <p>Nenhum post ainda. Seja o primeiro a compartilhar sua opinião!</p>
                </div>
            `;
            return;
        }

        feedContainer.innerHTML = socialPosts.map(post => createPostElement(post)).join('');

        // Ajouter les écouteurs aux actions du post
        feedContainer.querySelectorAll('.social-post-action').forEach(action => {
            action.addEventListener('click', handlePostAction);
        });

        // Écouteurs pour les commentaires
        feedContainer.querySelectorAll('.social-comment-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
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

        // Voir plus de commentaires
        feedContainer.querySelectorAll('.social-view-more-comments').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const postId = btn.dataset.postId;
                showAllComments(postId);
            });
        });

        // Menu du post
        feedContainer.querySelectorAll('.social-post-menu').forEach(menu => {
            menu.addEventListener('click', (e) => {
                const postId = menu.dataset.postId;
                showPostMenu(postId, e);
            });
        });

        // Cliquer sur les badges de films
        feedContainer.querySelectorAll('.social-post-movie-badge').forEach(badge => {
            badge.addEventListener('click', (e) => {
                const movieId = e.currentTarget.dataset.movieId;
                console.log('Film cliqué:', movieId);
            });
        });
    }

    /**
     * Crée un élément HTML pour un post
     */
    function createPostElement(post) {
        // Gérer les IDs MongoDB (_id) et IDs locaux (id)
        const postId = post._id || post.id;
        const ratingStars = '★'.repeat(post.rating) + '☆'.repeat(5 - post.rating);
        const timeAgo = getTimeAgo(post.timestamp);
        const commentsCount = post.comments ? post.comments.length : 0;
        const likedClass = post.liked ? 'liked' : '';
        const savedClass = post.saved ? 'saved' : '';

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
            const displayComments = post.comments.slice(0, 2); // Afficher les 2 premiers
            const remainingCount = post.comments.length - 2;
            
            commentsHTML = `
                <div class="social-post-comments">
                    ${displayComments.map(comment => {
                        const commentId = comment._id || comment.id;
                        return `
                        <div class="social-comment" data-comment-id="${commentId}">
                            <img src="${comment.avatar}" alt="${comment.author}" class="social-comment-avatar">
                            <div class="social-comment-content">
                                <div class="social-comment-header">
                                    <span class="social-comment-author">${comment.author}</span>
                                    <span class="social-comment-handle">@${comment.handle}</span>
                                    <span class="social-comment-time">· ${getTimeAgo(comment.timestamp)}</span>
                                </div>
                                <p class="social-comment-text">${comment.text}</p>
                                <div class="social-comment-actions">
                                    <button class="social-comment-action" data-action="like-comment" data-comment-id="${commentId}" data-post-id="${postId}">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                        </svg>
                                        <span>${comment.likes || 0}</span>
                                    </button>
                                    <button class="social-comment-action" data-action="reply-comment" data-comment-id="${commentId}" data-post-id="${postId}">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                        </svg>
                                        <span>Responder</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `}).join('')}
                    ${remainingCount > 0 ? `
                        <button class="social-view-more-comments" data-post-id="${postId}">
                            Ver mais ${remainingCount} comentário${remainingCount > 1 ? 's' : ''}
                        </button>
                    ` : ''}
                </div>
            `;
        }

        // Input de nouveau commentaire
        const commentInputHTML = `
            <div class="social-comment-input-wrapper">
                <img src="${currentUserProfile.avatar}" alt="Seu avatar" class="social-comment-input-avatar">
                <input type="text" class="social-comment-input" placeholder="Escreva um comentário..." data-post-id="${postId}">
                <button class="social-comment-submit" data-post-id="${postId}" title="Enviar comentário">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        `;

        return `
            <div class="social-post" data-post-id="${postId}">
                <div class="social-post-header">
                    <img src="${post.avatar}" alt="${post.author}" class="social-post-avatar">
                    <div class="social-post-user-info">
                        <p class="social-post-name">${post.author}</p>
                        <div class="social-post-meta">
                            <span class="social-post-handle">@${post.handle}</span>
                            <span class="social-post-time">· ${timeAgo}</span>
                        </div>
                    </div>
                    <button class="social-post-menu" data-post-id="${postId}" title="Mais opções">⋯</button>
                </div>

                <div class="social-post-content">
                    <p class="social-post-text">${post.text}</p>
                    ${movieBadgeHTML}
                </div>

                <div class="social-post-actions">
                    <button class="social-post-action ${likedClass}" data-action="like" data-post-id="${postId}">
                        <svg class="heart-icon" viewBox="0 0 24 24" fill="${post.liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <span>${post.likes}</span>
                    </button>
                    <button class="social-post-action" data-action="comment" data-post-id="${postId}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>${commentsCount}</span>
                    </button>
                    <button class="social-post-action" data-action="share" data-post-id="${postId}">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                            <polyline points="16 6 12 2 8 6"></polyline>
                            <line x1="12" y1="2" x2="12" y2="15"></line>
                        </svg>
                    </button>
                    <button class="social-post-action ${savedClass}" data-action="save" data-post-id="${postId}">
                        <svg viewBox="0 0 24 24" fill="${post.saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
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
    function handlePostAction(e) {
        const action = e.currentTarget.dataset.action;
        const postId = e.currentTarget.dataset.postId; // Ne pas convertir en int, garder comme string

        if (action === 'like') {
            toggleLike(postId, e.currentTarget);
        } else if (action === 'comment') {
            focusCommentInput(postId);
        } else if (action === 'share') {
            sharePost(postId);
        } else if (action === 'save') {
            toggleSave(postId, e.currentTarget);
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
     * Soumet un commentaire
     */
    async function submitComment(postId, text) {
        if (!text.trim()) return;

        const commentData = {
            author: currentUserProfile.name,
            handle: currentUserProfile.handle,
            avatar: currentUserProfile.avatar,
            text: text.trim()
        };

        try {
            const result = await window.SocialFeedAPI.addComment(postId, commentData);
            
            // Vider l'input
            const input = document.querySelector(`.social-comment-input[data-post-id="${postId}"]`);
            if (input) input.value = '';
            
            // Mettre à jour le post localement avec le nouveau commentaire
            const post = socialPosts.find(p => (p._id || p.id) === postId);
            if (post && result.comment) {
                if (!post.comments) post.comments = [];
                post.comments.push(result.comment);
                renderFeed();
            }
            
            showNotification('Comentário publicado!', 'success');
        } catch (error) {
            console.error('Erro ao publicar comentário:', error);
            showNotification('Erro ao publicar comentário.', 'error');
        }
    }

    /**
     * Gère les actions sur les commentaires
     */
    function handleCommentAction(e) {
        const action = e.currentTarget.dataset.action;
        const commentId = e.currentTarget.dataset.commentId; // Garder comme string
        const postId = e.currentTarget.dataset.postId; // Garder comme string

        if (action === 'like-comment') {
            toggleCommentLike(postId, commentId);
        } else if (action === 'reply-comment') {
            replyToComment(postId, commentId);
        }
    }

    /**
     * Toggle like sur un commentaire
     */
    async function toggleCommentLike(postId, commentId) {
        try {
            const response = await window.SocialFeedAPI.toggleCommentLike(postId, commentId, currentUserProfile.handle);
            
            // Mettre à jour localement
            const post = socialPosts.find(p => (p._id || p.id) === postId);
            if (post && post.comments) {
                const comment = post.comments.find(c => (c._id || c.id) === commentId);
                if (comment) {
                    comment.liked = response.liked;
                    comment.likes = response.likes;
                    renderFeed();
                }
            }
        } catch (error) {
            console.error('Erro ao curtir comentário:', error);
            showNotification('Erro ao curtir comentário.', 'error');
        }
    }

    /**
     * Répondre à un commentaire
     */
    function replyToComment(postId, commentId) {
        const post = socialPosts.find(p => (p._id || p.id) === postId);
        if (!post || !post.comments) return;

        const comment = post.comments.find(c => (c._id || c.id) === commentId);
        if (comment) {
            const input = document.querySelector(`.social-comment-input[data-post-id="${postId}"]`);
            if (input) {
                input.value = `@${comment.handle} `;
                input.focus();
            }
        }
    }

    /**
     * Afficher tous les commentaires
     */
    function showAllComments(postId) {
        // Pour l'instant, on peut implémenter un modal ou simplement afficher tous
        showNotification('Todos os comentários serão exibidos em breve!', 'info');
    }

    /**
     * Afficher le menu du post
     */
    function showPostMenu(postId, event) {
        // Supprimer les menus existants
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
            <button class="social-menu-item" data-action="report" data-post-id="${postId}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                    <line x1="4" y1="22" x2="4" y2="15"></line>
                </svg>
                Denunciar
            </button>
        `;

        // Positionner le menu
        menu.style.position = 'absolute';
        menu.style.top = `${event.target.offsetTop + 30}px`;
        menu.style.right = '16px';

        event.target.closest('.social-post').appendChild(menu);

        // Fermer au clic ailleurs
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 10);

        // Actions du menu
        menu.querySelectorAll('.social-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = item.dataset.action;
                if (action === 'delete') {
                    deletePost(postId);
                } else if (action === 'report') {
                    showNotification('Post denunciado. Obrigado pelo feedback!', 'info');
                }
                menu.remove();
            });
        });
    }

    /**
     * Supprimer un post
     */
    async function deletePost(postId) {
        try {
            await window.SocialFeedAPI.deletePost(postId, currentUserProfile.handle);
            
            // Recharger les posts
            await loadPostsFromBackend(1);
            
            showNotification('Post excluído!', 'success');
        } catch (error) {
            console.error('Erro ao excluir post:', error);
            showNotification('Erro ao excluir post. Você tem permissão?', 'error');
        }
    }

    /**
     * Change le statut "like" d'un post avec animation
     */
    async function toggleLike(postId, button) {
        try {
            const response = await window.SocialFeedAPI.toggleLike(postId, currentUserProfile.handle);
            
            // Mettre à jour localement pour une réponse rapide
            const post = socialPosts.find(p => (p._id || p.id) === postId);
            if (post) {
                post.liked = response.liked;
                post.likes = response.likes;
                
                // Animation du coeur
                if (button && post.liked) {
                    button.classList.add('like-animation');
                    setTimeout(() => button.classList.remove('like-animation'), 300);
                }
                
                renderFeed();
            }
        } catch (error) {
            console.error('Erro ao curtir post:', error);
            showNotification('Erro ao curtir post.', 'error');
        }
    }

    /**
     * Toggle sauvegarde d'un post
     */
    async function toggleSave(postId, button) {
        try {
            const response = await window.SocialFeedAPI.toggleSave(postId, currentUserProfile.handle);
            
            // Mettre à jour localement
            const post = socialPosts.find(p => (p._id || p.id) === postId);
            if (post) {
                post.saved = response.saved;
                
                if (button && post.saved) {
                    button.classList.add('save-animation');
                    setTimeout(() => button.classList.remove('save-animation'), 300);
                }
                
                renderFeed();
                showNotification(post.saved ? 'Post salvo!' : 'Post removido dos salvos', 'success');
            }
        } catch (error) {
            console.error('Erro ao salvar post:', error);
            showNotification('Erro ao salvar post.', 'error');
        }
    }

    /**
     * Partage un post
     */
    function sharePost(postId) {
        const post = socialPosts.find(p => (p._id || p.id) === postId);
        if (post) {
            const shareText = `Confira esta opinião sobre ${post.movieTitle || 'um filme'}: "${post.text}" - CineHome`;
            
            // Vérifier si la Web Share API est disponible
            if (navigator.share) {
                navigator.share({
                    title: 'Opinião CineHome',
                    text: shareText,
                    url: window.location.href
                }).catch(err => console.log('Partage annulé'));
            } else {
                // Fallback: copier dans le presse-papiers
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

        // Ajouter les films populaires
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
        // Utiliser UsernameManager si disponible
        if (window.UsernameManager && window.UsernameManager.hasUsername()) {
            const username = window.UsernameManager.getUsername();
            const displayName = window.UsernameManager.getFullName();
            
            return {
                name: displayName,
                handle: username,
                avatar: 'imagens/avatar-01.svg'
            };
        }

        // Fallback: essayer de récupérer du stockage
        const stored = localStorage.getItem('cinehome_user_profile');
        if (stored) {
            return JSON.parse(stored);
        }

        // Dernier fallback
        return {
            name: 'Você',
            handle: 'usuario_' + Date.now(),
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

        return date.toLocaleDateString('pt-BR');
    }

    /**
     * Affiche une notification
     */
    function showNotification(message, type = 'info') {
        // Créer une notification simple (vous pouvez améliorer cela)
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
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
    `;
    document.head.appendChild(style);

})();