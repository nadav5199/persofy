const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    name: String,
    actors: [String],
    description: String,
    posterUrl: String,
    trailerUrl: String,
    director: String,
    tags: [String],
    rating: String,
    date: Date
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
