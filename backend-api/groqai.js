require('dotenv').config();

const express = require('express');
const Groq = require('groq-sdk').default;
const { searchMovies, getMovieByTitle, getAllMovies, getMoviesByCategory } = require('./public/moviesData');
const { searchAndFormatMovie, getTMDBApiKey } = require('./services/tmdbService');

const router = express.Router();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// 🧠 Sistema de Memória do Chat
const chatSessions = new Map();
const MAX_HISTORY_MESSAGES = 10; // Últimas 10 mensagens (5 pares de usuário/assistente)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos

// Limpar sessões antigas a cada 10 minutos
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of chatSessions.entries()) {
    if (now - session.lastActivity > SESSION_TIMEOUT) {
      console.log(`🗑️ Removendo sessão expirada: ${sessionId}`);
      chatSessions.delete(sessionId);
    }
  }
}, 10 * 60 * 1000);

function getOrCreateSession(sessionId) {
  if (!chatSessions.has(sessionId)) {
    chatSessions.set(sessionId, {
      messages: [],
      lastActivity: Date.now(),
      createdAt: Date.now()
    });
    console.log(`🆕 Nova sessão criada: ${sessionId}`);
  } else {
    const session = chatSessions.get(sessionId);
    session.lastActivity = Date.now();
  }
  return chatSessions.get(sessionId);
}

function addMessageToHistory(sessionId, role, content) {
  const session = getOrCreateSession(sessionId);
  session.messages.push({ role, content });
  
  // Limitar histórico para evitar excesso de tokens
  if (session.messages.length > MAX_HISTORY_MESSAGES) {
    session.messages = session.messages.slice(-MAX_HISTORY_MESSAGES);
  }
  
  console.log(`💬 Mensagem adicionada ao histórico (${session.messages.length} mensagens)`);
}

function clearSessionHistory(sessionId) {
  if (chatSessions.has(sessionId)) {
    chatSessions.delete(sessionId);
    console.log(`🗑️ Histórico limpo para sessão: ${sessionId}`);
    return true;
  }
  return false;
}

function extractMovieTitles(message) {
  const titles = [];
  const lowerMessage = message.toLowerCase();
  
  const patterns = [
    /(?:filme|movie|film)\s+["']?([^"'?!.]+)["']?/gi,
    /["']([^"']+)["']/g,
    /sobre\s+([^?!.]+)/gi,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g
  ];
  
  patterns.forEach(pattern => {
    const matches = [...message.matchAll(pattern)];
    matches.forEach(match => {
      if (match[1] && match[1].trim().length > 2) {
        titles.push(match[1].trim());
      }
    });
  });
  
  if (titles.length === 0) {
    const words = message.split(/\s+/);
    const significantWords = words.filter(w => 
      w.length > 3 && 
      !['sobre', 'filme', 'movie', 'qual', 'onde', 'como', 'quando', 'quem'].includes(w.toLowerCase())
    );
    if (significantWords.length > 0) {
      titles.push(significantWords.join(' '));
    }
  }
  
  return [...new Set(titles)];
}

async function searchMovieInTMDB(query) {
  try {
    console.log(`🎬 Buscando no TMDB: "${query}"`);
    const result = await searchAndFormatMovie(query);
    
    if (result.encontrado) {
      console.log(`✅ Filme encontrado ${result.filme.titulo}`);
      return result;
    }
    
    console.log(`❌ Filme não encontrado no TMDB: "${query}"`);
    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar no TMDB:', error.message);
    return null;
  }
}

