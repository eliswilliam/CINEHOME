/**
 * Social Feed Backend API Module
 * Handles all communication with the backend API for social posts
 */

(function() {
    'use strict';

    // Configuration de l'API
    const API_BASE_URL = window.location.origin + '/api';
    const API_POSTS_URL = `${API_BASE_URL}/posts`;

    // Classe principale pour gérer les appels API
    class SocialFeedAPI {
        /**
         * Effectue une requête à l'API
         */
        static async request(url, options = {}) {
            try {
                const response = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers
                    },
                    ...options
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Erro na requisição');
                }

                return await response.json();
            } catch (error) {
                console.error('API Error:', error);
                throw error;
            }
        }

        /**
         * Créer un nouveau post
         */
        static async createPost(postData) {
            return await this.request(API_POSTS_URL, {
                method: 'POST',
                body: JSON.stringify(postData)
            });
        }

        /**
         * Récupérer tous les posts (avec pagination)
         */
        static async getAllPosts(page = 1, limit = 20) {
            const url = `${API_POSTS_URL}?page=${page}&limit=${limit}`;
            return await this.request(url, {
                method: 'GET'
            });
        }

        /**
         * Récupérer un post par ID
         */
        static async getPostById(postId) {
            const url = `${API_POSTS_URL}/${postId}`;
            return await this.request(url, {
                method: 'GET'
            });
        }

        /**
         * Récupérer les posts d'un utilisateur
         */
        static async getPostsByUser(handle, page = 1, limit = 20) {
            const url = `${API_POSTS_URL}/user/${handle}?page=${page}&limit=${limit}`;
            return await this.request(url, {
                method: 'GET'
            });
        }

        /**
         * Récupérer les posts sauvegardés d'un utilisateur
         */
        static async getSavedPosts(handle, page = 1, limit = 20) {
            const url = `${API_POSTS_URL}/user/${handle}/saved?page=${page}&limit=${limit}`;
            return await this.request(url, {
                method: 'GET'
            });
        }

        /**
         * Liker/Unliker un post
         */
        static async toggleLike(postId, userHandle) {
            const url = `${API_POSTS_URL}/${postId}/like`;
            return await this.request(url, {
                method: 'POST',
                body: JSON.stringify({ handle: userHandle })
            });
        }

        /**
         * Sauvegarder/Unsauvegarder un post
         */
        static async toggleSave(postId, userHandle) {
            const url = `${API_POSTS_URL}/${postId}/save`;
            return await this.request(url, {
                method: 'POST',
                body: JSON.stringify({ handle: userHandle })
            });
        }

        /**
         * Ajouter un commentaire à un post
         */
        static async addComment(postId, commentData) {
            const url = `${API_POSTS_URL}/${postId}/comments`;
            return await this.request(url, {
                method: 'POST',
                body: JSON.stringify(commentData)
            });
        }

        /**
         * Liker/Unliker un commentaire
         */
        static async toggleCommentLike(postId, commentId, userHandle) {
            const url = `${API_POSTS_URL}/${postId}/comments/${commentId}/like`;
            return await this.request(url, {
                method: 'POST',
                body: JSON.stringify({ handle: userHandle })
            });
        }

        /**
         * Supprimer un post
         */
        static async deletePost(postId, userHandle) {
            const url = `${API_POSTS_URL}/${postId}`;
            return await this.request(url, {
                method: 'DELETE',
                body: JSON.stringify({ handle: userHandle })
            });
        }

        /**
         * Supprimer un commentaire
         */
        static async deleteComment(postId, commentId, userHandle) {
            const url = `${API_POSTS_URL}/${postId}/comments/${commentId}`;
            return await this.request(url, {
                method: 'DELETE',
                body: JSON.stringify({ handle: userHandle })
            });
        }
    }

    // Exporter l'API globalement
    window.SocialFeedAPI = SocialFeedAPI;

})();
