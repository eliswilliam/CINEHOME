const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Routes pour les posts
router.post('/', postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.delete('/:id', postController.deletePost);

// Routes pour les actions sur les posts
router.post('/:id/like', postController.likePost);
router.post('/:id/save', postController.savePost);

// Routes pour les commentaires
router.post('/:id/comments', postController.addComment);
router.post('/:id/comments/:commentId/like', postController.likeComment);
router.delete('/:id/comments/:commentId', postController.deleteComment);

// Routes pour les posts d'un utilisateur
router.get('/user/:handle', postController.getPostsByUser);
router.get('/user/:handle/saved', postController.getSavedPosts);

module.exports = router;