async function getGroqChatCompletion(message, sessionId) {
  let context = "";
  const movieKeywords = message.toLowerCase();
  
  console.log('\n🤖 === PROCESSANDO MENSAGEM DO CHAT ===');
  console.log('📝 Mensagem:', message);
  console.log('🔑 Sessão:', sessionId);
  
  const possibleTitles = extractMovieTitles(message);
  
  console.log('🔍 Títulos extraídos:', possibleTitles);
  
  const tmdbResults = [];
  for (const title of possibleTitles) {
    const result = await searchMovieInTMDB(title);
    if (result && result.encontrado) {
      tmdbResults.push(result);
    }
  }
  
  if (tmdbResults.length > 0) {
    context += "\n\n=== INFORMAÇÕES DOS FILMES (Base de Dados CINEHOME) ===\n";
    
    tmdbResults.forEach(tmdbInfo => {
      const filme = tmdbInfo.filme;
      context += `\n📽️ FILME ENCONTRADO:\n`;
      context += `   TÍTULO: ${filme.titulo}\n`;
      context += `   TÍTULO ORIGINAL: ${filme.tituloOriginal}\n`;
      context += `   ANO: ${filme.ano}\n`;
      context += `   AVALIAÇÃO: ⭐ ${filme.avaliacao}/10 (${filme.numeroVotos} votos)\n`;
      context += `   GÊNEROS: ${filme.generos}\n`;
      context += `   DURAÇÃO: ${filme.duracao}\n`;
      context += `   SINOPSE: ${filme.sinopse}\n`;
      context += `   POPULARIDADE: ${filme.popularidade.toFixed(1)}\n`;
      context += `   STATUS: ${filme.status}\n`;
      if (filme.orcamento && filme.orcamento !== 'N/A') {
        context += `   ORÇAMENTO: ${filme.orcamento}\n`;
      }
      if (filme.receita && filme.receita !== 'N/A') {
        context += `   RECEITA: ${filme.receita}\n`;
      }
      context += `\n---\n`;
    });
    
    console.log(`✅ ${tmdbResults.length} filme(s) encontrado(s) no TMDB`);
  } else {
    console.log('ℹ️ Nenhum filme específico encontrado no TMDB');
  }
  
  const systemPrompt = `Você é o Assistente Virtual da CINEHOME 🎬, uma plataforma de streaming de filmes e séries.

⚠️ REGRAS DE SEGURANÇA CRÍTICAS (PROIBIDO VIOLAR):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚫 JAMAIS mencione as palavras: "TMDB", "TMDb", "The Movie Database", "API", "banco de dados externo"
🚫 JAMAIS revele a origem técnica dos dados
🚫 JAMAIS diga "de acordo com o TMDB" ou "segundo o TMDB" 
🚫 JAMAIS mencione que os dados vêm de fora da CINEHOME
✅ SEMPRE diga: "de acordo com nossa plataforma" ou "na CINEHOME" ou "em nossa base de dados"
✅ SEMPRE apresente as informações como se fossem EXCLUSIVAS da CINEHOME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${context}

INSTRUÇÕES DE FORMATAÇÃO:
1. NUNCA use asteriscos (*), sublinhados (_) ou qualquer sintaxe Markdown
2. NUNCA use **negrito** ou *itálico* com asteriscos
3. Use apenas texto simples e limpo
4. Para destacar informações importantes, use MAIÚSCULAS ou emojis
5. Organize as informações de forma clara com quebras de linha

INSTRUÇÕES DE CONTEÚDO:
1. SEMPRE que houver informações no contexto acima, USE-AS como fonte principal
2. Apresente as informações como dados EXCLUSIVOS da CINEHOME
3. Seja amigável, informal e entusiasmado sobre filmes
4. Use emojis relacionados a cinema quando apropriado 🎥🍿🎬⭐
5. Se o usuário perguntar sobre um filme e você tiver dados, forneça de forma organizada:
   
   🎬 TÍTULO DO FILME (Ano)
   ⭐ Avaliação: X/10
   🎭 Gêneros: [lista]
   ⏱️ Duração: [tempo]
   
   📖 Sinopse:
   [texto da sinopse em parágrafos claros]
   
6. Se não encontrar o filme, diga: "Este filme não está disponível em nossa plataforma no momento"
7. Ajude o usuário a descobrir filmes baseado em suas preferências
8. Responda SEMPRE em português brasileiro de forma profissional mas amigável
9. Se o usuário fizer perguntas gerais sobre cinema, responda com conhecimento geral

EXEMPLO DE RESPOSTA CORRETA:
"Olá! Encontrei o filme em nossa plataforma:

🎬 AVATAR (2009)
⭐ Avaliação: 7.6/10 (mais de 30 mil avaliações)
🎭 Gêneros: Ação, Aventura, Ficção Científica
⏱️ Duração: 2h 42min

📖 Sobre o filme:
Avatar é uma obra-prima visual dirigida por James Cameron. A história acompanha Jake Sully, um ex-marine paraplégico que viaja para o distante planeta Pandora. Lá, ele participa de um programa que permite sua mente controlar um corpo alienígena chamado Avatar.

O filme foi revolucionário por seus efeitos visuais e criou um mundo completamente novo e imersivo. É uma experiência cinematográfica única que combina ação, romance e uma mensagem ambiental profunda."

LEMBRE-SE: Você representa a CINEHOME e todas as informações vêm da nossa plataforma!`;
  // 🧠 Recuperar histórico da sessão
  const session = getOrCreateSession(sessionId);
  const messages = [
    {
      role: "system",
      content: systemPrompt,
    },
    ...session.messages, // Incluir histórico de conversas anteriores
    {
      role: "user",
      content: message,
    },
  ];

  console.log(`📚 Incluindo ${session.messages.length} mensagens do histórico`);

  return groq.chat.completions.create({
    messages: messages,
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 1000,
  });
}

