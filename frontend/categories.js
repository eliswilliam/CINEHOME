
(function() {
    'use strict';

    let mainContainer;
    
    
    let originalSections = [];
    
    
    let categorySection;


    function init() {
        mainContainer = document.querySelector('.container');
        if (!mainContainer) return;

        // Sauvegarder les sections originales
        saveOriginalSections();
        
        // Créer la section de catégorie
        createCategorySection();
        
        // Attacher les événements de navigation
        attachNavigationEvents();
        
        // Charger la catégorie depuis l'URL
        loadCategoryFromHash();
    }

    // Sauvegarder les sections originales
    function saveOriginalSections() {
        const sections = mainContainer.querySelectorAll('.section');
        sections.forEach(section => {
            originalSections.push(section.cloneNode(true));
        });
    }

    // Créer la section de catégorie
    function createCategorySection() {
        categorySection = document.createElement('div');
        categorySection.className = 'category-content';
        categorySection.id = 'category-view';
        
        // Insérer après le hero
        const hero = mainContainer.querySelector('.hero');
        const categoryNav = mainContainer.querySelector('.category-nav');
        if (hero && categoryNav) {
            categoryNav.insertAdjacentElement('afterend', categorySection);
        }
    }

    // Attacher les événements de navigation
    function attachNavigationEvents() {
        const categoryLinks = document.querySelectorAll('.category-link');
        
        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const category = link.dataset.category;
                
                // Mettre à jour l'URL sans recharger la page
                const newUrl = category === 'home' ? window.location.pathname : `${window.location.pathname}#${category}`;
                window.history.pushState({ category }, '', newUrl);
                
                // Afficher la catégorie
                showCategory(category);
                
                // Mettre à jour l'état actif
                updateActiveLink(link);
            });
        });
    }

    // Mettre à jour le lien actif
    function updateActiveLink(activeLink) {
        document.querySelectorAll('.category-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    // Afficher une catégorie
    function showCategory(category) {
        if (category === 'home') {
            showHomePage();
            return;
        }

        // Masquer les sections originales
        hideOriginalSections();
        
        // Vérifier si les données de catégories sont chargées
        if (!window.CATEGORIES_DATA || !window.CATEGORIES_DATA[category]) {
            categorySection.innerHTML = '<div class="category-loading">Carregando...</div>';
            return;
        }

        const categoryData = window.CATEGORIES_DATA[category];
        
        // Construire le HTML de la catégorie
        const html = `
            <div class="category-header">
                <h1 class="category-title">${categoryData.title}</h1>
            </div>
            <div class="category-grid">
                ${categoryData.items.map(item => createCardHTML(item)).join('')}
            </div>
        `;
        
        categorySection.innerHTML = html;
        categorySection.classList.add('active');
        
        // Scroll vers le haut avec animation fluide
        const categoryNav = document.querySelector('.category-nav');
        if (categoryNav) {
            categoryNav.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Générer les étoiles en fonction de la note
    function generateStars(rating) {
        if (!rating || rating === '—') return '';
        
        const numRating = parseFloat(rating);
        const maxStars = 5;
        const maxRating = 10;
        
        // Calculer le nombre d'étoiles pleines (sur 5)
        const filledStars = Math.round((numRating / maxRating) * maxStars);
        const emptyStars = maxStars - filledStars;
        
        return '★'.repeat(filledStars) + '☆'.repeat(emptyStars);
    }

    // Créer le HTML d'une carte
    function createCardHTML(item) {
        return `
            <div class="category-card" onclick="window.location.href='movie-details.html?title=${encodeURIComponent(item.title)}'" style="cursor: pointer;">
                <img class="category-card-image" 
                     src="${item.image}" 
                     alt="${item.title}"
                     loading="lazy">
                <div class="category-card-overlay">
                    <h3 class="category-card-title">${item.title}</h3>
                    <div class="category-card-info">
                        <span class="category-card-year">${item.year}</span>
                        ${item.rating !== '—' ? `
                            <span class="category-card-rating">
                                <span class="stars">${generateStars(item.rating)}</span>
                                <span>${item.rating}</span>
                            </span>
                        ` : ''}
                    </div>
                    ${item.description ? `<p class="category-card-description">${item.description}</p>` : ''}
                </div>
            </div>
        `;
    }

    // Afficher la page d'accueil
    function showHomePage() {
        // Masquer la section de catégorie
        categorySection.classList.remove('active');
        
        // Afficher les sections originales
        showOriginalSections();
    }

    // Masquer les sections originales
    function hideOriginalSections() {
        const sections = mainContainer.querySelectorAll('.section');
        sections.forEach(section => {
            section.style.display = 'none';
        });
    }

    // Afficher les sections originales
    function showOriginalSections() {
        const sections = mainContainer.querySelectorAll('.section');
        sections.forEach(section => {
            section.style.display = '';
        });
    }

    // Charger la catégorie depuis le hash de l'URL
    function loadCategoryFromHash() {
        const hash = window.location.hash.substring(1);
        if (hash && hash !== 'home') {
            const link = document.querySelector(`[data-category="${hash}"]`);
            if (link) {
                showCategory(hash);
                updateActiveLink(link);
            }
        } else {
            // Par défaut, afficher home
            const homeLink = document.querySelector('[data-category="home"]');
            if (homeLink) {
                updateActiveLink(homeLink);
            }
        }
    }

    // Gérer le changement de hash et le bouton retour
    window.addEventListener('hashchange', (e) => {
        e.preventDefault();
        loadCategoryFromHash();
    });
    
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.category) {
            const link = document.querySelector(`[data-category="${e.state.category}"]`);
            if (link) {
                showCategory(e.state.category);
                updateActiveLink(link);
            }
        } else {
            loadCategoryFromHash();
        }
    });

    // Initialiser quand le DOM est prêt
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
