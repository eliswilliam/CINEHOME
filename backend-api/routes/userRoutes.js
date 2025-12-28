const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');

// Routes d'authentification
router.post('/register', userController.register);
router.post('/login', userController.login);

// Routes de username (social)
router.get('/check-username/:username', userController.checkUsername);
router.post('/register-username', userController.registerUsername);

// Routes de récupération de mot de passe
router.post('/forgot-password', userController.forgotPassword);
router.post('/request-password-reset', userController.forgotPassword); // Alias pour compatibilité
router.post('/verify-reset-code', userController.verifyResetCode);
router.post('/reset-password', userController.resetPassword);

// Route de changement de mot de passe
router.post('/change-password', userController.changePassword);

module.exports = router;