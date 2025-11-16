const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// @route   GET /api/reviews/:movieId
// @desc    Obter todas as avaliações de um filme
// @access  Public
router.get('/:movieId', reviewController.getReviewsByMovie);

// @route   POST /api/reviews
// @desc    Criar nova avaliação
// @access  Public
router.post('/', reviewController.createReview);

// @route   GET /api/reviews/:movieId/stats
// @desc    Obter estatísticas de avaliações de um filme
// @access  Public
router.get('/:movieId/stats', reviewController.getMovieStats);

// @route   DELETE /api/reviews/:reviewId
// @desc    Deletar avaliação (moderação)
// @access  Private (pode adicionar autenticação depois)
router.delete('/:reviewId', reviewController.deleteReview);

module.exports = router;
