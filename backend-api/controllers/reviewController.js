const Review = require('../models/reviewModel');

// Obter todas as avaliações de um filme
exports.getReviewsByMovie = async (req, res) => {
    try {
        const { movieId } = req.params;
        
        if (!movieId) {
            return res.status(400).json({ 
                success: false, 
                message: 'ID do filme é obrigatório' 
            });
        }

        const reviews = await Review.find({ movieId })
            .sort({ date: -1 }) // Mais recentes primeiro
            .lean();

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        console.error('Erro ao buscar avaliações:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar avaliações',
            error: error.message
        });
    }
};

// Criar nova avaliação
exports.createReview = async (req, res) => {
    try {
        const { movieId, username, userId, rating, comment } = req.body;

        // Validações
        if (!movieId || !username || !rating || !comment) {
            return res.status(400).json({
                success: false,
                message: 'Todos os campos são obrigatórios'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'A nota deve estar entre 1 e 5'
            });
        }

        if (comment.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'O comentário deve ter pelo menos 10 caracteres'
            });
        }

        if (comment.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'O comentário não pode ter mais de 500 caracteres'
            });
        }

        // Criar avaliação
        const review = new Review({
            movieId,
            username,
            userId,
            rating,
            comment,
            date: new Date()
        });

        await review.save();

        res.status(201).json({
            success: true,
            message: 'Avaliação criada com sucesso',
            data: review
        });
    } catch (error) {
        console.error('Erro ao criar avaliação:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar avaliação',
            error: error.message
        });
    }
};

// Obter estatísticas de um filme
exports.getMovieStats = async (req, res) => {
    try {
        const { movieId } = req.params;

        const stats = await Review.aggregate([
            { $match: { movieId } },
            {
                $group: {
                    _id: '$movieId',
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: '$rating' },
                    ratings: {
                        $push: {
                            rating: '$rating',
                            username: '$username',
                            date: '$date'
                        }
                    }
                }
            }
        ]);

        if (stats.length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    totalReviews: 0,
                    averageRating: 0,
                    ratingDistribution: {
                        5: 0, 4: 0, 3: 0, 2: 0, 1: 0
                    }
                }
            });
        }

        // Calcular distribuição de ratings
        const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        stats[0].ratings.forEach(r => {
            ratingDistribution[r.rating]++;
        });

        res.status(200).json({
            success: true,
            data: {
                totalReviews: stats[0].totalReviews,
                averageRating: Math.round(stats[0].averageRating * 10) / 10,
                ratingDistribution
            }
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar estatísticas',
            error: error.message
        });
    }
};

// Deletar avaliação (opcional - para moderação futura)
exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findByIdAndDelete(reviewId);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Avaliação não encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Avaliação deletada com sucesso'
        });
    } catch (error) {
        console.error('Erro ao deletar avaliação:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao deletar avaliação',
            error: error.message
        });
    }
};
