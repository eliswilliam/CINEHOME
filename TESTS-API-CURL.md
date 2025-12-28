# 🧪 Tests API avec cURL - Rede Social CineHome

Ce document contient des exemples de commandes cURL pour tester manuellement l'API du backend.

## 🌐 Configuration

**URL de base:** `http://localhost:10000`

## 📝 Testes de Posts

### 1. Créer un Post
```bash
curl -X POST http://localhost:10000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "author": "João Silva",
    "handle": "joaosilva",
    "avatar": "imagens/avatar-01.svg",
    "text": "Matrix é um dos melhores filmes de ficção científica!",
    "movieId": "matrix",
    "movieTitle": "Matrix",
    "moviePoster": "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    "rating": 5
  }'
```

**Réponse attendue:**
```json
{
  "message": "Post criado com sucesso",
  "post": {
    "_id": "...",
    "author": "João Silva",
    "handle": "joaosilva",
    ...
  }
}
```

### 2. Lister Tous les Posts
```bash
curl http://localhost:10000/api/posts
```

### 3. Lister avec Pagination
```bash
# Página 1, 5 posts
curl "http://localhost:10000/api/posts?page=1&limit=5"

# Página 2, 10 posts
curl "http://localhost:10000/api/posts?page=2&limit=10"
```

**Réponse attendue:**
```json
{
  "posts": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalPosts": 25,
    "hasMore": true
  }
}
```

### 4. Buscar Post por ID
```bash
# Substitua POST_ID pelo ID real
curl http://localhost:10000/api/posts/POST_ID
```

### 5. Deletar um Post
```bash
curl -X DELETE http://localhost:10000/api/posts/POST_ID \
  -H "Content-Type: application/json" \
  -d '{"handle": "joaosilva"}'
```

## ❤️ Testes de Likes

### 1. Dar Like em um Post
```bash
curl -X POST http://localhost:10000/api/posts/POST_ID/like \
  -H "Content-Type: application/json" \
  -d '{"handle": "joaosilva"}'
```

**Réponse attendue:**
```json
{
  "message": "Post curtido",
  "liked": true,
  "likes": 1
}
```

### 2. Remover Like (mesmo comando)
```bash
# Executar novamente remove o like
curl -X POST http://localhost:10000/api/posts/POST_ID/like \
  -H "Content-Type: application/json" \
  -d '{"handle": "joaosilva"}'
```

**Réponse attendue:**
```json
{
  "message": "Like removido",
  "liked": false,
  "likes": 0
}
```

## 💾 Testes de Save

### 1. Salvar um Post
```bash
curl -X POST http://localhost:10000/api/posts/POST_ID/save \
  -H "Content-Type: application/json" \
  -d '{"handle": "joaosilva"}'
```

### 2. Buscar Posts Salvos de um Usuário
```bash
curl http://localhost:10000/api/posts/user/joaosilva/saved
```

## 💬 Testes de Comentários

### 1. Adicionar um Comentário
```bash
curl -X POST http://localhost:10000/api/posts/POST_ID/comments \
  -H "Content-Type: application/json" \
  -d '{
    "author": "Maria Santos",
    "handle": "mariasantos",
    "avatar": "imagens/avatar-02.svg",
    "text": "Concordo! Um clássico!"
  }'
```

**Réponse attendue:**
```json
{
  "message": "Comentário adicionado",
  "comment": {
    "_id": "...",
    "author": "Maria Santos",
    "handle": "mariasantos",
    "text": "Concordo! Um clássico!",
    "likes": 0,
    "timestamp": "2024-01-15T..."
  }
}
```

### 2. Dar Like em um Comentário
```bash
curl -X POST http://localhost:10000/api/posts/POST_ID/comments/COMMENT_ID/like \
  -H "Content-Type: application/json" \
  -d '{"handle": "joaosilva"}'
```

### 3. Deletar um Comentário
```bash
curl -X DELETE http://localhost:10000/api/posts/POST_ID/comments/COMMENT_ID \
  -H "Content-Type: application/json" \
  -d '{"handle": "mariasantos"}'
```

