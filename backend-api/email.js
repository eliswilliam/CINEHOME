const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('./models/userModel');
require('dotenv').config();

const router = express.Router();

// URLs configurables
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://cinemaf.onrender.com/reset.html';
const FRONTEND_LOGIN_URL = process.env.FRONTEND_LOGIN_URL || 'https://cinemaf.onrender.com/profil.html';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// --- Google OAuth (pour récupération de mot de passe) ---
router.get('/auth/google', (_req, res) => {
  // Utiliser l'URL de callback configurée dans .env
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || `${_req.protocol}://${_req.get('host')}/auth/google/callback`;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  
  console.log('🔐 Google OAuth (Reset) - Redirect URI:', redirectUri);
  console.log('🔐 Google OAuth (Reset) - Client ID:', clientId);
  
  if (!clientId) return res.status(500).send('GOOGLE_CLIENT_ID not configured');
  
  // Stocker le type d'action dans la session (reset password)
  const state = Buffer.from(JSON.stringify({ action: 'reset' })).toString('base64');
  
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile&access_type=offline&prompt=consent&state=${state}`;
  console.log('✅ Redirecting to Google OAuth (Reset) with URL:', url);
  res.redirect(url);
});

// --- Google OAuth pour LOGIN ---
router.get('/auth/google/login', (_req, res) => {
  const redirectUri = process.env.GOOGLE_LOGIN_CALLBACK_URL || `${_req.protocol}://${_req.get('host')}/auth/google/login/callback`;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  
  console.log('🔐 Google OAuth (Login) - Redirect URI:', redirectUri);
  
  if (!clientId) return res.status(500).send('GOOGLE_CLIENT_ID not configured');
  
  // Stocker le type d'action dans le state
  const state = Buffer.from(JSON.stringify({ action: 'login' })).toString('base64');
  
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile&access_type=offline&prompt=consent&state=${state}`;
  console.log('✅ Redirecting to Google OAuth (Login)');
  res.redirect(url);
});

// --- Google OAuth para CADASTRO ---
router.get('/auth/google/signup', (_req, res) => {
  const redirectUri = process.env.GOOGLE_SIGNUP_CALLBACK_URL || `${_req.protocol}://${_req.get('host')}/auth/google/signup/callback`;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  
  console.log('🔐 Google OAuth (Signup) - Redirect URI:', redirectUri);
  
  if (!clientId) return res.status(500).send('GOOGLE_CLIENT_ID not configured');
  
  // Stocker le type d'action dans le state
  const state = Buffer.from(JSON.stringify({ action: 'signup' })).toString('base64');
  
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile&access_type=offline&prompt=consent&state=${state}`;
  console.log('✅ Redirecting to Google OAuth (Signup)');
  res.redirect(url);
});

router.get('/auth/google/callback', async (req, res) => {
  const code = req.query.code;
  const state = req.query.state;
  
  console.log('📥 Google callback received - Code:', code ? 'présent' : 'absent');
  
  if (!code) {
    console.error('❌ Aucun code reçu de Google');
    return res.status(400).send('No code received from Google');
  }
  
  try {
    // Utiliser l'URL de callback configurée dans .env (DOIT correspondre exactement à Google Console)
    const redirectUri = process.env.GOOGLE_CALLBACK_URL || `${req.protocol}://${req.get('host')}/auth/google/callback`;
    
    console.log('🔄 Exchange token - Redirect URI:', redirectUri);

    // Google expects application/x-www-form-urlencoded for the token endpoint
    const params = new URLSearchParams();
    params.append('client_id', process.env.GOOGLE_CLIENT_ID);
    params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET);
    params.append('code', code);
    params.append('redirect_uri', redirectUri);
    params.append('grant_type', 'authorization_code');

    console.log('📤 Sending token request to Google...');
    
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const accessToken = tokenRes.data.access_token;
    console.log('✅ Token reçu de Google - Keys:', Object.keys(tokenRes.data));

    if (!accessToken) {
      console.error('❌ Pas de access_token dans la réponse Google');
      return res.status(500).send('Failed to get access token from Google');
    }

    console.log('📤 Fetching user profile from Google...');
    
    const profileRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const email = profileRes.data.email;
    const name = profileRes.data.name;

    console.log('✅ Google User (for reset):', { name, email });

    if (!email) {
      console.error('❌ Email not available from Google profile');
      return res.status(400).send('Email not available from Google');
    }

    const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '15m' });
    const redirectUrl = `${FRONTEND_URL}?reset_token=${encodeURIComponent(resetToken)}&source=google`;
    
    console.log('✅ Redirecting to frontend:', redirectUrl);
    
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('❌ Google OAuth Error:', err?.response?.data || err.message || err);
    console.error('❌ Error details:', {
      status: err?.response?.status,
      statusText: err?.response?.statusText,
      data: err?.response?.data
    });
    return res.status(500).send(`Google OAuth failed: ${err?.response?.data?.error_description || err.message}`);
  }
});

