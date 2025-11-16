const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

// Stocker codes de vérification temporairement (em produção, use Redis ou DB)
const verificationCodes = new Map();

// Inscription
exports.register = async (req, res) => {
  try {
  const { email, password } = req.body;
  const userExist = await User.findOne({ email });
  if (userExist) return res.status(400).json({ message: 'Utilisateur déjà existant' });

  // Le mot de passe est hashé dans le hook pre('save') du modèle User.
  // Ici on fournit le mot de passe en clair et le modèle s'occupe du hash.
  const newUser = await User.create({ email, password });

    res.status(201).json({ message: 'Utilisateur créé avec succès', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Mot de passe incorrect' });
    
    
  // Utiliser la clé JWT depuis les variables d'environnement pour la sécurité
  const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
  if (!process.env.JWT_SECRET) console.warn('⚠️ JWT_SECRET non défini. Utilisation du secret de développement (dev-secret). Configurez JWT_SECRET dans .env pour la production.');

  const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });

  res.json({ message: 'Connexion réussie', token });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};


// Envoyer code de récupération par email
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email requis' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    // Gerar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Armazenar código com expiração de 10 minutos
    verificationCodes.set(email, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutos
    });

    // Enviar código por email
    try {
      const emailResult = await emailService.sendVerificationCode(email, code);
      
      console.log(`📧 Código de recuperação para ${email}: ${code}`);
      
      // Em produção, NÃO retorne o código na resposta!
      const response = { 
        message: 'Código enviado com sucesso',
        expiresIn: '10 minutos'
      };
      
      // Apenas em modo desenvolvimento (quando email não está configurado)
      if (emailResult.code) {
        response.code = emailResult.code;
        response.devMode = true;
      }
      
      res.json(response);
    } catch (emailError) {
      console.error('❌ Erro ao enviar email:', emailError);
      // Código gerado mas email não enviado - ainda retornar sucesso para não revelar se o email existe
      res.json({ 
        message: 'Se o email existir, você receberá um código em breve',
        expiresIn: '10 minutos'
      });
    }
  } catch (error) {
    console.error('forgotPassword error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Verificar código de recuperação
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: 'Email et code requis' });

    const storedData = verificationCodes.get(email);
    
    if (!storedData) {
      return res.status(400).json({ message: 'Code non trouvé ou expiré' });
    }

    if (Date.now() > storedData.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({ message: 'Code expiré' });
    }

    if (storedData.code !== code) {
      return res.status(400).json({ message: 'Code incorrect' });
    }

    // Código válido - gerar token de reset
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
    const resetToken = jwt.sign({ email }, jwtSecret, { expiresIn: '15m' });

    // Remover código usado
    verificationCodes.delete(email);

    res.json({ 
      message: 'Code vérifié avec succès',
      resetToken 
    });
  } catch (error) {
    console.error('verifyResetCode error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};


// Réinitialiser le mot de passe via resetToken JWT
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) return res.status(400).json({ message: 'resetToken and newPassword are required' });

    const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
    let payload;
    try {
      payload = jwt.verify(resetToken, jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired reset token' });
    }

    const email = payload.email;
    if (!email) return res.status(400).json({ message: 'Invalid token payload' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    console.error('resetPassword error:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Changer le mot de passe (utilisateur connecté)
exports.changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    
    console.log('📝 Tentativa de alteração de senha para:', email);
    
    if (!email || !currentPassword || !newPassword) {
      console.log('❌ Campos obrigatórios faltando');
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    // Vérifier que le nouveau mot de passe est différent
    if (currentPassword === newPassword) {
      console.log('❌ Nova senha igual à senha atual');
      return res.status(400).json({ message: 'A nova senha deve ser diferente da senha atual' });
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Usuário não encontrado:', email);
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    console.log('✅ Usuário encontrado:', email);
    console.log('🔐 Verificando senha atual...');

    // Vérifier le mot de passe actuel
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.log('❌ Senha atual incorreta');
      return res.status(401).json({ message: 'Senha atual incorreta' });
    }

    console.log('✅ Senha atual correta');
    console.log('🔐 Atualizando senha...');

    // Hasher et sauvegarder le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    console.log(`✅ Senha alterada com sucesso para: ${email}`);
    
    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao alterar senha:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};