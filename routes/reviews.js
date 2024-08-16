const express = require('express');
const mongoose = require('mongoose');
const {isAuthenticated} = require('../middleware/auth');
const {getUserById, getMoviesByIds, saveOrUpdateUser} = require("../DataBase/persist");

const router = express.Router();

// Route to display the review page
router.get('/review', isAuthenticated, async (req, res) => {
    try {
        const userId = req.cookies.userId;
        console.log('Fetching user with ID:', userId);


        const user = await getUserById(userId);
        if (!user) {
            console.log('User not found with ID:', userId);
            return res.status(404).send('User not found');
        }

        const recentlyPurchasedMovieIds = req.cookies.recentlyPurchasedMovies ? JSON.parse(req.cookies.recentlyPurchasedMovies) : [];
        console.log('Recently purchased movie IDs:', recentlyPurchasedMovieIds);

        const movies = await getMoviesByIds(recentlyPurchasedMovieIds);
        console.log('Fetched recently purchased movies:', movies);

        res.render('review', {
            userName: req.cookies.userName,
            userIcon: req.cookies.userIcon,
            movies,
            cart: req.cookies.cart ? JSON.parse(req.cookies.cart) : []
        });
    } catch (err) {
        console.error('Error fetching movies for review:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to handle review submission
router.post('/review', isAuthenticated, async (req, res) => {
    const {reviews} = req.body; // Assuming reviews is an object with movieId:rating pairs
    console.log('Received reviews:', reviews);
    try {
        const userId = req.cookies.userId;
        console.log('Saving reviews for user ID:', userId);


        const user = await getUserById(userId);
        if (!user) {
            console.log('User not found with ID:', userId);
            return res.status(404).send('User not found');
        }

        if (!user.reviews || typeof user.reviews !== 'object') {
            user.reviews = {};
        }

        for (const [movieId, rating] of Object.entries(reviews)) {
            console.log(`Setting rating for movie ${movieId} to ${rating}`);
            user.reviews.set(movieId, rating);
        }

        console.log('Updated user reviews:', user.reviews);
        await saveOrUpdateUser(user);
        console.log('User reviews saved successfully');
        res.redirect('/');
    } catch (err) {
        console.error('Error saving reviews:', err);
        res.status(500).send('Internal Server Error');
    }
})

module.exports = router;
