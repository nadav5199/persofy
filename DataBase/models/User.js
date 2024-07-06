const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    purchasedMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
    icon: String // Add this line
});

const User = mongoose.model('User', userSchema);

module.exports = User;
