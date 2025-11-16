// Charger les variables d'environnement en premier
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const emailRoutes = require('./email');
const emailService = require('./services/emailService');
const groqaiRoutes = require('../groqai');
const tmdbRoutes = require('../tmdbRoutes');

const app = express();

app.use(cors({
  origin: true,       // reflète l'origine de la requête et autorise toutes les origines
  credentials: true,  // permet l'envoi de cookies/credentials si nécessaire
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin']
}));
app.use(express.json());
const path = require('path');

// Connexion à MongoDB Atlas avec gestion d'erreur
// On tente de connecter la DB mais on laisse le serveur démarrer pour permettre des tests front-back
connectDB()
  .then(() => console.log('✅ MongoDB connecté avec succès'))
  .catch((err) => {
    console.error('❌ Erreur de connexion MongoDB:', err.message);
    console.warn('Le serveur continue de tourner pour permettre les tests front-back. Corrigez MONGO_URI pour activer la DB.');
    // Ne pas process.exit ici pour permettre l'utilisation d'endpoints non-DB (ex: /health)
  });

// Middleware de logging pour debug
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// Endpoint de santé simple utilisé par le frontend
app.get('/health', (req, res) => {
  return res.json({ status: 'ok', time: new Date().toISOString() });
});

// Routes API - priorité 1
app.use('/api/users', userRoutes);

// Routes Reviews (Avaliações)
app.use('/api/reviews', reviewRoutes);

// Routes Groq AI Chatbot
app.use('/api', groqaiRoutes);

// Routes TMDB Search
app.use('/api/tmdb', tmdbRoutes);

// Routes OAuth - priorité 2
// Les routes dans email.js incluent déjà /auth/ dans leur chemin
app.use('/', emailRoutes);

// Servir les fichiers frontend EN DERNIER pour ne pas interférer avec les routes API
// __dirname = CINEHOMEBACK/src
// Utiliser le dossier 'public' pour la production (Render)
const frontendPath = path.join(__dirname, '..', 'public');
console.log('📁 Frontend path:', frontendPath);

// Vérifier si le dossier existe
const fs = require('fs');
if (!fs.existsSync(frontendPath)) {
  console.error('❌ ERREUR: Le dossier frontend n\'existe pas:', frontendPath);
  console.warn('⚠️ Tentative de servir depuis CINEHOME---Homepage (dev only)');
  // Fallback pour développement local
  const devPath = path.join(__dirname, '..', '..', 'CINEHOME---Homepage');
  if (fs.existsSync(devPath)) {
    console.log('✅ Dossier dev trouvé:', devPath);
    app.use(express.static(devPath));
  }
} else {
  console.log('✅ Dossier frontend trouvé');
  
  // Lister les fichiers HTML dans le dossier
  const htmlFiles = fs.readdirSync(frontendPath).filter(f => f.endsWith('.html'));
  console.log('📄 Fichiers HTML disponibles:', htmlFiles.join(', '));
  
  // Servir les fichiers statiques depuis public/
  app.use(express.static(frontendPath));
}

// Port depuis .env ou valeur par défaut
const PORT = process.env.PORT || 3001;

// Démarrage du serveur
const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📂 Serveur HTTP en écoute...`);
  
  // Tester configuration email de manière asynchrone sans bloquer
  console.log('\n📧 Vérification de la configuration email...');
  emailService.testEmailConfiguration()
    .then(emailConfigured => {
      if (!emailConfigured) {
        console.warn('⚠️  Configuration email manquante. Le système fonctionnera en mode développement.');
        console.warn('💡 Pour activer l\'envoi d\'emails, configurez EMAIL_USER et EMAIL_PASSWORD dans .env');
      }
      console.log('✅ Serveur prêt à recevoir des requêtes\n');
    })
    .catch(error => {
      console.error('❌ Erreur lors de la vérification email:', error.message);
      console.warn('⚠️  Le système fonctionnera en mode développement.\n');
    });
});

server.on('error', (error) => {
  console.error('❌ Erreur du serveur:', error);
  process.exit(1);
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur non capturée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
  process.exit(1);
});
