/**
 * Movie recommendation routes: Generates personalized movie recommendations for the user
 * Utilizes OpenAI's GPT model to suggest movies based on user preferences, reviews, and available movies in the database.
 *
 * Dependencies:
 * - express: Web framework
 * - mongoose: MongoDB object modeling tool
 * - openai: OpenAI configuration for API requests
 * - DataBase/persist: Custom database persistence methods for user and movie data
 * - middleware/auth: Custom authentication middleware to ensure users are authenticated
 */
const express = require('express');
const mongoose = require('mongoose');
const {isAuthenticated} = require('../middleware/auth');
const openai = require('../config/openaiConfig');
const {getUserById, getAllMovies} = require("../DataBase/persist");

const router = express.Router();

/**
 * Function to generate personalized movie recommendations based on user preferences and reviews
 *
 * @param {Object} userPreferences - Object containing user reviews and favorite genres
 * @param {Array} movieData - Array of all available movies in the database
 * @param {number} retries - Number of retries for API request in case of rate limit errors
 * @returns {Array} - Array of recommended movie names
 */
async function getRecommendations(userPreferences, movieData, retries = 3) {
    // Collect user watch history and ratings for prompt generation
    const watchedMovies = Object.keys(userPreferences.reviews)
        .map(movieId => {
            const movie = movieData.find(m => m._id.toString() === movieId);
            return movie ? `${movie.name} (${userPreferences.reviews[movieId]})` : '';
        })
        .filter(Boolean)
        .join(', ');

    // List all available movies in the database
    const availableMovies = movieData.map(movie => movie.name).join(', ');

    // Generate a prompt for the OpenAI API based on user watch history, preferences, and available movies
    const prompt = `
    The user has watched and rated the following movies:
    ${watchedMovies}

    The user prefers the following genres:
    ${userPreferences.favoriteGenres.join(', ')}

    Here is a list of movies available in the database:
    ${availableMovies}

    Based on the user's watch history, ratings, and favorite genres, recommend 10 movies from the available movies list. 
    Prioritize the following:
    1. Movies that were not watched by this user.
    2. Movies from the same series that the user has watched if applicable.
    3. Movies with similar tags to the ones the user rated highly.
    4. Movies that fall under the user's favorite genres.

    Please return only the names of the movies, each on a new line, without any additional text.
    `;

    try {
        // Send the prompt to the OpenAI API and parse the response
        const response = await openai.chat.completions.create({
            messages: [{role: "system", content: "You are a helpful assistant."}, {role: "user", content: prompt}],
            model: "gpt-4o-mini",
        });

        console.log('OpenAI response:', response.data);

        // Extract and format the recommended movie names from the response
        const recommendedMovieNames = response.choices[0].message.content.trim().split('\n').map(movie => movie.trim());
        console.log('Recommended movie names:', recommendedMovieNames);

        return recommendedMovieNames;
    } catch (error) {
        // Handle rate limit errors by retrying the request after a delay
        if (error.status === 429 && retries > 0) {
            console.log('Rate limit exceeded. Retrying after delay...');
            await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 1 minute
            return getRecommendations(userPreferences, movieData, retries - 1); // Retry the request
        } else {
            console.error('Error from OpenAI API:', error);
            throw error;
        }
    }
}

// Route to display the personalized "For You" movie recommendation page
router.get('/foryou', isAuthenticated, async (req, res) => {
    try {
        const userId = req.cookies.userId;
        console.log('Fetching user with ID:', userId);

        const objectId = new mongoose.Types.ObjectId(userId);

        // Fetch the user from the database by ID
        const user = await getUserById(objectId);
        if (!user) {
            console.log('User not found with ID:', userId);
            return res.status(404).send('User not found');
        }

        // Get user preferences: favorite genres, purchased movies, and reviews
        const favoriteGenres = user.favoriteGenres || [];
        const purchasedMovies = user.purchasedMovies || [];
        const reviews = user.reviews || {};

        console.log('User favorite genres:', favoriteGenres);
        console.log('User purchased movie IDs:', purchasedMovies);
        console.log('User reviews:', reviews);

        // Fetch all available movies from the database
        const allMovies = await getAllMovies();

        // Get personalized movie recommendations based on user preferences and reviews
        const recommendedMovieNames = await getRecommendations({favoriteGenres, reviews}, allMovies);
        console.log('Recommended movie names:', recommendedMovieNames);

        // Filter the recommended movies from the complete movie list
        const recommendedMovies = allMovies.filter(movie => recommendedMovieNames.includes(movie.name));
        console.log('Recommended movies:', recommendedMovies);

        // Render the "For You" page with recommended movies and user information
        res.render('foryou', {
            userName: req.cookies.userName,
            userIcon: req.cookies.userIcon,
            recommendedMovies,
            cart: req.cookies.cart ? JSON.parse(req.cookies.cart) : []
        });
    } catch (err) {
        console.error('Error fetching recommendations:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
