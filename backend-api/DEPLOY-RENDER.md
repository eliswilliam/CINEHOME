# 🚀 Guide de Déploiement sur Render

## 📋 Configuration Render

### 1. Paramètres de Base

| Champ | Valeur |
|-------|--------|
| **Root Directory** | `backend-api` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Branch** | `main` |

### 2. Variables d'Environnement à Configurer

Ajoutez ces variables dans l'onglet "Environment" de Render :

```env
# MongoDB Atlas (OBLIGATOIRE)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cinehome?retryWrites=true&w=majority

# JWT Secret (OBLIGATOIRE)
JWT_SECRET=votre_secret_jwt_tres_securise_minimum_32_caracteres

# Email Configuration (pour reset password)
EMAIL_USER=votre.email@gmail.com
EMAIL_PASSWORD=votre_mot_de_passe_application_gmail

# TMDB API (pour les films)
TMDB_API_KEY=votre_cle_api_tmdb

# GROQ AI (optionnel - pour chatbot)
GROQ_API_KEY=votre_cle_api_groq

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=votre_client_id
GOOGLE_CLIENT_SECRET=votre_client_secret

# Node Environment
NODE_ENV=production

# Port (automatique sur Render, mais peut être défini)
PORT=10000
```

## 🔧 Étapes de Déploiement

### Étape 1: Préparer MongoDB Atlas

1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit (M0)
3. Créez un utilisateur de base de données
4. Whitelist l'IP `0.0.0.0/0` (pour permettre Render)
5. Copiez votre URI de connexion

### Étape 2: Créer le Service sur Render

1. Allez sur [render.com](https://render.com)
2. Cliquez sur **"New +"** → **"Web Service"**
3. Connectez votre repository GitHub : `eliswilliam/cinehome1`
4. Configurez :

```
Name: cinehome-backend
Root Directory: backend-api
Environment: Node
Region: Oregon (ou le plus proche)
Branch: main
Build Command: npm install
Start Command: npm start
```

5. Sélectionnez le plan **Free**

### Étape 3: Configurer les Variables d'Environnement

Dans l'onglet "Environment" de votre service Render :

1. Cliquez sur **"Add Environment Variable"**
2. Ajoutez chaque variable listée ci-dessus
3. **Important** : Ne commitez JAMAIS ces valeurs dans Git !

### Étape 4: Déployer

1. Cliquez sur **"Create Web Service"**
2. Render va automatiquement :
   - Cloner votre repo
   - Installer les dépendances
   - Démarrer votre serveur
3. Attendez que le déploiement soit terminé (5-10 minutes)

## ✅ Vérification du Déploiement

Une fois déployé, votre API sera accessible à :
```
https://cinehome-backend.onrender.com
```

### Tester les Endpoints

```bash
# Health Check
curl https://cinehome-backend.onrender.com/health

# API Info
curl https://cinehome-backend.onrender.com/

# Test Users API
curl https://cinehome-backend.onrender.com/api/users
```

## 🔄 Déploiement Automatique

Render redéploie automatiquement à chaque push sur la branche `main` :

```bash
git add .
git commit -m "Update backend"
git push origin main
```

## 📝 Notes Importantes

### Plan Gratuit Render
- ✅ 750 heures/mois gratuites
- ⚠️ Le service s'endort après 15 min d'inactivité
- ⏱️ Premier démarrage après sommeil : 30-60 secondes
- 💡 Solution : Utilisez un service de ping (UptimeRobot)

### Sécurité
- ✅ Toutes les variables sensibles sont dans l'environnement
- ✅ `.env` est dans `.gitignore`
- ✅ CORS configuré pour accepter votre frontend
- ✅ HTTPS automatique sur Render

### Logs
Pour voir les logs en temps réel :
1. Dashboard Render → Votre service
2. Onglet "Logs"
3. Ou utilisez la CLI Render

## 🐛 Dépannage

### Le service ne démarre pas
- Vérifiez les logs dans Render
- Assurez-vous que toutes les variables d'environnement sont définies
- Vérifiez que `MONGODB_URI` est correct

### Erreur de connexion MongoDB
- Vérifiez que l'IP `0.0.0.0/0` est whitelistée dans MongoDB Atlas
- Vérifiez vos credentials MongoDB
- Testez la connexion avec MongoDB Compass

### L'API ne répond pas
- Le service est peut-être en sommeil (plan gratuit)
- Attendez 30-60 secondes et réessayez
- Vérifiez le statut dans le dashboard Render

## 📚 Ressources

- [Documentation Render](https://render.com/docs)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)
- [Node.js sur Render](https://render.com/docs/deploy-node-express-app)

## 🔗 URL de Production

Une fois déployé, mettez à jour le frontend avec l'URL :
```javascript
const API_URL = 'https://cinehome-backend.onrender.com';
```
