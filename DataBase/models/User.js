const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    purchasedMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
    icon: String,
    reviews: { type: Map, of: String }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
