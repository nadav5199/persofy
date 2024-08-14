const express = require('express');
const {isAuthenticated} = require('../middleware/auth');
const {getMovieById, logActivity} = require("../DataBase/persist");

const router = express.Router();

router.post('/cart/add', isAuthenticated, async (req, res) => {
    const {movieId} = req.body;
    if (!req.session.cart) {
        req.session.cart = [];
    }
    const movie = await getMovieById(movieId);
    if (movie) {
        req.session.cart.push(movie);

        await logActivity(req.session.userName, 'add-to-cart');
    }
    res.redirect('/');
});

router.post('/cart/remove', isAuthenticated, (req, res) => {
    const {movieId} = req.body;
    req.session.cart = req.session.cart.filter(movie => movie._id.toString() !== movieId);
    res.redirect('/');
});

module.exports = router;
