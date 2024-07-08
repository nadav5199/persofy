const express = require('express');
const mongoose = require('mongoose');
const { isAuthenticated } = require('../middleware/auth');
const Movie = require('../DataBase/models/Movie');

module.exports = function (userDb) {
    const router = express.Router();

    // Use the userDb connection to get the User model and register the Movie model
    const User = userDb.model('User');

    // Route to display the review page
    router.get('/review', isAuthenticated, async (req, res) => {
        try {
            const userId = req.session.userId;
            console.log('Fetching user with ID:', userId);

            // Convert userId to ObjectId
            const objectId = new mongoose.Types.ObjectId(userId);

            const user = await User.findById(objectId);
            if (!user) {
                console.log('User not found with ID:', userId);
                return res.status(404).send('User not found');
            }

            // Fetch only the recently purchased movies
            const recentlyPurchasedMovieIds = req.session.recentlyPurchasedMovies || [];
            console.log('Recently purchased movie IDs:', recentlyPurchasedMovieIds);

            const movies = await Movie.find({ _id: { $in: recentlyPurchasedMovieIds } });
            console.log('Fetched recently purchased movies:', movies);

            res.render('review', { userName: req.session.userName, userIcon: req.session.userIcon, movies, cart: req.session.cart || []  });
        } catch (err) {
            console.error('Error fetching movies for review:', err);
            res.status(500).send('Internal Server Error');
        }
    });

    // Route to handle review submission
    router.post('/review', isAuthenticated, async (req, res) => {
        const { reviews } = req.body; // Assuming reviews is an object with movieId:rating pairs
        console.log('Received reviews:', reviews);
        try {
            const userId = req.session.userId;
            console.log('Saving reviews for user ID:', userId);

            // Convert userId to ObjectId
            const objectId = new mongoose.Types.ObjectId(userId);

            const user = await User.findById(objectId);
            if (!user) {
                console.log('User not found with ID:', userId);
                return res.status(404).send('User not found');
            }

            // Ensure reviews is an object
            if (!user.reviews || typeof user.reviews !== 'object') {
                user.reviews = {};
            }

            for (const [movieId, rating] of Object.entries(reviews)) {
                console.log(`Setting rating for movie ${movieId} to ${rating}`);
                user.reviews.set(movieId, rating);  // Use .set() to update the Map
            }

            console.log('Updated user reviews:', user.reviews);

            await user.save();
            console.log('User reviews saved successfully');
            res.redirect('/');
        } catch (err) {
            console.error('Error saving reviews:', err);
            res.status(500).send('Internal Server Error');
        }
    });

    return router;
};