## 👤 Testes de Usuário

### 1. Buscar Posts de um Usuário
```bash
curl http://localhost:10000/api/posts/user/joaosilva
```

### 2. Buscar Posts Salvos
```bash
curl http://localhost:10000/api/posts/user/joaosilva/saved
```

### 3. Com Paginação
```bash
curl "http://localhost:10000/api/posts/user/joaosilva?page=1&limit=5"
```

## ✅ Teste de Saúde do Backend

### Verificar se o Backend está Online
```bash
curl http://localhost:10000/health
```

**Réponse attendue:**
```json
{
  "status": "ok",
  "time": "2024-01-15T10:30:00.000Z"
}
```

## 🔄 Workflow Completo de Teste

Execute os comandos nesta ordem para testar o fluxo completo:

```bash
# 1. Verificar backend
curl http://localhost:10000/health

# 2. Criar um post (salve o _id retornado)
curl -X POST http://localhost:10000/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "author": "Teste User",
    "handle": "testeuser",
    "avatar": "imagens/avatar-01.svg",
    "text": "Post de teste",
    "movieId": "matrix",
    "movieTitle": "Matrix",
    "rating": 5
  }'

# 3. Listar posts
curl http://localhost:10000/api/posts

# 4. Dar like (use o _id do post criado)
curl -X POST http://localhost:10000/api/posts/POST_ID/like \
  -H "Content-Type: application/json" \
  -d '{"handle": "testeuser"}'

# 5. Adicionar comentário
curl -X POST http://localhost:10000/api/posts/POST_ID/comments \
  -H "Content-Type: application/json" \
  -d '{
    "author": "Outro User",
    "handle": "outrouser",
    "text": "Ótimo post!"
  }'

# 6. Buscar o post com comentário
curl http://localhost:10000/api/posts/POST_ID

# 7. Salvar post
curl -X POST http://localhost:10000/api/posts/POST_ID/save \
  -H "Content-Type: application/json" \
  -d '{"handle": "testeuser"}'

# 8. Ver posts salvos
curl http://localhost:10000/api/posts/user/testeuser/saved
```

## 📊 Testes de Erros

### Post sem campos obrigatórios
```bash
curl -X POST http://localhost:10000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"text": "Sem author e handle"}'
```

**Réponse attendue:**
```json
{
  "message": "Campos obrigatórios: author, handle, text"
}
```

### Post não encontrado
```bash
curl http://localhost:10000/api/posts/INVALID_ID
```

**Réponse attendue:**
```json
{
  "message": "Post não encontrado"
}
```

### Deletar post de outro usuário
```bash
curl -X DELETE http://localhost:10000/api/posts/POST_ID \
  -H "Content-Type: application/json" \
  -d '{"handle": "usuario_errado"}'
```

**Réponse attendue:**
```json
{
  "message": "Você não tem permissão para excluir este post"
}
```

## 🐧 PowerShell (Windows)

Para usar no PowerShell, use `Invoke-RestMethod`:

```powershell
# GET
Invoke-RestMethod -Uri "http://localhost:10000/api/posts" -Method Get

# POST
$body = @{
    author = "João Silva"
    handle = "joaosilva"
    text = "Teste de post"
    rating = 5
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:10000/api/posts" -Method Post -Body $body -ContentType "application/json"
```

## 📝 Notas Importantes

1. **IDs MongoDB**: Os IDs retornados pelo MongoDB estão no formato ObjectId (24 caracteres hexadecimais)
2. **Timestamps**: Todas as datas são em formato ISO 8601
3. **Validação**: O backend valida todos os campos obrigatórios
4. **Permissões**: Apenas o autor pode deletar seu próprio post/comentário

## 🎯 Próximos Passos

Depois de testar com cURL:
1. Use a interface web: `http://localhost:10000/social-feed.html`
2. Use a página de testes: `http://localhost:10000/test-social-api.html`
3. Integre com o frontend

---

**Happy Testing! 🚀**
