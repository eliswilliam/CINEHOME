const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  handle: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: 'imagens/avatar-01.svg'
  },
  text: {
    type: String,
    required: true,
    maxlength: 500
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: String // User handles
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  handle: {
    type: String,
    required: true,
    index: true
  },
  avatar: {
    type: String,
    default: 'imagens/avatar-01.svg'
  },
  text: {
    type: String,
    required: true,
    maxlength: 1000
  },
  movieId: {
    type: String,
    default: null
  },
  movieTitle: {
    type: String,
    default: null
  },
  moviePoster: {
    type: String,
    default: null
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: String // User handles
  }],
  savedBy: [{
    type: String // User handles
  }],
  comments: [commentSchema],
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances des requêtes
postSchema.index({ timestamp: -1 });
postSchema.index({ handle: 1, timestamp: -1 });

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
