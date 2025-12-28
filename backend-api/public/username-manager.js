/**
 * Username Manager - Gestion des identifiants utilisateurs
 * Gère la création, validation et vérification des usernames
 */

(function() {
    'use strict';

    const API_BASE_URL = window.location.origin + '/api';
    const STORAGE_KEY = 'cinehome_username';
    const STORAGE_KEY_FULL_NAME = 'cinehome_user_fullname';

    /**
     * Classe principale de gestion des usernames
     */
    class UsernameManager {
        /**
         * Vérifie si l'utilisateur a un username enregistré
         */
        static hasUsername() {
            const username = localStorage.getItem(STORAGE_KEY);
            return username !== null && username.trim() !== '';
        }

        /**
         * Récupère le username actuel
         */
        static getUsername() {
            return localStorage.getItem(STORAGE_KEY);
        }

        /**
         * Récupère le nom complet de l'utilisateur
         */
        static getFullName() {
            return localStorage.getItem(STORAGE_KEY_FULL_NAME) || 'Usuário';
        }

        /**
         * Sauvegarde le username
         */
        static saveUsername(username, fullName = null) {
            localStorage.setItem(STORAGE_KEY, username);
            if (fullName) {
                localStorage.setItem(STORAGE_KEY_FULL_NAME, fullName);
            }
        }

        /**
         * Supprime le username (déconnexion)
         */
        static clearUsername() {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(STORAGE_KEY_FULL_NAME);
        }

        /**
         * Valide le format du username
         */
        static validateFormat(username) {
            // Regex: 3-20 caractères, lettres, chiffres, underscore uniquement
            const regex = /^[a-zA-Z0-9_]{3,20}$/;
            
            if (!username || username.trim() === '') {
                return { valid: false, error: 'O nome de usuário não pode estar vazio' };
            }

            if (username.length < 3) {
                return { valid: false, error: 'O nome deve ter pelo menos 3 caracteres' };
            }

            if (username.length > 20) {
                return { valid: false, error: 'O nome não pode ter mais de 20 caracteres' };
            }

            if (!regex.test(username)) {
                return { valid: false, error: 'Use apenas letras, números e underscore (_)' };
            }

            // Vérifier les mots réservés
            const reserved = ['admin', 'root', 'moderator', 'cinehome', 'system'];
            if (reserved.includes(username.toLowerCase())) {
                return { valid: false, error: 'Este nome está reservado' };
            }

            return { valid: true };
        }

        /**
         * Vérifie la disponibilité du username auprès du backend
         */
        static async checkAvailability(username) {
            try {
                const response = await fetch(`${API_BASE_URL}/users/check-username/${username}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Erro ao verificar disponibilidade');
                }

                const data = await response.json();
                return data.available;
            } catch (error) {
                console.error('Erro ao verificar username:', error);
                // En cas d'erreur réseau, on accepte (mode offline)
                return true;
            }
        }

        /**
         * Enregistre le username dans le backend
         */
        static async registerUsername(username, fullName = null) {
            try {
                const userData = {
                    username: username.toLowerCase(),
                    displayName: fullName || username,
                    avatar: 'imagens/avatar-01.svg'
                };

                const response = await fetch(`${API_BASE_URL}/users/register-username`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Erro ao registrar username');
                }

                const data = await response.json();
                return data;
            } catch (error) {
                console.error('Erro ao registrar username:', error);
                throw error;
            }
        }

        /**
         * Redirige vers la page d'enregistrement si pas de username
         */
        static requireUsername() {
            if (!this.hasUsername()) {
                // Sauvegarder la page de destination
                sessionStorage.setItem('cinehome_redirect_after_username', window.location.pathname);
                window.location.href = 'register-username.html';
                return false;
            }
            return true;
        }

        /**
         * Redirige vers la page de destination après enregistrement
         */
        static redirectAfterRegistration() {
            const redirect = sessionStorage.getItem('cinehome_redirect_after_username');
            sessionStorage.removeItem('cinehome_redirect_after_username');
            
            if (redirect && redirect !== '/register-username.html') {
                window.location.href = redirect;
            } else {
                window.location.href = 'social-feed.html';
            }
        }
    }

    // Exporter globalement
    window.UsernameManager = UsernameManager;

    // Si on est sur la page d'enregistrement
    if (window.location.pathname.includes('register-username.html')) {
        initRegistrationPage();
    }

    /**
     * Initialise la page d'enregistrement
     */
    function initRegistrationPage() {
        // Si l'utilisateur a déjà un username, rediriger
        if (UsernameManager.hasUsername()) {
            UsernameManager.redirectAfterRegistration();
            return;
        }

        const form = document.getElementById('username-form');
        const input = document.getElementById('username');
        const errorMsg = document.getElementById('error-message');
        const successMsg = document.getElementById('success-message');
        const submitBtn = document.getElementById('submit-btn');

        let checkTimeout = null;

        // Validation en temps réel
        input.addEventListener('input', () => {
            const username = input.value.trim();
            
            // Reset
            input.classList.remove('error', 'success');
            errorMsg.classList.remove('show');
            successMsg.classList.remove('show');

            if (username.length === 0) return;

            // Valider le format
            const validation = UsernameManager.validateFormat(username);
            if (!validation.valid) {
                input.classList.add('error');
                errorMsg.textContent = validation.error;
                errorMsg.classList.add('show');
                return;
            }

            // Vérifier la disponibilité (avec debounce)
            clearTimeout(checkTimeout);
            checkTimeout = setTimeout(async () => {
                const available = await UsernameManager.checkAvailability(username);
                
                if (available) {
                    input.classList.add('success');
                    successMsg.classList.add('show');
                } else {
                    input.classList.add('error');
                    errorMsg.textContent = 'Este nome já está em uso';
                    errorMsg.classList.add('show');
                }
            }, 500);
        });

        // Soumission du formulaire
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = input.value.trim().toLowerCase();

            // Valider
            const validation = UsernameManager.validateFormat(username);
            if (!validation.valid) {
                showError(validation.error);
                return;
            }

            // Désactiver le bouton
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Criando...<span class="loading-spinner"></span>';

            try {
                // Vérifier la disponibilité
                const available = await UsernameManager.checkAvailability(username);
                if (!available) {
                    throw new Error('Este nome já está em uso');
                }

                // Enregistrer dans le backend
                await UsernameManager.registerUsername(username);

                // Sauvegarder localement
                UsernameManager.saveUsername(username);

                // Notification de succès
                showNotification('Identificador criado com sucesso! 🎉', 'success');

                // Rediriger après un court délai
                setTimeout(() => {
                    UsernameManager.redirectAfterRegistration();
                }, 1000);

            } catch (error) {
                console.error('Erro ao criar username:', error);
                showError(error.message || 'Erro ao criar identificador. Tente novamente.');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Criar Identificador';
            }
        });

        function showError(message) {
            input.classList.add('error');
            errorMsg.textContent = message;
            errorMsg.classList.add('show');
            successMsg.classList.remove('show');
        }

        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#10b981' : '#ef4444'};
                color: white;
                padding: 16px 24px;
                border-radius: 12px;
                font-weight: 600;
                z-index: 10000;
                box-shadow: 0 8px 24px rgba(0,0,0,0.2);
                animation: slideIn 0.3s ease;
            `;
            notification.textContent = message;

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }
    }

    // Ajouter les animations CSS
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