router.post('/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Mensagem não fornecida!" });
  }

  // Gerar sessionId se não fornecido
  const chatSessionId = sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    const responseGroq = await getGroqChatCompletion(message, chatSessionId);

    let responseText = responseGroq.choices[0]?.message?.content || "";
    
    // 🔒 FILTRO DE SEGURANÇA: Remove qualquer menção ao TMDB
    responseText = responseText
      .replace(/\bTMDB\b/gi, 'CINEHOME')
      .replace(/\bTMDb\b/gi, 'CINEHOME')
      .replace(/The Movie Database/gi, 'nossa plataforma')
      .replace(/de acordo com os dados dispon[ií]veis na API do TMDB/gi, 'de acordo com nossa plataforma')
      .replace(/segundo o TMDB/gi, 'segundo nossa base de dados')
      .replace(/no TMDB/gi, 'na CINEHOME')
      .replace(/do TMDB/gi, 'da CINEHOME')
      .replace(/API externa/gi, 'plataforma')
      .replace(/banco de dados externo/gi, 'nossa plataforma');

    // 🧠 Adicionar ao histórico
    addMessageToHistory(chatSessionId, 'user', message);
    addMessageToHistory(chatSessionId, 'assistant', responseText);

    console.log("Resposta da API Groq (filtrada):", responseText);

    res.json({ 
      response: responseText,
      sessionId: chatSessionId // Retornar sessionId para o frontend continuar usando
    });
  } catch (error) {
    console.error("Erro ao chamar a API da Groq:", error.message);
    return res.status(500).json({ error: "Erro ao consultar a API da Groq." });
  }
});

// 🗑️ Endpoint para limpar histórico de uma sessão
router.post('/chat/clear', async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "SessionId não fornecido!" });
  }

  const cleared = clearSessionHistory(sessionId);
  
  if (cleared) {
    res.json({ success: true, message: "Histórico limpo com sucesso!" });
  } else {
    res.json({ success: false, message: "Sessão não encontrada." });
  }
});

// 📊 Endpoint para verificar status da sessão (útil para debug)
router.get('/chat/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  
  if (chatSessions.has(sessionId)) {
    const session = chatSessions.get(sessionId);
    res.json({
      exists: true,
      messageCount: session.messages.length,
      createdAt: new Date(session.createdAt).toISOString(),
      lastActivity: new Date(session.lastActivity).toISOString()
    });
  } else {
    res.json({ exists: false });
  }
});

module.exports = router;

