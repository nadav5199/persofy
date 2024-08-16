/**
 * Genre selection routes: Allows users to choose their favorite genres
 * Displays available genres and saves user preferences in the database.
 *
 * Dependencies:
 * - express: Web framework
 * - mongoose: MongoDB object modeling tool
 * - DataBase/persist: Custom database persistence methods for fetching tags and user data
 */
const express = require('express');
const mongoose = require('mongoose');
const {getTags, getUserById, saveOrUpdateUser} = require("../DataBase/persist");

const router = express.Router();

// Route to display the genres page, fetching all unique genres from the database
router.get('/genres', async (req, res) => {
    try {
        // Fetch all genres (tags) from the database
        const genres = await getTags();
        console.log('Fetched genres:', genres);

        // Render the genres page with available genres and user info
        res.render('genres', {
            userIcon: req.cookies.userIcon,
            userName: req.cookies.userName,
            cart: req.cookies.cart ? JSON.parse(req.cookies.cart) : [],
            genres
        });
    } catch (err) {
        console.error('Error fetching genres:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to handle the form submission for selecting favorite genres
router.post('/genres', async (req, res) => {
    const {favoriteGenres} = req.body; // Assuming favoriteGenres is an array of selected genres
    console.log('Selected favorite genres:', favoriteGenres);
    try {
        const userId = req.cookies.userId;
        console.log('Saving favorite genres for user ID:', userId);

        // Convert the user ID from string to a MongoDB ObjectId
        const objectId = new mongoose.Types.ObjectId(userId);

        // Fetch the user from the database
        const user = await getUserById(objectId);
        if (!user) {
            console.log('User not found with ID:', userId);
            return res.status(404).send('User not found');
        }

        // Save the user's selected favorite genres
        user.favoriteGenres = favoriteGenres;
        await saveOrUpdateUser(user);

        console.log('User favorite genres saved successfully');
        res.redirect('/'); // Redirect to the home page or another appropriate page
    } catch (err) {
        console.error('Error saving favorite genres:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
