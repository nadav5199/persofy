const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const Movie = require('../DataBase/models/Movie');
const Activity = require('../DataBase/models/Activity');

const router = express.Router();

router.post('/cart/add', isAuthenticated, async (req, res) => {
    const { movieId } = req.body;
    if (!req.session.cart) {
        req.session.cart = [];
    }
    const movie = await Movie.findById(movieId);
    if (movie) {
        req.session.cart.push(movie);

        const addToCartActivity = new Activity({ username: req.session.userName, type: 'add-to-cart' });
        addToCartActivity.save();
    }
    res.redirect('/');
});

router.post('/cart/remove', isAuthenticated, (req, res) => {
    const { movieId } = req.body;
    req.session.cart = req.session.cart.filter(movie => movie._id.toString() !== movieId);
    res.redirect('/');
});

module.exports = router;
