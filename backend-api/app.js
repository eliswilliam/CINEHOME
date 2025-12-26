// Carregar as variáveis de ambiente primeiro
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const emailRoutes = require('./email');
const emailService = require('./services/emailService');
const groqRoutes = require('./groqai');

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

// Rotas Chat/Groq AI
app.use('/api', groqRoutes);

// Rotas OAuth
app.use('/', emailRoutes);

// Servir arquivos estáticos do frontend (após as rotas da API)
const publicPath = path.join(__dirname, 'public');
console.log('📁 Servindo arquivos estáticos de:', publicPath);
app.use(express.static(publicPath));

// Rota catch-all: servir index.html para todas as rotas não-API (SPA)
// Apenas para requisições GET que não são de API
app.use((req, res, next) => {
  // Se for uma rota de API, deixar passar para retornar 404 do Express
  if (req.path.startsWith('/api') || req.path.startsWith('/auth')) {
    return next();
  }
  // Se for GET e não for API, servir index.html (SPA)
  if (req.method === 'GET') {
    return res.sendFile(path.join(publicPath, 'index.html'));
  }
  next();
});

// Middleware global de tratamento de erros - DEVE estar após todas as rotas
app.use((err, req, res, next) => {
  console.error('❌ Erro capturado pelo middleware:', err);
  console.error('Stack:', err.stack);
  res.status(err.status || 500).json({ 
    message: err.message || 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Porta do .env ou valor padrão (10000 para Render)
const PORT = process.env.PORT || 10000;
const HOST = process.env.HOST || '0.0.0.0';

// Inicialização do servidor
const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor iniciado em http://${HOST}:${PORT}`);
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

// Configurar timeouts para evitar WORKER TIMEOUT e Connection reset
// Render recomenda 120 segundos (120000ms) para evitar timeouts
server.keepAliveTimeout = 120000; // 120 segundos
server.headersTimeout = 120000;   // 120 segundos

console.log(`⏱️  Timeouts configurados: keepAlive=${server.keepAliveTimeout}ms, headers=${server.headersTimeout}ms`);

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error('❌ Erro: Porta já em uso');
    process.exit(1);
  } else {
    console.error('❌ Erro do servidor:', error);
  }
});

// Tratamento de erros não capturados - apenas log, não crash
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
  console.error('Stack:', error.stack);
  // Não fazer process.exit em produção para manter o servidor rodando
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promessa rejeitada não tratada:', reason);
  console.error('Promise:', promise);
  // Não fazer process.exit em produção para manter o servidor rodando
});
