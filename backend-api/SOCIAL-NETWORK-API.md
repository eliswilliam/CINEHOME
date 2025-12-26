# API Réseau Social CineHome

Backend complet pour le réseau social de CineHome, permettant aux utilisateurs de partager leurs opinions sur les films.

## 🚀 Fonctionnalités Implémentées

### Posts
- ✅ Créer un post avec note de film
- ✅ Lister tous les posts (avec pagination)
- ✅ Récupérer un post par ID
- ✅ Récupérer les posts d'un utilisateur
- ✅ Supprimer un post
- ✅ Liker/Unliker un post
- ✅ Sauvegarder/Unsave un post
- ✅ Récupérer les posts sauvegardés

### Commentaires
- ✅ Ajouter un commentaire à un post
- ✅ Liker un commentaire
- ✅ Supprimer un commentaire

## 📡 Endpoints API

### Posts

#### Créer un post
```http
POST /api/posts
Content-Type: application/json

{
  "author": "Nome do Usuário",
  "handle": "username",
  "avatar": "imagens/avatar-01.svg",
  "text": "Texto do post",
  "movieId": "oppenheimer",
  "movieTitle": "Oppenheimer",
  "moviePoster": "https://image.tmdb.org/t/p/w500/...",
  "rating": 5
}
```

#### Listar posts
```http
GET /api/posts?page=1&limit=20
```

Resposta:
```json
{
  "posts": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalPosts": 100,
    "hasMore": true
  }
}
```

#### Obter post por ID
```http
GET /api/posts/:id
```

#### Obter posts de um usuário
```http
GET /api/posts/user/:handle?page=1&limit=20
```

#### Curtir/Descurtir post
```http
POST /api/posts/:id/like
Content-Type: application/json

{
  "handle": "username"
}
```

Resposta:
```json
{
  "message": "Post curtido",
  "liked": true,
  "likes": 25
}
```

#### Salvar/Dessalvar post
```http
POST /api/posts/:id/save
Content-Type: application/json

{
  "handle": "username"
}
```

#### Obter posts salvos
```http
GET /api/posts/user/:handle/saved?page=1&limit=20
```

#### Deletar post
```http
DELETE /api/posts/:id
Content-Type: application/json

{
  "handle": "username"
}
```

### Comentários

#### Adicionar comentário
```http
POST /api/posts/:id/comments
Content-Type: application/json

{
  "author": "Nome do Usuário",
  "handle": "username",
  "avatar": "imagens/avatar-01.svg",
  "text": "Texto do comentário"
}
```

#### Curtir comentário
```http
POST /api/posts/:id/comments/:commentId/like
Content-Type: application/json

{
  "handle": "username"
}
```

#### Deletar comentário
```http
DELETE /api/posts/:id/comments/:commentId
Content-Type: application/json

{
  "handle": "username"
}
```

## 🗄️ Modelo de Dados

### Post Schema
```javascript
{
  author: String,          // Nome do autor
  handle: String,          // Username do autor
  avatar: String,          // URL do avatar
  text: String,            // Conteúdo do post (max 1000 caracteres)
  movieId: String,         // ID do filme (opcional)
  movieTitle: String,      // Título do filme (opcional)
  moviePoster: String,     // URL do poster (opcional)
  rating: Number,          // Avaliação 0-5 estrelas
  likes: Number,           // Contador de likes
  likedBy: [String],       // Array de handles que curtiram
  savedBy: [String],       // Array de handles que salvaram
  comments: [Comment],     // Array de comentários
  timestamp: Date,         // Data de criação
  createdAt: Date,         // Timestamp de criação
  updatedAt: Date          // Timestamp de atualização
}
```

### Comment Schema
```javascript
{
  _id: ObjectId,          // ID único do comentário
  author: String,          // Nome do autor
  handle: String,          // Username do autor
  avatar: String,          // URL do avatar
  text: String,            // Conteúdo (max 500 caracteres)
  likes: Number,           // Contador de likes
  likedBy: [String],       // Array de handles que curtiram
  timestamp: Date          // Data de criação
}
```

## 🔧 Configuração

### Variáveis de Ambiente

No arquivo `.env` ou nas variáveis d'environnement Vercel :

```env
MONGO_URI=mongodb+srv://eliswilliam01_db_user:3tIISQncqmDUqGBR@cluster0.trlxihj.mongodb.net/cinehome?retryWrites=true&w=majority&appName=Cluster0
```

### Estrutura de Fichiers

```
backend-api/
├── models/
│   └── postModel.js          # Modèle MongoDB pour posts
├── controllers/
│   └── postController.js     # Logique métier des posts
├── routes/
│   └── postRoutes.js         # Routes de l'API
├── public/
│   ├── social-feed.html      # Page du réseau social
│   ├── social-feed-api.js    # Frontend avec intégration API
│   └── social-feed.css       # Styles
└── app.js                    # Configuration Express (routes intégrées)
```

## 🚀 Déploiement sur Vercel

### 1. Configuration des Variables d'Environnement

Dans le dashboard Vercel, ajoutez :
- `MONGO_URI` : votre URI MongoDB

### 2. Structure du Projet

Assurez-vous que `app.js` inclut :
```javascript
const postRoutes = require('./routes/postRoutes');
app.use('/api/posts', postRoutes);
```

### 3. Fichiers à Déployer

Tous les fichiers backend doivent être dans le dossier `backend-api/` :
- Models
- Controllers  
- Routes
- Public (frontend)

### 4. Test en Local

```bash
cd backend-api
npm install
node app.js
```

Le serveur démarre sur `http://localhost:10000`

### 5. Test des Endpoints

```bash
# Créer un post
curl -X POST http://localhost:10000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "author": "Test User",
    "handle": "testuser",
    "text": "Teste de post!",
    "rating": 5
  }'

# Listar posts
curl http://localhost:10000/api/posts

# Curtir post
curl -X POST http://localhost:10000/api/posts/POST_ID/like \
  -H "Content-Type: application/json" \
  -d '{"handle": "testuser"}'
```

## 📱 Frontend

Le fichier `social-feed-api.js` gère automatiquement :
- ✅ Détection de l'environnement (localhost vs production)
- ✅ Création de posts
- ✅ Chargement avec pagination infinie
- ✅ Likes/Unlikes en temps réel
- ✅ Commentaires
- ✅ Sauvegarde de posts
- ✅ Suppression (avec vérification d'auteur)

### Configuration Automatique de l'API

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:10000/api' 
    : '/api';
```

## ⚡ Optimisations

- **Indexes MongoDB** : timestamp et handle indexés pour performances
- **Pagination** : 20 posts par page
- **Scroll Infini** : chargement automatique au scroll
- **Cache Local** : mise à jour locale avant rechargement API

## 🔐 Sécurité

- Validation des champs requis
- Vérification d'auteur pour suppression
- Limite de caractères (1000 pour posts, 500 pour commentaires)
- CORS configuré pour accepter toutes les origines

## 🎯 Utilisation

Une fois déployé sur Vercel, le réseau social sera accessible à :
```
https://cinehome1.vercel.app/social-feed.html
```

Toutes les données seront stockées dans MongoDB Atlas et synchronisées en temps réel entre tous les utilisateurs.

## 📝 Notes

- Les posts sont triés par date (plus récents en premier)
- Les utilisateurs peuvent voir leurs posts dans leur profil via `/api/posts/user/:handle`
- Les posts sauvegardés sont accessibles via `/api/posts/user/:handle/saved`
- Le système gère automatiquement les likes multiples du même utilisateur
