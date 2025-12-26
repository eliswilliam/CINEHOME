const Post = require('../models/postModel');

/**
 * Créer un nouveau post
 */
exports.createPost = async (req, res) => {
  try {
    const { author, handle, avatar, text, movieId, movieTitle, moviePoster, rating } = req.body;

    // Validation
    if (!author || !handle || !text) {
      return res.status(400).json({ 
        message: 'Campos obrigatórios: author, handle, text' 
      });
    }

    const newPost = new Post({
      author,
      handle,
      avatar: avatar || 'imagens/avatar-01.svg',
      text,
      movieId: movieId || null,
      movieTitle: movieTitle || null,
      moviePoster: moviePoster || null,
      rating: rating || 0
    });

    const savedPost = await newPost.save();
    
    res.status(201).json({
      message: 'Post criado com sucesso',
      post: savedPost
    });
  } catch (error) {
    console.error('Erro ao criar post:', error);
    res.status(500).json({ message: 'Erro ao criar post', error: error.message });
  }
};

/**
 * Récupérer tous les posts (avec pagination)
 */
exports.getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments();

    res.status(200).json({
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasMore: skip + posts.length < total
      }
    });
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    res.status(500).json({ message: 'Erro ao buscar posts', error: error.message });
  }
};

/**
 * Récupérer un post par ID
 */
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post não encontrado' });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error('Erro ao buscar post:', error);
    res.status(500).json({ message: 'Erro ao buscar post', error: error.message });
  }
};

/**
 * Récupérer les posts d'un utilisateur
 */
exports.getPostsByUser = async (req, res) => {
  try {
    const { handle } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ handle })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ handle });

    res.status(200).json({
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasMore: skip + posts.length < total
      }
    });
  } catch (error) {
    console.error('Erro ao buscar posts do usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar posts', error: error.message });
  }
};

/**
 * Liker un post
 */
exports.likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { handle } = req.body;

    if (!handle) {
      return res.status(400).json({ message: 'Handle do usuário é obrigatório' });
    }

    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post não encontrado' });
    }

    // Vérifier si l'utilisateur a déjà liké
    const hasLiked = post.likedBy.includes(handle);

    if (hasLiked) {
      // Unlike
      post.likedBy = post.likedBy.filter(h => h !== handle);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // Like
      post.likedBy.push(handle);
      post.likes += 1;
    }

    await post.save();

    res.status(200).json({
      message: hasLiked ? 'Like removido' : 'Post curtido',
      liked: !hasLiked,
      likes: post.likes
    });
  } catch (error) {
    console.error('Erro ao curtir post:', error);
    res.status(500).json({ message: 'Erro ao curtir post', error: error.message });
  }
};

/**
 * Sauvegarder/Unsave un post
 */
exports.savePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { handle } = req.body;

    if (!handle) {
      return res.status(400).json({ message: 'Handle do usuário é obrigatório' });
    }

    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post não encontrado' });
    }

    const hasSaved = post.savedBy.includes(handle);

    if (hasSaved) {
      // Unsave
      post.savedBy = post.savedBy.filter(h => h !== handle);
    } else {
      // Save
      post.savedBy.push(handle);
    }

    await post.save();

    res.status(200).json({
      message: hasSaved ? 'Post removido dos salvos' : 'Post salvo',
      saved: !hasSaved
    });
  } catch (error) {
    console.error('Erro ao salvar post:', error);
    res.status(500).json({ message: 'Erro ao salvar post', error: error.message });
  }
};

/**
 * Récupérer les posts sauvegardés d'un utilisateur
 */
exports.getSavedPosts = async (req, res) => {
  try {
    const { handle } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ savedBy: handle })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ savedBy: handle });

    res.status(200).json({
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
        hasMore: skip + posts.length < total
      }
    });
  } catch (error) {
    console.error('Erro ao buscar posts salvos:', error);
    res.status(500).json({ message: 'Erro ao buscar posts salvos', error: error.message });
  }
};

/**
 * Ajouter un commentaire à un post
 */
exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { author, handle, avatar, text } = req.body;

    if (!author || !handle || !text) {
      return res.status(400).json({ 
        message: 'Campos obrigatórios: author, handle, text' 
      });
    }

    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post não encontrado' });
    }

    const newComment = {
      author,
      handle,
      avatar: avatar || 'imagens/avatar-01.svg',
      text,
      timestamp: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    res.status(201).json({
      message: 'Comentário adicionado',
      comment: post.comments[post.comments.length - 1]
    });
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    res.status(500).json({ message: 'Erro ao adicionar comentário', error: error.message });
  }
};

/**
 * Liker un commentaire
 */
exports.likeComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { handle } = req.body;

    if (!handle) {
      return res.status(400).json({ message: 'Handle do usuário é obrigatório' });
    }

    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post não encontrado' });
    }

    const comment = post.comments.id(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comentário não encontrado' });
    }

    const hasLiked = comment.likedBy.includes(handle);

    if (hasLiked) {
      // Unlike
      comment.likedBy = comment.likedBy.filter(h => h !== handle);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      // Like
      comment.likedBy.push(handle);
      comment.likes += 1;
    }

    await post.save();

    res.status(200).json({
      message: hasLiked ? 'Like removido' : 'Comentário curtido',
      liked: !hasLiked,
      likes: comment.likes
    });
  } catch (error) {
    console.error('Erro ao curtir comentário:', error);
    res.status(500).json({ message: 'Erro ao curtir comentário', error: error.message });
  }
};

/**
 * Supprimer un post
 */
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { handle } = req.body;

    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post não encontrado' });
    }

    // Vérifier que l'utilisateur est l'auteur du post
    if (post.handle !== handle) {
      return res.status(403).json({ message: 'Você não tem permissão para excluir este post' });
    }

    await Post.findByIdAndDelete(id);

    res.status(200).json({ message: 'Post excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir post:', error);
    res.status(500).json({ message: 'Erro ao excluir post', error: error.message });
  }
};

/**
 * Supprimer un commentaire
 */
exports.deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { handle } = req.body;

    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post não encontrado' });
    }

    const comment = post.comments.id(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comentário não encontrado' });
    }

    // Vérifier que l'utilisateur est l'auteur du commentaire ou du post
    if (comment.handle !== handle && post.handle !== handle) {
      return res.status(403).json({ 
        message: 'Você não tem permissão para excluir este comentário' 
      });
    }

    comment.remove();
    await post.save();

    res.status(200).json({ message: 'Comentário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir comentário:', error);
    res.status(500).json({ message: 'Erro ao excluir comentário', error: error.message });
  }
};
