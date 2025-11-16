# 🔧 Backend API - CINEHOME

API REST pour l'application CINEHOME avec Node.js et Express.

## 📂 Structure

```
backend-api/
├── app.js                  # Point d'entrée principal
├── start-server.js         # Script de démarrage
├── package.json            # Dépendances npm
├── config/                 # Configuration
├── controllers/            # Contrôleurs
├── models/                 # Modèles MongoDB
├── routes/                 # Routes API
│   ├── searchRoutes.js
│   ├── tmdbRoutes.js
│   └── ...
├── services/               # Services métier
│   ├── tmdbService.js
│   └── ...
└── email.js               # Service d'email
```

## 🚀 Installation

```bash
cd backend-api
npm install
```

## ⚙️ Configuration

Créez un fichier `.env` à la racine du dossier backend-api :

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/cinehome
JWT_SECRET=votre_secret_jwt
TMDB_API_KEY=votre_clé_tmdb
GROQ_API_KEY=votre_clé_groq

# Email Configuration
EMAIL_USER=votre_email@gmail.com
EMAIL_PASS=votre_mot_de_passe_app
```

## 🎯 Scripts Disponibles

```bash
# Démarrage en mode production
npm start

# Démarrage en mode développement (avec nodemon)
npm run dev

# Tests
npm test
```

## 📡 Endpoints API

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/reset-password` - Réinitialisation mot de passe

### Films (TMDB)
- `GET /api/tmdb/movies` - Liste des films
- `GET /api/tmdb/movie/:id` - Détails d'un film
- `GET /api/tmdb/search` - Recherche de films

### Recherche
- `GET /api/search` - Recherche globale
- `GET /api/search/advanced` - Recherche avancée

### Utilisateurs
- `GET /api/users/profile` - Profil utilisateur
- `PUT /api/users/profile` - Mise à jour profil
- `GET /api/users/favorites` - Films favoris
- `POST /api/users/favorites/:movieId` - Ajouter aux favoris

## 🛠️ Technologies

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MongoDB** - Base de données
- **Mongoose** - ODM MongoDB
- **JWT** - Authentification
- **bcryptjs** - Hachage des mots de passe
- **Nodemailer** - Envoi d'emails
- **GROQ SDK** - Intelligence artificielle
- **Axios** - Requêtes HTTP
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Variables d'environnement

## 🔒 Sécurité

- JWT pour l'authentification
- Mots de passe hashés avec bcrypt
- CORS configuré
- Variables d'environnement pour les secrets
- Validation des données entrantes

## 📝 Développement

Pour ajouter une nouvelle route :

1. Créez le contrôleur dans `controllers/`
2. Créez la route dans `routes/`
3. Enregistrez la route dans `app.js`

## 🐛 Debug

Logs disponibles dans la console avec différents niveaux :
- Info
- Warning
- Error

## 📄 License

ISC
