# 🚀 Déploiement CINEHOME Backend sur Render

Ce guide vous explique comment déployer l'API backend de CINEHOME sur Render.

## 📋 Prérequis

1. **Compte GitHub** avec le repository cinehome1
2. **Compte Render** (gratuit) : https://render.com
3. **Base de données MongoDB** (MongoDB Atlas recommandé)
4. **Clés API** nécessaires :
   - TMDB API Key
   - GROQ API Key (pour le chatbot IA)
   - Email credentials (Gmail App Password)

## 🎯 Étapes de Déploiement

### 1. Préparer MongoDB Atlas (si pas encore fait)

1. Créez un compte sur https://mongodb.com/cloud/atlas
2. Créez un nouveau cluster (Free Tier)
3. Configurez un utilisateur de base de données
4. Whitelist toutes les IP (0.0.0.0/0) pour Render
5. Copiez votre connection string

### 2. Créer un Web Service sur Render

1. Connectez-vous à https://render.com
2. Cliquez sur **"New +"** → **"Web Service"**
3. Connectez votre repository GitHub **eliswilliam/cinehome1**
4. Configurez le service :

#### Configuration de Base :
```
Name: cinehome-backend
Region: Frankfurt (EU Central) ou Oregon (US West)
Branch: main
Root Directory: backend-api
Runtime: Node
Build Command: npm install
Start Command: npm start
```

#### Plan :
- Sélectionnez **"Free"** pour commencer (ou un plan payant pour de meilleures performances)

### 3. Configurer les Variables d'Environnement

Dans les **Environment Variables** de Render, ajoutez :

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cinehome?retryWrites=true&w=majority
PORT=3000
NODE_ENV=production
JWT_SECRET=votre_secret_jwt_super_securise_ici
TMDB_API_KEY=votre_clé_tmdb
EMAIL_USER=votre_email@gmail.com
EMAIL_PASSWORD=votre_app_password_gmail
GROQ_API_KEY=votre_clé_groq
FRONTEND_URL=https://votre-frontend-url.com
```

**Important** : Remplacez toutes les valeurs par vos vraies credentials !

### 4. Déployer

1. Cliquez sur **"Create Web Service"**
2. Render va automatiquement :
   - Cloner votre repository
   - Installer les dépendances
   - Démarrer le serveur
3. Attendez que le déploiement soit terminé (5-10 minutes)

### 5. Tester l'API

Une fois déployé, testez votre API :

```bash
# Remplacez YOUR_SERVICE_URL par l'URL fournie par Render
curl https://YOUR_SERVICE_URL.onrender.com/health
```

Vous devriez recevoir :
```json
{
  "status": "ok",
  "time": "2025-11-16T..."
}
```

## 📡 Endpoints Disponibles

- `GET /health` - Vérifier l'état du serveur
- `POST /api/users/register` - Inscription
- `POST /api/users/login` - Connexion
- `GET /api/tmdb/*` - Routes TMDB
- `POST /api/reviews` - Ajouter une review
- `POST /api/chat` - Chatbot IA (GROQ)

## 🔧 Configuration du Frontend

Mettez à jour votre frontend pour pointer vers l'URL Render :

```javascript
// Dans votre config.js ou fichier de configuration
const API_BASE_URL = 'https://cinehome-backend.onrender.com';
```

## 🐛 Dépannage

### Le déploiement échoue
- Vérifiez les logs dans Render Dashboard
- Assurez-vous que `package.json` est correct
- Vérifiez que `node_modules` n'est pas commité

### Erreur de connexion MongoDB
- Vérifiez votre MONGODB_URI
- Assurez-vous que 0.0.0.0/0 est whitelisté dans MongoDB Atlas
- Vérifiez le mot de passe (pas de caractères spéciaux non encodés)

### API lente (Free Tier)
- Le plan gratuit de Render met le service en veille après 15 min d'inactivité
- La première requête après inactivité peut prendre 30-60 secondes
- Solution : Upgrade vers un plan payant ($7/mois)

### CORS Errors
- Ajoutez l'URL de votre frontend dans les variables d'environnement
- Vérifiez la configuration CORS dans `app.js`

## 🔄 Auto-Deploy

Render redéploie automatiquement à chaque push sur la branche `main` !

Pour désactiver l'auto-deploy :
1. Settings → Build & Deploy
2. Décochez "Auto-Deploy"

## 📊 Monitoring

- **Logs** : Render Dashboard → Logs
- **Metrics** : Render Dashboard → Metrics
- **Health Check** : Configurez `/health` comme endpoint de santé

## 🔐 Sécurité

✅ **Bonnes pratiques implémentées :**
- Variables d'environnement pour les secrets
- JWT pour l'authentification
- CORS configuré
- Mots de passe hashés (bcrypt)
- HTTPS automatique sur Render

## 💰 Coûts

- **Free Tier** : 750 heures/mois (gratuit)
  - Se met en veille après 15 min d'inactivité
  - 100 GB de bande passante
  
- **Starter ($7/mois)** :
  - Toujours actif (pas de veille)
  - Bande passante illimitée
  - Meilleure performance

## 📝 Checklist Déploiement

- [ ] MongoDB Atlas configuré et accessible
- [ ] Repository GitHub à jour
- [ ] Variables d'environnement configurées
- [ ] Web Service créé sur Render
- [ ] Déploiement réussi
- [ ] Endpoint `/health` fonctionne
- [ ] Frontend mis à jour avec la nouvelle URL
- [ ] Tests de connexion/inscription fonctionnent

## 🆘 Support

En cas de problème :
1. Consultez les logs Render
2. Vérifiez la documentation Render : https://render.com/docs
3. Testez en local d'abord avec `npm run dev`

## 🎉 Félicitations !

Votre backend CINEHOME est maintenant déployé et accessible publiquement ! 🚀
