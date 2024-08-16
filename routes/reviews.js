/**
 * Review routes: Allow users to review movies they have recently purchased
 * Displays recently purchased movies and handles user review submissions.
 *
 * Dependencies:
 * - express: Web framework
 * - mongoose: MongoDB object modeling tool
 * - DataBase/persist: Custom database persistence methods for user and movie data
 * - middleware/auth: Custom authentication middleware to ensure users are authenticated
 */
const express = require('express');
const mongoose = require('mongoose');
const {isAuthenticated} = require('../middleware/auth');
const {getUserById, getMoviesByIds, saveOrUpdateUser} = require("../DataBase/persist");

const router = express.Router();

// Route to display the review page for recently purchased movies
router.get('/review', isAuthenticated, async (req, res) => {
    try {
        const userId = req.cookies.userId;
        console.log('Fetching user with ID:', userId);

        // Fetch the user by ID from the database
        const user = await getUserById(userId);
        if (!user) {
            console.log('User not found with ID:', userId);
            return res.status(404).send('User not found');
        }

        // Retrieve the list of recently purchased movies from cookies
        const recentlyPurchasedMovieIds = req.cookies.recentlyPurchasedMovies ? JSON.parse(req.cookies.recentlyPurchasedMovies) : [];
        console.log('Recently purchased movie IDs:', recentlyPurchasedMovieIds);

        // Fetch details of the recently purchased movies by their IDs
        const movies = await getMoviesByIds(recentlyPurchasedMovieIds);
        console.log('Fetched recently purchased movies:', movies);

        // Render the review page with movie and user information
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

// Route to handle review submissions for recently purchased movies
router.post('/review', isAuthenticated, async (req, res) => {
    const {reviews} = req.body; // Assuming reviews is an object with movieId:rating pairs
    console.log('Received reviews:', reviews);
    try {
        const userId = req.cookies.userId;
        console.log('Saving reviews for user ID:', userId);

        // Fetch the user by ID from the database
        const user = await getUserById(userId);
        if (!user) {
            console.log('User not found with ID:', userId);
            return res.status(404).send('User not found');
        }

        // Initialize the user's reviews if not already present
        if (!user.reviews || typeof user.reviews !== 'object') {
            user.reviews = {};
        }

        // Loop through each movieId and set the user's rating for that movie
        for (const [movieId, rating] of Object.entries(reviews)) {
            console.log(`Setting rating for movie ${movieId} to ${rating}`);
            user.reviews.set(movieId, rating);
        }

        console.log('Updated user reviews:', user.reviews);

        // Save the updated user reviews to the database
        await saveOrUpdateUser(user);
        console.log('User reviews saved successfully');

        // Redirect to the home page after saving reviews
        res.redirect('/');
    } catch (err) {
        console.error('Error saving reviews:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
