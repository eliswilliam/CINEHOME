// Carregar as variáveis de ambiente primeiro
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const emailRoutes = require('./email');
const emailService = require('./services/emailService');

const app = express();

app.use(cors({
  origin: true,       // reflete a origem da requisição e autoriza todas as origens
  credentials: true,  // permite o envio de cookies/credenciais se necessário
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin']
}));
app.use(express.json());
const path = require('path');

// Conexão ao MongoDB Atlas com tratamento de erro
// Tentamos conectar ao BD mas deixamos o servidor iniciar para permitir testes front-back
connectDB()
  .then(() => console.log('✅ MongoDB conectado com sucesso'))
  .catch((err) => {
    console.error('❌ Erro de conexão MongoDB:', err.message);
    console.warn('O servidor continua rodando para permitir os testes front-back. Corrija MONGO_URI para ativar o BD.');
    // Não usar process.exit aqui para permitir o uso de endpoints sem BD (ex: /health)
  });

// Middleware de logging para debug
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});

// Endpoint de saúde simples usado pelo frontend
app.get('/health', (req, res) => {
  return res.json({ status: 'ok', time: new Date().toISOString() });
});

// Rotas API - prioridade 1
app.use('/api/users', userRoutes);

// Rotas Reviews (Avaliações)
app.use('/api/reviews', reviewRoutes);

// Rotas OAuth
app.use('/', emailRoutes);

// Servir arquivos estáticos do frontend (após as rotas da API)
const publicPath = path.join(__dirname, 'public');
console.log('📁 Servindo arquivos estáticos de:', publicPath);
app.use(express.static(publicPath));

// Rota catch-all: servir index.html para todas as rotas não-API (SPA)
app.get('*', (req, res) => {
  // Não interceptar rotas de API
  if (req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path.startsWith('/health')) {
    return res.status(404).json({ message: 'Endpoint não encontrado' });
  }
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Porta do .env ou valor padrão
const PORT = process.env.PORT || 3000;

// Inicialização do servidor
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor iniciado em http://localhost:${PORT}`);
  console.log(`📂 Servidor HTTP em escuta...`);
  
  // Testar configuração de email de maneira assíncrona sem bloquear
  console.log('\n📧 Verificando configuração de email...');
  emailService.testEmailConfiguration()
    .then(emailConfigured => {
      if (!emailConfigured) {
        console.warn('⚠️  Configuração de email ausente. O sistema funcionará em modo desenvolvimento.');
        console.warn('💡 Para ativar o envio de emails, configure EMAIL_USER e EMAIL_PASSWORD no .env');
      }
      console.log('✅ Servidor pronto para receber requisições\n');
    })
    .catch(error => {
      console.error('❌ Erro ao verificar email:', error.message);
      console.warn('⚠️  O sistema funcionará em modo desenvolvimento.\n');
    });
});

server.on('error', (error) => {
  console.error('❌ Erro do servidor:', error);
  process.exit(1);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promessa rejeitada não tratada:', reason);
  process.exit(1);
});
