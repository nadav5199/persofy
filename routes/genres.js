const express = require('express');
const mongoose = require('mongoose');
const Movie = require('../DataBase/models/Movie');

module.exports = function (userDb) {
    const router = express.Router();

    // Route to display the genres page
    router.get('/genres', async (req, res) => {
        try {
            // Fetch all unique genres from the movies database
            const genres = await Movie.distinct('tags');
            console.log('Fetched genres:', genres);

            res.render('genres', { genres });
        } catch (err) {
            console.error('Error fetching genres:', err);
            res.status(500).send('Internal Server Error');
        }
    });

    // Route to handle genres form submission
    router.post('/genres', async (req, res) => {
        const { favoriteGenres } = req.body; // Assuming favoriteGenres is an array of selected genres
        console.log('Selected favorite genres:', favoriteGenres);
        try {
            const userId = req.session.userId;
            console.log('Saving favorite genres for user ID:', userId);

            // Convert userId to ObjectId
            const objectId = new mongoose.Types.ObjectId(userId);

            const user = await userDb.model('User').findById(objectId);
            if (!user) {
                console.log('User not found with ID:', userId);
                return res.status(404).send('User not found');
            }

            user.favoriteGenres = favoriteGenres;

            await user.save();
            console.log('User favorite genres saved successfully');
            res.redirect('/'); // Redirect to the home page or any other page
        } catch (err) {
            console.error('Error saving favorite genres:', err);
            res.status(500).send('Internal Server Error');
        }
    });

    return router;
};
