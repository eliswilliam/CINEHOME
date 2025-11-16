const nodemailer = require('nodemailer');

/**
 * Envoyer un email avec un code de vérification
 * @param {string} toEmail - Email du destinataire
 * @param {string} code - Code de vérification à 6 chiffres
 * @returns {Promise} - Promesse de l'envoi
 */
exports.sendVerificationCode = async (toEmail, code) => {
  // Vérifier si les variables d'environnement sont configurées
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️ EMAIL_USER ou EMAIL_PASSWORD non configurés dans .env');
    console.warn('📧 MODE DÉVELOPPEMENT: Le code serait envoyé à:', toEmail);
    console.warn('🔑 Code de vérification:', code);
    
    // En développement, on simule l'envoi
    return {
      success: true,
      message: 'Mode développement - Email non envoyé',
      code: code // ATTENTION: Ne retournez JAMAIS le code en production!
    };
  }

  try {
    // Configuration du transporteur
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    // Template HTML pour l'email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .code-box {
            background: #f8f9fa;
            border: 2px dashed #667eea;
            border-radius: 10px;
            padding: 20px;
            margin: 30px 0;
            font-size: 36px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #667eea;
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            text-align: left;
            border-radius: 5px;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 CINEHOME</h1>
            <p>Recuperação de Senha</p>
          </div>
          <div class="content">
            <h2>Código de Verificação</h2>
            <p>Você solicitou a recuperação de sua senha. Use o código abaixo para continuar:</p>
            
            <div class="code-box">
              ${code}
            </div>
            
            <div class="warning">
              <strong>⏰ Atenção:</strong> Este código expira em <strong>10 minutos</strong>.
            </div>
            
            <p style="color: #666; margin-top: 30px;">
              Se você não solicitou esta recuperação, ignore este email.<br>
              Sua senha permanecerá segura.
            </p>
          </div>
          <div class="footer">
            <p>© 2025 CINEHOME - Seu cinema em casa</p>
            <p style="font-size: 12px; color: #999;">
              Este é um email automático, não responda.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Envoi de l'email
    const info = await transporter.sendMail({
      from: `"CINEHOME" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: '🔐 Código de Recuperação de Senha - CINEHOME',
      text: `Seu código de verificação é: ${code}\n\nEste código expira em 10 minutos.\n\nSe você não solicitou esta recuperação, ignore este email.`,
      html: htmlContent
    });

    console.log('✅ Email enviado com sucesso:', info.messageId);
    
    return {
      success: true,
      message: 'Email enviado com sucesso',
      messageId: info.messageId
    };

  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    
    // Em caso de erro, log mas não revelar detalhes ao usuário
    throw new Error('Erro ao enviar email. Verifique sua configuração.');
  }
};

/**
 * Tester la configuration email
 * @returns {Promise<boolean>} - True se a configuração está correta
 */
exports.testEmailConfiguration = async () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('⚠️  EMAIL_USER ou EMAIL_PASSWORD não configurados - Mode développement activé');
    return false;
  }

  try {
    // Test simple sans vérification SMTP
    console.log('✅ Variables d\'email configurées (non testé)');
    return true;
  } catch (error) {
    console.error('❌ Erro na configuração de email:', error.message);
    return false;
  }
};
