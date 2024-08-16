/**
 * Cart routes: Add and remove movies to/from the shopping cart
 * Handles user interactions with the shopping cart, storing cart data in cookies.
 *
 * Dependencies:
 * - express: Web framework
 * - DataBase/persist: Custom database persistence methods for movie data and user activity logging
 * - middleware/auth: Custom authentication middleware to ensure users are authenticated
 */
const express = require('express');
const {isAuthenticated} = require('../middleware/auth');
const {getMovieById, logActivity} = require("../DataBase/persist");

const router = express.Router();

// Route to add a movie to the user's cart
router.post('/cart/add', isAuthenticated, async (req, res) => {
    const {movieId} = req.body;

    // Retrieve the current cart from cookies, or initialize an empty cart if not found
    let cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];

    // Fetch movie details by ID from the database
    const movie = await getMovieById(movieId);

    if (movie) {
        // Add the movie to the cart and update the cookie
        cart.push(movie);
        res.cookie('cart', JSON.stringify(cart), {httpOnly: true});

        // Log user activity
        await logActivity(req.cookies.userName, 'add-to-cart');
    }

    // Redirect back to the home page
    res.redirect('/');
});

// Route to remove a movie from the user's cart
router.post('/cart/remove', isAuthenticated, (req, res) => {
    const {movieId} = req.body;

    // Retrieve the current cart from cookies
    let cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];

    // Filter out the movie to be removed
    cart = cart.filter(movie => movie._id.toString() !== movieId);

    // Update the cookie with the new cart
    res.cookie('cart', JSON.stringify(cart), {maxAge: 24 * 60 * 60 * 1000, httpOnly: true});

    // Redirect back to the home page
    res.redirect('/');
});

module.exports = router;
