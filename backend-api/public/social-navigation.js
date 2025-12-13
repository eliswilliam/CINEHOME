/**
 * Social Feed Navigation - Abre a página social-feed.html
 * Script leve para o botão do header
 */

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        const socialBtn = document.getElementById('social-btn');
        if (socialBtn) {
            socialBtn.addEventListener('click', () => {
                window.location.href = 'social-feed.html';
            });
        }
    });

})();
