const express = require('express');
const {isAuthenticated} = require('../middleware/auth');
const {getMovieById, logActivity} = require("../DataBase/persist");

const router = express.Router();

router.post('/cart/add', isAuthenticated, async (req, res) => {
    const {movieId} = req.body;
    let cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
    const movie = await getMovieById(movieId);
    if (movie) {
        cart.push(movie);
        res.cookie('cart', JSON.stringify(cart), {httpOnly: true});
        await logActivity(req.cookies.userName, 'add-to-cart');
    }
    res.redirect('/');
});

router.post('/cart/remove', isAuthenticated, (req, res) => {
    const {movieId} = req.body;
    let cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
    cart = cart.filter(movie => movie._id.toString() !== movieId);
    res.cookie('cart', JSON.stringify(cart), {maxAge: 24 * 60 * 60 * 1000, httpOnly: true});
    res.redirect('/');
});

module.exports = router;
