const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

// Armazenar códigos de verificação temporariamente (em produção, use Redis ou BD)
const verificationCodes = new Map();

// Registro
exports.register = async (req, res) => {
  try {
  const { email, password } = req.body;
  const userExist = await User.findOne({ email });
  if (userExist) return res.status(400).json({ message: 'Usuário já existente' });

  // A senha é criptografada no hook pre('save') do modelo User.
  // Aqui fornecemos a senha em texto claro e o modelo cuida da criptografia.
  const newUser = await User.create({ email, password });

    res.status(201).json({ message: 'Usuário criado com sucesso', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Senha incorreta' });
    
    
  // Utilizar a chave JWT das variáveis de ambiente para segurança
  const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
  if (!process.env.JWT_SECRET) console.warn('⚠️ JWT_SECRET não definido. Usando segredo de desenvolvimento (dev-secret). Configure JWT_SECRET no .env para produção.');

  const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });

  res.json({ message: 'Login realizado com sucesso', token });
  } catch (error) {
    res.status(500).json({ message: 'Erro no servidor' });
  }
};


// Enviar código de recuperação por email
exports.forgotPassword = async (req, res) => {
  console.log('🔵 forgotPassword chamado');
  console.log('📦 req.body:', req.body);
  
  try {
    const { email } = req.body;
    if (!email) {
      console.log('❌ Email não fornecido');
      return res.status(400).json({ message: 'Email obrigatório' });
    }

    console.log('🔍 Procurando usuário:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Usuário não encontrado:', email);
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    console.log('✅ Usuário encontrado');
    // Gerar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🔑 Código gerado:', code);
    
    // Armazenar código com expiração de 10 minutos
    verificationCodes.set(email, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutos
    });

    console.log('💾 Código armazenado');
    
    // Enviar código por email
    try {
      console.log('📧 Tentando enviar email...');
      const emailResult = await emailService.sendVerificationCode(email, code);
      console.log('📧 Resultado do envio:', emailResult);
      
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
      
      console.log('✅ Retornando resposta de sucesso');
      res.json(response);
    } catch (emailError) {
      console.error('❌ Erro ao enviar email:', emailError);
      // Código gerado mas email não enviado - ainda retornar sucesso para não revelar se o email existe
      res.json({ 
        message: 'Se o email existir, você receberá um código em breve',
        expiresIn: '10 minutos',
        code: code, // Em dev, retornar código
        devMode: true
      });
    }
  } catch (error) {
    console.error('❌ forgotPassword error:', error);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({ message: 'Erro no servidor', error: error.message });
  }
};

// Verificar código de recuperação
exports.verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: 'Email e código obrigatórios' });

    const storedData = verificationCodes.get(email);
    
    if (!storedData) {
      return res.status(400).json({ message: 'Código não encontrado ou expirado' });
    }

    if (Date.now() > storedData.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({ message: 'Código expirado' });
    }

    if (storedData.code !== code) {
      return res.status(400).json({ message: 'Código incorreto' });
    }

    // Código válido - gerar token de reset
    const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
    const resetToken = jwt.sign({ email }, jwtSecret, { expiresIn: '15m' });

    // Remover código usado
    verificationCodes.delete(email);

    res.json({ 
      message: 'Código verificado com sucesso',
      resetToken 
    });
  } catch (error) {
    console.error('verifyResetCode error:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
};


// Redefinir senha via resetToken JWT
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) return res.status(400).json({ message: 'resetToken e newPassword são obrigatórios' });

    const jwtSecret = process.env.JWT_SECRET || 'dev-secret';
    let payload;
    try {
      payload = jwt.verify(resetToken, jwtSecret);
    } catch (err) {
      return res.status(401).json({ message: 'Token de reset inválido ou expirado' });
    }

    const email = payload.email;
    if (!email) return res.status(400).json({ message: 'Payload do token inválido' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

    console.log('🔐 Redefinindo senha para:', email);
    
    // Ne PAS hasher manuellement ! Le hook pre('save') du modèle le fera automatiquement
    user.password = newPassword;
    await user.save();

    console.log('✅ Senha redefinida com sucesso para:', email);
    return res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    console.error('resetPassword error:', error);
    return res.status(500).json({ message: 'Erro no servidor' });
  }
};

// Alterar senha (usuário conectado)
exports.changePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    
    console.log('📝 Tentativa de alteração de senha para:', email);
    
    if (!email || !currentPassword || !newPassword) {
      console.log('❌ Campos obrigatórios faltando');
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    // Verificar que a nova senha é diferente
    if (currentPassword === newPassword) {
      console.log('❌ Nova senha igual à senha atual');
      return res.status(400).json({ message: 'A nova senha deve ser diferente da senha atual' });
    }

    // Encontrar o usuário
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Usuário não encontrado:', email);
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    console.log('✅ Usuário encontrado:', email);
    console.log('🔐 Verificando senha atual...');

    // Verificar a senha atual
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      console.log('❌ Senha atual incorreta');
      return res.status(401).json({ message: 'Senha atual incorreta' });
    }

    console.log('✅ Senha atual correta');
    console.log('🔐 Atualizando senha...');

    // Criptografar e salvar a nova senha
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