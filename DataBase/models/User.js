const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    purchasedMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
    icon: String,
    reviews: {
        type: Map,
        of: String,
        default: {}
    },
    favoriteGenres: [String], // Add this line for favorite genres
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
