# 🎬 CineHome - Rede Social de Filmes

## 📖 Resumo da Integração

Foi realizada uma **integração completa** entre o frontend e o backend da rede social de filmes. O sistema agora está 100% funcional com MongoDB!

## 🚀 Como Iniciar

### 1. Instalar Dependências (se ainda não fez)
```bash
cd backend-api
npm install
```

### 2. Configurar Variáveis de Ambiente
Certifique-se de que o arquivo `.env` existe com:
```env
MONGO_URI=sua_connection_string_mongodb
PORT=10000
```

### 3. Iniciar o Servidor
```bash
npm start
```

O servidor estará disponível em: `http://localhost:10000`

## 🧪 Testar a Integração

### Método 1: Página de Testes
Abra no navegador:
```
http://localhost:10000/test-social-api.html
```

Esta página permite testar:
- ✅ Verificar status do backend
- ✅ Buscar posts (com e sem paginação)
- ✅ Criar posts
- ✅ Dar likes e saves
- ✅ Adicionar comentários
- ✅ Executar todos os testes automaticamente

### Método 2: Usar a Aplicação
Abra no navegador:
```
http://localhost:10000/social-feed.html
```

## 📂 Arquivos Principais

### Backend
- `backend-api/app.js` - Servidor Express principal
- `backend-api/models/postModel.js` - Modelo MongoDB de Posts
- `backend-api/controllers/postController.js` - Lógica de negócio
- `backend-api/routes/postRoutes.js` - Rotas da API

### Frontend
- `backend-api/public/social-feed.html` - Interface do feed
- `backend-api/public/social-feed.css` - Estilos (945 linhas)
- `backend-api/public/social-feed.js` - Lógica frontend (919 linhas)
- `backend-api/public/social-feed-backend-api.js` - **NOVO** - Cliente API
- `backend-api/public/test-social-api.html` - **NOVO** - Página de testes

## 🔌 API Endpoints Disponíveis

### Posts
```
POST   /api/posts                              - Criar post
GET    /api/posts?page=1&limit=20             - Listar posts
GET    /api/posts/:id                         - Buscar post por ID
DELETE /api/posts/:id                         - Deletar post
```

### Interações
```
POST   /api/posts/:id/like                    - Toggle like
POST   /api/posts/:id/save                    - Toggle save
```

### Comentários
```
POST   /api/posts/:id/comments                - Adicionar comentário
POST   /api/posts/:id/comments/:commentId/like - Like comentário
DELETE /api/posts/:id/comments/:commentId    - Deletar comentário
```

### Usuário
```
GET    /api/posts/user/:handle                - Posts do usuário
GET    /api/posts/user/:handle/saved          - Posts salvos
```

## ✨ Funcionalidades Implementadas

### ✅ Gestão de Posts
- Criar posts com ou sem filme associado
- Avaliar com 1-5 estrelas
- Scroll infinito com paginação automática
- Deletar posts próprios

### ✅ Interações Sociais
- Sistema de likes (com contagem)
- Salvar posts favoritos
- Compartilhar posts
- Comentar posts

### ✅ Comentários
- Adicionar comentários
- Like em comentários
- Responder comentários (@mention)
- Ver todos os comentários

### ✅ UX/UI
- Indicadores de carregamento
- Notificações de sucesso/erro
- Animações fluidas
- Interface estilo Threads/Twitter
- Modo fallback offline

## 📊 Exemplo de Uso da API

### JavaScript no Frontend
```javascript
// Criar um post
const postData = {
  author: 'João Silva',
  handle: 'joaosilva',
  avatar: 'imagens/avatar-01.svg',
  text: 'Matrix é incrível! 🎬',
  movieId: 'matrix',
  movieTitle: 'Matrix',
  moviePoster: 'https://...',
  rating: 5
};

const response = await window.SocialFeedAPI.createPost(postData);
console.log('Post criado:', response);

// Buscar posts
const posts = await window.SocialFeedAPI.getAllPosts(1, 20);
console.log('Posts:', posts);

// Dar like
await window.SocialFeedAPI.toggleLike(postId, 'joaosilva');
```

## 🔧 Solução de Problemas

### Erro: "Não foi possível conectar ao backend"
- Verifique se o servidor está rodando (`npm start`)
- Confirme que a porta 10000 está disponível
- Verifique o MONGO_URI no `.env`

### Erro: "Post não encontrado"
- Certifique-se de que está usando o ID correto (_id do MongoDB)
- Verifique se o post existe no banco de dados

### Posts não aparecem
- Abra o console do navegador (F12) para ver erros
- Verifique a aba Network para ver requisições HTTP
- Use a página de testes: `test-social-api.html`

## 📱 Recursos Avançados

### Paginação
Os posts são carregados em lotes de 20:
```javascript
// Carregar página 2
await SocialFeedAPI.getAllPosts(2, 20);
```

### Scroll Infinito
Ativado automaticamente! Quando você rola até o fim da página, mais posts são carregados.

### Posts de Usuário Específico
```javascript
await SocialFeedAPI.getPostsByUser('joaosilva', 1, 20);
```

## 🎨 Personalização

### Alterar Tema
Edite as cores em `social-feed.css`:
```css
/* Cor principal */
--primary-color: #5f5dff;

/* Cores de fundo */
--bg-gradient: linear-gradient(135deg, rgba(95, 93, 255, 0.05) 0%, rgba(95, 93, 255, 0.02) 100%);
```

### Adicionar Mais Filmes
Edite a função `populateMovieDropdown()` em `social-feed.js`

## 📚 Documentação Completa

Para mais detalhes técnicos, consulte:
- **INTEGRATION-SOCIAL-FEED.md** - Documentação completa da integração
- **SOCIAL-NETWORK-API.md** - Documentação da API do backend

## 🐛 Reportar Bugs

Se encontrar problemas:
1. Verifique o console do navegador (F12)
2. Verifique os logs do servidor
3. Use a página de testes para isolar o problema
4. Documente os passos para reproduzir

## 🎉 Pronto!

Sua rede social de filmes está **100% funcional**! 

Divirta-se compartilhando suas opiniões sobre filmes! 🍿🎬

---

**Desenvolvido com ❤️ para CineHome**
