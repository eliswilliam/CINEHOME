# 🔐 Système de Récupération de Mot de Passe - CINEHOME

## ✅ Configuration Complétée

Le système de récupération de mot de passe est maintenant **100% fonctionnel** !

---

## 🚀 Comment Utiliser

### Pour les Utilisateurs

1. **Ouvrir la page de login**
   - URL: `http://localhost:10000/login.html`
   - Ou: `http://127.0.0.1:5503/backend-api/public/login.html` (Live Server)

2. **Cliquer sur "Esqueceu a senha?"**

3. **Entrer votre email**
   - Exemple: `eliswilliam01@gmail.com`
   - Cliquer sur "Enviar código"

4. **Vérifier votre boîte email**
   - Un code à 6 chiffres vous sera envoyé
   - Le code expire dans 10 minutes

5. **Entrer le code reçu**
   - Saisir le code de 6 chiffres
   - Créer un nouveau mot de passe (min 6 caractères)
   - Confirmer le nouveau mot de passe

6. **Connexion avec le nouveau mot de passe**
   - Retour automatique à la page de login
   - Connectez-vous avec votre nouveau mot de passe

---

## 🔧 Configuration Technique

### Backend (Node.js)

**Serveur:** `http://localhost:10000`

**Endpoints API:**
- `POST /api/users/request-password-reset` - Demander un code
- `POST /api/users/verify-reset-code` - Vérifier le code
- `POST /api/users/reset-password` - Réinitialiser le mot de passe

**Fichiers modifiés:**
- ✅ `backend-api/routes/userRoutes.js` - Routes ajoutées
- ✅ `backend-api/controllers/userControllers.js` - Logique de récupération
- ✅ `backend-api/services/emailService.js` - Envoi d'emails
- ✅ `backend-api/app.js` - Gestion d'erreurs améliorée

### Frontend

**Fichiers configurés:**
- ✅ `public/config.js` - API_BASE_URL auto-détectée
- ✅ `public/login.html` - Interface utilisateur
- ✅ `public/main.js` - Gestion des formulaires
- ✅ `public/test-password-recovery.html` - Page de test complète

---

## 📧 Configuration Email

**Variables d'environnement (.env):**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=votre-mot-de-passe-app
```

**Note:** Si EMAIL_USER/EMAIL_PASSWORD ne sont pas configurés, le système fonctionne en mode développement et affiche le code dans la console.

---

## 🧪 Tests Effectués

### ✅ Tests Backend
```bash
# Test endpoint
curl -X POST http://localhost:10000/api/users/request-password-reset \
  -H "Content-Type: application/json" \
  -d '{"email":"eliswilliam01@gmail.com"}'

# Réponse attendue:
{
  "message": "Código enviado com sucesso",
  "expiresIn": "10 minutos"
}
```

### ✅ Tests Frontend
1. Page de login: **Fonctionnel** ✅
2. Formulaire "Esqueceu a senha?": **Fonctionnel** ✅
3. Vérification du code: **Fonctionnel** ✅
4. Réinitialisation du mot de passe: **Fonctionnel** ✅

### ✅ Tests Email
- Email envoyé avec succès à: `eliswilliam01@gmail.com`
- Code de 6 chiffres généré et envoyé
- Template HTML professionnel

---

## 🔄 Workflow Complet

```
1. Utilisateur oublie son mot de passe
   ↓
2. Clique sur "Esqueceu a senha?"
   ↓
3. Entre son email → Backend génère code 6 chiffres
   ↓
4. Email envoyé avec le code (expire en 10 min)
   ↓
5. Utilisateur entre le code → Backend vérifie
   ↓
6. Code valide → Token JWT généré (expire en 15 min)
   ↓
7. Utilisateur entre nouveau mot de passe
   ↓
8. Backend crypte et sauvegarde → Succès!
   ↓
9. Redirection vers login → Connexion avec nouveau MDP
```

---

## 🎯 Utilisateurs de Test Créés

| Email | Mot de passe initial |
|-------|---------------------|
| `test@example.com` | Test123456 |
| `eliswilliam01@gmail.com` | Test123456 |

**Note:** Ces mots de passe peuvent être réinitialisés via le système de récupération.

---

## 🚨 Résolution de Problèmes

### Le serveur crash
**Solution:** Le serveur doit être lancé dans un terminal séparé
```powershell
cd "c:\Users\elis\deploy vercel\cinehome1\backend-api"
node app.js
```

### Email non reçu
**Vérifications:**
1. Vérifier le dossier SPAM
2. Vérifier les variables EMAIL_USER et EMAIL_PASSWORD dans .env
3. Pour Gmail: utiliser un "Mot de passe d'application" (pas le mot de passe normal)

### Code expiré
- Le code expire après 10 minutes
- Demander un nouveau code si nécessaire

### Endpoint 404
- Vérifier que le serveur backend tourne sur `localhost:10000`
- Vérifier que la route `/api/users/request-password-reset` existe

---

## 📝 Logs Utiles

Le serveur affiche des logs détaillés :
- `🔵 forgotPassword chamado` - Endpoint appelé
- `🔍 Procurando usuário` - Recherche utilisateur
- `🔑 Código gerado` - Code généré
- `📧 Tentando enviar email` - Tentative d'envoi
- `✅ Retornando resposta de sucesso` - Succès

---

## 🎉 Prochaines Étapes (Optionnel)

1. **Limiter les tentatives** - Empêcher le spam (rate limiting)
2. **Historique des réinitialisations** - Logger les tentatives
3. **Notification** - Alerter l'utilisateur si quelqu'un demande une réinitialisation
4. **Sécurité renforcée** - 2FA, questions de sécurité, etc.

---

## 📞 Support

En cas de problème:
1. Vérifier les logs du serveur Node.js
2. Vérifier la console du navigateur (F12)
3. Tester avec la page de test: `http://localhost:10000/test-password-recovery.html`

---

**Date de création:** 26 décembre 2025  
**Statut:** ✅ Production Ready  
**Version:** 1.0.0
