// Test serveur minimal pour isoler le problème
require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

// Logging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// Test health
app.get('/health', (req, res) => {
  console.log('✅ Health endpoint appelé');
  res.json({ status: 'ok' });
});

// Test password reset
app.post('/api/users/request-password-reset', async (req, res) => {
  console.log('✅ Password reset endpoint appelé');
  console.log('Body:', req.body);
  
  try {
    const { email } = req.body;
    res.json({ 
      message: 'Test réussi',
      email: email,
      code: '123456',
      devMode: true
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err);
  res.status(500).json({ error: err.message });
});

const PORT = 10000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test serveur sur http://0.0.0.0:${PORT}`);
});

server.on('error', (error) => {
  console.error('❌ Erreur serveur:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled rejection:', reason);
});
