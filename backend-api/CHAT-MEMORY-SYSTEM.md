# 🧠 Sistema de Memória do Chat CINEHOME

## 📋 Visão Geral

O chat da CINEHOME agora possui memória contextual, permitindo conversas naturais e contínuas com o assistente virtual. O sistema lembra do histórico da conversa, tornando a experiência mais fluida e inteligente.

## ✨ Funcionalidades

### 1. **Memória de Conversação**
- Mantém as últimas 10 mensagens (5 pares usuário/assistente)
- Permite conversas naturais com referências ao contexto anterior
- Exemplo:
  ```
  Usuário: "Me fale sobre Avatar"
  Bot: "Avatar é um filme de 2009..."
  Usuário: "Quem dirigiu?"  ← O bot sabe que você está falando de Avatar!
  Bot: "James Cameron dirigiu Avatar..."
  ```

### 2. **Persistência no Navegador**
- SessionId armazenado no `localStorage`
- Conversas continuam mesmo após recarregar a página
- Cada usuário tem sua própria sessão independente

### 3. **Limpeza Automática**
- Sessões expiram após 30 minutos de inatividade
- Limpeza automática a cada 10 minutos no servidor
- Botão "Limpar" para resetar o histórico manualmente

### 4. **Compatível com Deploy**
- Funciona em ambiente de produção (Render, Vercel, etc.)
- Usa armazenamento em memória (eficiente e rápido)
- Não requer banco de dados adicional

## 🔧 Implementação Técnica

### Backend (groqai.js)

```javascript
// Armazenamento de sessões em memória
const chatSessions = new Map();

// Cada sessão contém:
{
  messages: [],           // Histórico de mensagens
  lastActivity: Date,     // Último uso
  createdAt: Date        // Data de criação
}
```

**Endpoints:**
- `POST /api/chat` - Enviar mensagem (com sessionId)
- `POST /api/chat/clear` - Limpar histórico da sessão
- `GET /api/chat/session/:sessionId` - Verificar status da sessão

### Frontend

**localStorage:**
```javascript
// Recuperar ou criar sessionId
let sessionId = localStorage.getItem('chatSessionId');
if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chatSessionId', sessionId);
}
```

**Requisição:**
```javascript
fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ 
        message: "Sua mensagem",
        sessionId: sessionId 
    })
});
```

## 🚀 Uso

### Para Usuários

1. **Conversação Normal:**
   - Basta conversar naturalmente
   - O bot se lembrará do contexto

2. **Resetar Conversa:**
   - Clique no botão "🗑️ Limpar"
   - Ou limpe o localStorage do navegador

3. **Múltiplas Abas:**
   - Cada aba compartilha o mesmo sessionId
   - Conversas sincronizadas automaticamente

### Para Desenvolvedores

**Testar localmente:**
```bash
cd backend-api
node app.js
```

**Verificar sessão no console:**
```javascript
console.log(localStorage.getItem('chatSessionId'));
```

**Limpar sessão manualmente:**
```javascript
localStorage.removeItem('chatSessionId');
```

## 📊 Exemplo de Conversa com Memória

```
Usuário: Me fale sobre Matrix
Bot: 🎬 Matrix é um filme revolucionário de 1999...

Usuário: Quem é o protagonista?
Bot: O protagonista de Matrix é Neo, interpretado por Keanu Reeves...

Usuário: Tem sequência?
Bot: Sim! Matrix tem duas sequências: Matrix Reloaded e Matrix Revolutions...
```

**Sem memória** (antigo):
```
Usuário: Me fale sobre Matrix
Bot: 🎬 Matrix é um filme revolucionário de 1999...

Usuário: Quem é o protagonista?
Bot: ❓ Qual filme você está se referindo? [ERRO - Perdeu contexto]
```

## 🔒 Segurança

- ✅ SessionId não contém informações sensíveis
- ✅ Dados armazenados apenas temporariamente (30 min)
- ✅ Limpeza automática de sessões expiradas
- ✅ Filtro de segurança remove menções ao TMDB

## 🌐 Deploy

O sistema funciona perfeitamente em produção:

1. **Render/Heroku:**
   - Memória resetada a cada restart do servidor
   - SessionIds dos usuários continuam funcionando

2. **Vercel (Serverless):**
   - Como Vercel é serverless, considere usar Redis ou banco de dados
   - Alternativa: Manter em memória (funciona para sessões curtas)

3. **AWS/Azure:**
   - Funciona perfeitamente com instâncias persistentes

## 📈 Melhorias Futuras

- [ ] Salvar histórico no banco de dados MySQL
- [ ] Resumir conversas longas automaticamente
- [ ] Exportar histórico de conversas
- [ ] Análise de sentimento do usuário
- [ ] Sugestões proativas baseadas no histórico

## 🐛 Debug

**Ver sessões ativas:**
```javascript
// No console do servidor
console.log(`Sessões ativas: ${chatSessions.size}`);
```

**Ver histórico de uma sessão:**
```bash
curl http://localhost:10000/api/chat/session/SESSION_ID_AQUI
```

**Resposta:**
```json
{
  "exists": true,
  "messageCount": 6,
  "createdAt": "2025-12-25T23:30:00.000Z",
  "lastActivity": "2025-12-25T23:35:00.000Z"
}
```

## 📝 Notas

- Limite de 10 mensagens evita overflow de tokens na API Groq
- SessionId é regenerado ao clicar em "Limpar"
- Sistema compatível com múltiplos usuários simultâneos
- Cada navegador/dispositivo tem sua própria sessão

---

**Desenvolvido para CINEHOME 🎬**
*Sistema de chat inteligente com memória contextual*
