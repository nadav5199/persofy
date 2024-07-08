const express = require('express');
const mongoose = require('mongoose');
const {isAuthenticated} = require('../middleware/auth');
const openai = require('../config/openaiConfig');
const Movie = require('../DataBase/models/Movie');

module.exports = function (userDb) {
    const router = express.Router();

    // Use the userDb connection to get the User model
    const User = userDb.model('User');


    async function getRecommendations(userPreferences, movieData, retries = 3) {
        const prompt = `
        User Preferences:
        Favorite Genres: ${userPreferences.favoriteGenres.join(', ')}
        Purchased Movies and Ratings: ${JSON.stringify(userPreferences.reviews)}

        Available Movies:
        ${movieData.map(movie => `Name: ${movie.name}, Description: ${movie.description}, Genres: ${movie.tags.join(', ')}`).join('\n')}

        Based on the user preferences and the available movies, recommend movies for the user. 
        Please return only the names of the movies exactly as they appear in the database, each on a new line without any additional text.
    `;

        try {
            const response = await openai.chat.completions.create({
                messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: prompt }],
                model: "gpt-3.5-turbo",
            });

            console.log('OpenAI response:', response.data);

            const recommendedMovieNames = response.choices[0].message.content.trim().split('\n').map(movie => movie.trim());
            console.log('Recommended movie names:', recommendedMovieNames);

            return recommendedMovieNames;
        } catch (error) {
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

    // Route to display the "For You" page
    router.get('/foryou', isAuthenticated, async (req, res) => {
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

            const favoriteGenres = user.favoriteGenres || [];
            const purchasedMovies = user.purchasedMovies || [];
            const purchasedMovieIds = purchasedMovies.map(movie => movie.toString());
            const reviews = user.reviews || {};

            console.log('User favorite genres:', favoriteGenres);
            console.log('User purchased movie IDs:', purchasedMovieIds);
            console.log('User reviews:', reviews);

            // Use stored movies from app locals
            const allMovies = req.app.locals.allMovies;
            console.log('All movies:', allMovies);

            // Use OpenAI API to get recommendations
            const recommendedMovieNames = await getRecommendations({ favoriteGenres, reviews }, allMovies);
            console.log('Recommended movie names:', recommendedMovieNames);

            // Filter the recommended movies from the full movie list
            const recommendedMovies = allMovies.filter(movie => recommendedMovieNames.includes(movie.name));
            console.log('Recommended movies:', recommendedMovies);

            res.render('foryou', {
                userName: req.session.userName,
                userIcon: req.session.userIcon,
                recommendedMovies,
                cart: req.session.cart || []
            });
        } catch (err) {
            console.error('Error fetching recommendations:', err);
            res.status(500).send('Internal Server Error');
        }
    });


    return router;
};