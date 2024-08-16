/**
 * Authentication routes: Sign in, Sign up, Logout
 * Handles user session and cookies for persistence.
 *
 * Dependencies:
 * - express: Web framework
 * - DataBase/persist: Custom database persistence methods for user data
 *
 * This module defines routes for signing in, signing up, and logging out.
 */
const express = require('express');
const {getUserByName, logActivity, getMoviesByIds, saveOrUpdateUser, setUser} = require("../DataBase/persist");

const router = express.Router();

// Render the Sign In page
router.get('/signin', (req, res) => {
    res.render('signin', {error: null, userName: req.cookies.userName, cart: req.cookies.cart ? JSON.parse(req.cookies.cart) : []});
});

// Render the Sign Up page
router.get('/signup', (req, res) => {
    res.render('signup', {error: null, userName: req.cookies.userName, cart: req.cookies.cart ? JSON.parse(req.cookies.cart) : []});
});

// Handle user sign-in with username and password
router.post('/signin', async (req, res) => {
    const {name, password, rememberMe} = req.body;
    try {
        const user = await getUserByName(name);
        if (!user) {
            res.render('signin', {error: 'User doesn\'t exist', userName: null, cart: []});
        } else if (user.password !== password) {
            res.render('signin', {error: 'Incorrect password', userName: null, cart: []});
        } else {
            // Regenerate session and set cookies for user details
            req.session.regenerate(async err => {
                if (err) {
                    console.error(err);
                    return res.render('signin', {
                        error: 'An error occurred. Please try again.',
                        userName: null,
                        cart: []
                    });
                }

                res.cookie('userId', user._id.toString(), { maxAge: rememberMe ? 10 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000, httpOnly: true });
                res.cookie('userName', user.name, { maxAge: rememberMe ? 10 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000, httpOnly: true });
                res.cookie('userIcon', user.icon, { maxAge: rememberMe ? 10 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000, httpOnly: true });

                const cart = await getMoviesByIds(user.cart);
                res.cookie('cart', JSON.stringify(cart), { maxAge: rememberMe ? 10 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000, httpOnly: true });

                await logActivity(user.name, 'login');
                res.redirect('/');
            });
        }
    } catch (err) {
        console.error(err);
        res.render('signin', {error: 'An error occurred. Please try again.', userName: null, cart: []});
    }
});

// Handle user sign-up with username, email, and password
router.post('/signup', async (req, res) => {
    const {name, email, password} = req.body;
    try {
        const existingUser = await getUserByName(name);
        if (existingUser) {
            res.render('signup', {error: 'User already exists', userName: null, cart: []});
        } else {
            const user = await setUser(name, email, password);

            req.session.regenerate(err => {
                if (err) {
                    console.error(err);
                    return res.render('signup', {
                        error: 'An error occurred. Please try again.',
                        userName: null,
                        cart: []
                    });
                }

                res.cookie('userId', user._id.toString(), { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
                res.cookie('userName', user.name, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
                res.cookie('cart', JSON.stringify([]), { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });

                res.redirect('/choose-icon');
            });
        }
    } catch (err) {
        console.error(err);
        res.render('signup', {error: 'An error occurred. Please try again.', userName: null, cart: []});
    }
});

// Handle user logout and clear session cookies
router.post('/logout', async (req, res) => {
    await logActivity(req.cookies.userName, 'logout');

    const user = await getUserByName(req.cookies.userName);

    if (req.cookies.cart) {
        user.cart = JSON.parse(req.cookies.cart).map(movie => movie._id);
    } else {
        user.cart = [];
    }

    await saveOrUpdateUser(user);

    // Clear cookies upon logout
    res.clearCookie('userId');
    res.clearCookie('userName');
    res.clearCookie('userIcon');
    res.clearCookie('cart');
    res.clearCookie('recentlyPurchasedMovies');
    res.redirect('/signin');
})

module.exports = router;
