/**
 * Social Feed Navigation - Abre a página social-feed.html
 * Script leve para o botão do header
 * Vérifie si l'utilisateur a un username avant de rediriger
 */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const socialBtn = document.getElementById('social-btn');
        if (socialBtn) {
            socialBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Vérifier si l'utilisateur a un username
                if (window.UsernameManager && !window.UsernameManager.hasUsername()) {
                    // Sauvegarder la destination
                    sessionStorage.setItem('cinehome_redirect_after_username', '/social-feed.html');
                    window.location.href = 'register-username.html';
                } else {
                    window.location.href = 'social-feed.html';
                }
            });
        }
    });

})();
