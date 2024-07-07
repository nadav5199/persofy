const express = require('express');
const Movie = require('../DataBase/models/Movie');
const { isAuthenticated } = require('../middleware/auth');
const Activity = require('../DataBase/models/Activity');
const User = require('../DataBase/models/User'); // Ensure this import is here

const router = express.Router();

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
        sortOption.releaseDate = -1; // Assuming you have a releaseDate field
    }

    const movies = await Movie.find(query).sort(sortOption);
    res.render('store', { movies, sort, search, genre, userName: req.session.userName, userIcon: req.session.userIcon, cart: req.session.cart || [] });
});

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

router.get('/payment', isAuthenticated, (req, res) => {
    res.render('payment', { userIcon: req.session.userIcon, cart: req.session.cart || [], userName: req.session.userName });
});

router.post('/complete-payment', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId); // Ensure correct User model is used
        if (user) {
            user.purchasedMovies.push(...req.session.cart.map(movie => movie._id));
            await user.save();

            const purchaseActivity = new Activity({ username: user.name, type: 'purchase', datetime: new Date() });
            await purchaseActivity.save();
        }
        req.session.cart = [];
        res.redirect('/');
    } catch (err) {
        console.error('Error during payment:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
