const express = require('express');
const mongoose = require('mongoose');
const { isAuthenticated } = require('../middleware/auth');
const Movie = require('../DataBase/models/Movie');
const Activity = require('../DataBase/models/Activity');

module.exports = function (userDb) {
    const router = express.Router();

    // Use the userDb connection to get the User model
    const User = userDb.model('User');

    // Route to get all movies
    router.get('/', async (req, res) => {
        const { sort, search, genre } = req.query;
        let query = {};
        let sortOption = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' }; // Case-insensitive search
        }

        if (genre) {
            query.tags = genre;
        }

        if (sort === 'name') {
            sortOption.name = 1;
        } else if (sort === 'rating') {
            sortOption.rating = -1;
        } else if (sort === 'date') {
            sortOption.date = -1; // Assuming you have a releaseDate field
        }

        const movies = await Movie.find(query).sort(sortOption);
        res.render('store', { movies, sort, search, genre, userName: req.session.userName, userIcon: req.session.userIcon, cart: req.session.cart || [] });
    });

    // Route to get a specific movie by ID
    router.get('/movie/:id', async (req, res) => {
        try {
            const movie = await Movie.findById(req.params.id);
            if (!movie) {
                return res.status(404).send('Movie not found');
            }
            res.render('movies', { userIcon: req.session.userIcon, movie, userName: req.session.userName, cart: req.session.cart || [] });
        } catch (err) {
            console.error('Error fetching movie:', err);
            res.status(500).send('Internal Server Error');
        }
    });

    // Route to render the payment page
    router.get('/payment', isAuthenticated, (req, res) => {
        res.render('payment', { userIcon: req.session.userIcon, cart: req.session.cart || [], userName: req.session.userName });
    });

    // Route to handle completing payment
    router.post('/complete-payment', isAuthenticated, async (req, res) => {
        try {
            const userId = req.session.userId;
            console.log('Completing payment for user ID:', userId);

            // Convert userId to ObjectId
            const objectId = new mongoose.Types.ObjectId(userId);

            const user = await User.findById(objectId);
            if (!user) {
                console.log('User not found with ID:', userId);
                return res.status(404).send('User not found');
            }

            user.purchasedMovies = user.purchasedMovies || [];

            const movieIds = req.session.cart.map(movie => movie._id.toString());
            console.log('Movies in cart:', req.session.cart);
            console.log('Movie IDs to add:', movieIds);

            movieIds.forEach(id => {
                if (!user.purchasedMovies.includes(id)) {
                    user.purchasedMovies.push(id);
                }
            });

            console.log('Updated purchasedMovies:', user.purchasedMovies);

            await user.save();

            console.log('User saved successfully');

            // Store recently purchased movie IDs in session
            req.session.recentlyPurchasedMovies = movieIds;
            req.session.cart = [];

            const purchaseActivity = new Activity({ username: user.name, type: 'purchase', datetime: new Date() });
            await purchaseActivity.save();

            res.redirect('/review');
        } catch (err) {
            console.error('Error during payment:', err);
            res.status(500).send('Internal Server Error');
        }
    });

    return router;
};
