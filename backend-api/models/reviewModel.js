const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    movieId: {
        type: String,
        required: true,
        index: true
    },
    username: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: false // Opcional pour l'instant
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 500
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index composé pour recherches rapides
reviewSchema.index({ movieId: 1, date: -1 });

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
