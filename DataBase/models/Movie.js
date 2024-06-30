const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    name: String,
    actors: [String],
    description: String,
    posterUrl: String,
    trailerUrl: String,
    director: String,
    tags: [String],
});

const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;
