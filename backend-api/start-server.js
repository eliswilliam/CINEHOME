// Script de démarrage avec gestion d'erreur complète
console.log('🟢 Démarrage du script...');

try {
  console.log('📦 Chargement des modules...');
  require('./src/app.js');
  console.log('✅ Serveur chargé avec succès');
} catch (error) {
  console.error('❌ ERREUR FATALE:', error);
  console.error('Stack:', error.stack);
  process.exit(1);
}

// Garder le processus actif
setInterval(() => {
  // Vérifier toutes les 30 secondes
}, 30000);