// --- Callback Google OAuth LOGIN ---
router.get('/auth/google/login/callback', async (req, res) => {
  const code = req.query.code;
  
  console.log('📥 Google LOGIN callback received');
  
  if (!code) {
    console.error('❌ Aucun code reçu de Google');
    return res.redirect(`https://cinemaf.onrender.com/login.html?error=no_code`);
  }
  
  try {
    const redirectUri = process.env.GOOGLE_LOGIN_CALLBACK_URL || `${req.protocol}://${req.get('host')}/auth/google/login/callback`;
    
    const params = new URLSearchParams();
    params.append('client_id', process.env.GOOGLE_CLIENT_ID);
    params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET);
    params.append('code', code);
    params.append('redirect_uri', redirectUri);
    params.append('grant_type', 'authorization_code');

    console.log('📤 Exchanging code for token (LOGIN)...');
    
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const accessToken = tokenRes.data.access_token;

    if (!accessToken) {
      console.error('❌ Pas de access_token');
      return res.redirect(`https://cinemaf.onrender.com/login.html?error=no_token`);
    }

    console.log('📤 Fetching user profile...');
    
    const profileRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const email = profileRes.data.email;
    const name = profileRes.data.name;

    console.log('✅ Google User (LOGIN):', { name, email });

    if (!email) {
      console.error('❌ Email not available');
      return res.redirect(`https://cinemaf.onrender.com/login.html?error=no_email`);
    }

    // Vérifier si l'utilisateur existe dans la base de données
    const user = await User.findOne({ email });

    if (!user) {
      console.warn('⚠️ Utilisateur non trouvé - redirection vers cadastro');
      return res.redirect(`https://cinemaf.onrender.com/login.html?error=user_not_found&email=${encodeURIComponent(email)}`);
    }

    // Générer un token JWT pour l'utilisateur
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    console.log('✅ Login successful, redirecting...');
    
    // Rediriger vers la page de profil avec le token
    return res.redirect(`${FRONTEND_LOGIN_URL}?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
  } catch (err) {
    console.error('❌ Google OAuth LOGIN Error:', err?.response?.data || err.message || err);
    return res.redirect(`https://cinemaf.onrender.com/login.html?error=oauth_failed`);
  }
});

// --- Callback Google OAuth CADASTRO ---
router.get('/auth/google/signup/callback', async (req, res) => {
  const code = req.query.code;
  
  console.log('📥 Google SIGNUP callback received');
  
  if (!code) {
    console.error('❌ Aucun code reçu de Google');
    return res.redirect(`https://cinemaf.onrender.com/login.html?error=no_code`);
  }
  
  try {
    const redirectUri = process.env.GOOGLE_SIGNUP_CALLBACK_URL || `${req.protocol}://${req.get('host')}/auth/google/signup/callback`;
    
    const params = new URLSearchParams();
    params.append('client_id', process.env.GOOGLE_CLIENT_ID);
    params.append('client_secret', process.env.GOOGLE_CLIENT_SECRET);
    params.append('code', code);
    params.append('redirect_uri', redirectUri);
    params.append('grant_type', 'authorization_code');

    console.log('📤 Exchanging code for token (SIGNUP)...');
    
    const tokenRes = await axios.post('https://oauth2.googleapis.com/token', params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const accessToken = tokenRes.data.access_token;

    if (!accessToken) {
      console.error('❌ Pas de access_token');
      return res.redirect(`https://cinemaf.onrender.com/login.html?error=no_token`);
    }

    console.log('📤 Fetching user profile...');
    
    const profileRes = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const email = profileRes.data.email;
    const name = profileRes.data.name;

    console.log('✅ Google User (SIGNUP):', { name, email });

    if (!email) {
      console.error('❌ Email not available');
      return res.redirect(`https://cinemaf.onrender.com/login.html?error=no_email`);
    }

    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email });

    if (user) {
      console.warn('⚠️ Utilisateur déjà existant - connexion automatique');
      // Si l'utilisateur existe déjà, le connecter automatiquement
      const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      return res.redirect(`${FRONTEND_LOGIN_URL}?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&existing=true`);
    }

    // Créer un nouvel utilisateur
    // Générer un mot de passe aléatoire sécurisé pour les utilisateurs OAuth
    const randomPassword = require('crypto').randomBytes(32).toString('hex');
    
    user = new User({
      email,
      password: randomPassword, // Ce mot de passe sera hashé par le pre-save hook du modèle
      createdViaOAuth: true,
      oauthProvider: 'google'
    });

    await user.save();

    console.log('✅ New user created via Google OAuth');

    // Générer un token JWT pour le nouvel utilisateur
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    console.log('✅ Signup successful, redirecting...');
    
    // Rediriger vers la page de profil avec le token
    return res.redirect(`${FRONTEND_LOGIN_URL}?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&new=true`);
  } catch (err) {
    console.error('❌ Google OAuth SIGNUP Error:', err?.response?.data || err.message || err);
    return res.redirect(`https://cinemaf.onrender.com/login.html?error=oauth_failed`);
  }
});

module.exports = router;
