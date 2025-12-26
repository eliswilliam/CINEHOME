# 🤖 Sistema de Chat CINEHOME - Integração TMDB

## 📋 Visão Geral

O chat da CINEHOME é um assistente virtual inteligente que **sempre busca informações de filmes no TMDB** (The Movie Database) para fornecer dados atualizados e precisos aos usuários.

## ✨ Funcionalidades

### 🎯 Busca Automática no TMDB
- ✅ **Extração inteligente de títulos**: O sistema identifica automaticamente nomes de filmes nas mensagens
- ✅ **Busca em múltiplos idiomas**: Tenta primeiro em PT-BR, depois em inglês se necessário
- ✅ **Informações completas**: Avaliação, sinopse, gêneros, duração, orçamento, receita
- ✅ **Contexto enriquecido**: Fornece dados do TMDB ao assistente AI

### 🧠 Inteligência do Assistente
- Usa **Groq AI** (modelo llama-3.3-70b-versatile) para respostas naturais
- Prioriza informações do TMDB quando disponíveis
- Responde em português brasileiro
- Usa emojis e linguagem amigável

## 🔧 Arquitetura

### Fluxo de Funcionamento

```
Usuário envia mensagem
        ↓
Extração de títulos de filmes
        ↓
Busca no TMDB para cada título
        ↓
Construção do contexto com dados TMDB
        ↓
Envio ao Groq AI com contexto
        ↓
Resposta formatada ao usuário
```

### Arquivos Principais

1. **`groqai.js`** - Lógica principal do chat
   - `extractMovieTitles()`: Extrai nomes de filmes da mensagem
   - `searchMovieInTMDB()`: Busca filme no TMDB
   - `getGroqChatCompletion()`: Processa e envia ao AI

2. **`services/tmdbService.js`** - Integração com TMDB API
   - `searchMovie()`: Busca filmes (com fallback PT→EN)
   - `getMovieDetails()`: Detalhes completos do filme
   - `searchAndFormatMovie()`: Busca e formata informações

3. **`public/ajuda.html`** - Interface do chat
   - Detecção automática de ambiente (localhost/produção)
   - UI responsiva e amigável

## 🚀 Como Usar

### Requisitos
```bash
# Variáveis de ambiente necessárias (.env)
TMDB_API_KEY=sua_chave_tmdb_aqui
GROQ_API_KEY=sua_chave_groq_aqui
```

### Obter Chaves API

1. **TMDB API Key**
   - Acesse: https://www.themoviedb.org/settings/api
   - Crie uma conta gratuita
   - Solicite uma chave API

2. **Groq API Key**
   - Acesse: https://console.groq.com
   - Crie uma conta
   - Gere uma chave API

### Testar o Sistema

```bash
# Terminal 1: Iniciar servidor
cd backend-api
node app.js

# Terminal 2: Executar testes
node test-chat.js
```

## 💬 Exemplos de Uso

### Perguntas que o Chat Responde

```
✅ "Me fale sobre o filme Avatar"
✅ "O que você sabe sobre John Wick?"
✅ "Qual é a sinopse de Interestelar?"
✅ "Me recomende um filme de ação"
✅ "Quero saber sobre Duna de 2021"
✅ "Qual a avaliação do Matrix?"
```

### Resposta Típica

**Usuário:** "Me fale sobre Avatar"

**Assistente:** 
```
🎬 Avatar (2009) é um épico de ficção científica dirigido por James Cameron!

⭐ Avaliação: 7.6/10 (31.234 votos no TMDB)

📖 Sinopse: Jake Sully, um ex-marine paraplégico, é enviado 
ao planeta Pandora para se infiltrar nos Na'vi, uma raça alienígena. 
Mas ele acaba se apaixonando pela cultura deles...

🎭 Gêneros: Ação, Aventura, Ficção Científica

⏱️ Duração: 162 minutos

O filme foi revolucionário pelos seus efeitos visuais e arrecadou 
bilhões no mundo todo! 🍿
```

## 🔍 Detecção de Filmes

### Padrões de Extração

O sistema usa vários padrões para identificar filmes:

1. **Explícitos**: "filme Avatar", "movie Matrix"
2. **Entre aspas**: "Duna" ou 'Interestelar'
3. **Após preposições**: "sobre Avatar", "de John Wick"
4. **Nomes próprios capitalizados**: John Wick, Top Gun

### Fallback

Se não encontrar no TMDB:
- Tenta busca em inglês
- Informa ao usuário que não encontrou
- Sugere alternativas baseado em conhecimento geral

## 📊 Informações Fornecidas pelo TMDB

Para cada filme encontrado:
- 🎬 Título (original e traduzido)
- 📅 Ano de lançamento
- ⭐ Avaliação (0-10) e número de votos
- 🎭 Gêneros
- ⏱️ Duração
- 📖 Sinopse completa
- 💰 Orçamento (quando disponível)
- 💵 Receita (quando disponível)
- 📈 Popularidade no TMDB
- 📺 Status (Released, Post Production, etc.)

## 🛠️ Personalização

### Ajustar Comportamento do Assistente

Edite o `systemPrompt` em `groqai.js`:

```javascript
const systemPrompt = `Você é o Assistente Virtual da CINEHOME 🎬

IMPORTANTE - SEMPRE use informações do TMDB!

INSTRUÇÕES:
1. Seja amigável e entusiasmado
2. Use emojis de cinema 🎥🍿🎬⭐
3. Priorize dados do TMDB
4. Responda em português brasileiro
// ... adicione suas instruções personalizadas
`;
```

### Adicionar Novos Padrões de Busca

Modifique `extractMovieTitles()` em `groqai.js`:

```javascript
const patterns = [
  /(?:filme|movie)\s+["']?([^"'?!.]+)["']?/gi,
  // Adicione seus padrões aqui
];
```

## 🐛 Troubleshooting

### Chat não responde
```bash
# Verificar se servidor está rodando
curl http://localhost:10000/health

# Verificar logs do servidor
# Procure por erros relacionados a TMDB ou Groq
```

### Filme não encontrado
- Verifique se a chave TMDB está configurada
- Tente com o título em inglês
- Verifique se o nome está escrito corretamente

### Erro de API Key
```bash
# Verificar arquivo .env
cat .env | grep TMDB_API_KEY
cat .env | grep GROQ_API_KEY
```

## 📈 Melhorias Futuras

- [ ] Cache de respostas do TMDB
- [ ] Busca por séries (além de filmes)
- [ ] Recomendações personalizadas
- [ ] Histórico de conversação
- [ ] Suporte a imagens dos filmes
- [ ] Integração com sistema de favoritos do usuário

## 📝 Notas Técnicas

### Limites de API
- **TMDB**: 40 requisições/10 segundos (gratuito)
- **Groq**: Varia conforme plano

### Performance
- Timeout de busca TMDB: 10 segundos
- Timeout de resposta Groq: 30 segundos
- Aguardar 2s entre testes para não sobrecarregar

### Segurança
- Chaves API no `.env` (não commitar!)
- Validação de entrada no backend
- Sanitização de respostas

---

**Desenvolvido para CINEHOME** 🎬
*Última atualização: Dezembro 2025*
