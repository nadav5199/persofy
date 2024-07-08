const express = require('express');
const mongoose = require('mongoose');
const { isAuthenticated } = require('../middleware/auth');

module.exports = function (userDb) {
    const router = express.Router();

    // Use the userDb connection to get the User model
    const User = userDb.model('User');
    const Movie = userDb.model('Movie', require('../DataBase/models/Movie').schema);

    // Route to display the review page
    router.get('/review', isAuthenticated, async (req, res) => {
        try {
            const userId = req.session.userId;
            console.log('Fetching user with ID:', userId);

            // Convert userId to ObjectId
            const objectId = new mongoose.Types.ObjectId(userId);

            const user = await User.findById(objectId).populate('purchasedMovies');
            if (!user) {
                console.log('User not found with ID:', userId);
                return res.status(404).send('User not found');
            }

            const movies = user.purchasedMovies;
            console.log('Purchased movies:', movies);

            res.render('review', { userName: req.session.userName, userIcon: req.session.userIcon, movies });
        } catch (err) {
            console.error('Error fetching movies for review:', err);
            res.status(500).send('Internal Server Error');
        }
    });

    // Route to handle review submission
    router.post('/review', isAuthenticated, async (req, res) => {
        const { reviews } = req.body; // Assuming reviews is an object with movieId:rating pairs
        try {
            const userId = req.session.userId;
            console.log('Saving reviews for user ID:', userId);

            // Convert userId to ObjectId
            const objectId = mongoose.Types.ObjectId(userId);

            const user = await User.findById(objectId);
            if (!user) {
                console.log('User not found with ID:', userId);
                return res.status(404).send('User not found');
            }

            user.reviews = user.reviews || {};

            for (const [movieId, rating] of Object.entries(reviews)) {
                user.reviews[movieId] = rating;
            }

            await user.save();
            res.redirect('/');
        } catch (err) {
            console.error('Error saving reviews:', err);
            res.status(500).send('Internal Server Error');
        }
    });

    return router;
};
