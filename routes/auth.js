const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const Activity = require('../DataBase/models/Activity');
const Movie = require('../DataBase/models/Movie');
const fs = require('fs');
const path = require('path');

/**
 * Defines authentication routes.
 * @param {mongoose.Connection} userDb - The users database connection.
 * @returns {Router} Express router.
 */

const router = express.Router();
module.exports = function (userDb) {
    const UserModel = userDb.model('User', require('../DataBase/models/User').schema);

    router.get('/signin', (req, res) => {
        res.render('signin', { error: null, userName: req.session.userName, cart: req.session.cart || [] });
    });

    router.get('/signup', (req, res) => {
        res.render('signup', { error: null, userName: req.session.userName, cart: req.session.cart || [] });
    });

    router.post('/signin', async (req, res) => {
        const { name, password, rememberMe } = req.body;
        try {
            const user = await UserModel.findOne({ name });
            if (!user) {
                res.render('signin', { error: 'User doesn\'t exist', userName: null, cart: [] });
            } else if (user.password !== password) {
                res.render('signin', { error: 'Incorrect password', userName: null, cart: [] });
            } else {
                req.session.regenerate(async err => {
                    if (err) {
                        console.error(err);
                        return res.render('signin', {
                            error: 'An error occurred. Please try again.',
                            userName: null,
                            cart: []
                        });
                    }

                    req.session.userId = user._id; // Ensure userId is set in session
                    req.session.userName = user.name;
                    req.session.userIcon = user.icon;
                    // Fetch movie objects based on movie IDs in user's cart
                    req.session.cart = await Movie.find({_id: {$in: user.cart}}); // Store the movie objects in session.cart;

                    const loginActivity = new Activity({username: user.name, type: 'login'});
                    loginActivity.save();

                    if (rememberMe) {
                        req.session.cookie.maxAge = 10 * 24 * 60 * 60 * 1000; // 10 days
                    } else {
                        req.session.cookie.maxAge = 30 * 60 * 1000; // 30 minutes
                    }
                    res.redirect('/');
                });
            }
        } catch (err) {
            console.error(err);
            res.render('signin', { error: 'An error occurred. Please try again.', userName: null, cart: [] });
        }
    });


    router.post('/signup', async (req, res) => {
        const { name, email, password } = req.body;
        try {
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                res.render('signup', { error: 'User already exists', userName: null, cart: [] });
            } else {
                const user = new UserModel({ name, email, password });
                await user.save();
                req.session.regenerate(err => {
                    if (err) {
                        console.error(err);
                        return res.render('signup', {
                            error: 'An error occurred. Please try again.',
                            userName: null,
                            cart: []
                        });
                    }

                    req.session.userId = user._id;
                    req.session.userName = user.name;
                    req.session.cart = [];
                    res.redirect('/choose-icon');
                });
            }
        } catch (err) {
            console.error(err);
            res.render('signup', { error: 'An error occurred. Please try again.', userName: null, cart: [] });
        }
    });

    router.post('/logout', async (req, res) => {
        const logoutActivity = new Activity({username: req.session.userName, type: 'logout'});
        logoutActivity.save();

        const user = await UserModel.findOne({name: req.session.userName});

        // Extract the movie IDs from the session's cart and save them to the user's cart in the database
        if (req.session.cart) {
            user.cart = req.session.cart.map(movie => movie._id);
        } else {
            user.cart = [];
        }

        await user.save();

        req.session.destroy(err => {
            if (err) {
                return res.redirect('/');
            }
            res.clearCookie('connect.sid');
            res.redirect('/signin');
        });
    });

    router.get('/choose-icon', isAuthenticated, (req, res) => {
        const iconsDirectory = path.join(__dirname, '../public/icons');

        fs.readdir(iconsDirectory, (err, files) => {
            if (err) {
                console.error("Could not list the directory.", err);
                res.status(500).send("Server Error");
            } else {
                const images = files.filter(file => file.endsWith('.jpg') || file.endsWith('.jpeg'));
                res.render('chooseIcon', {
                    userName: req.session.userName,
                    userIcon: req.session.userIcon,
                    cart: req.session.cart || [],
                    images: images
                });
            }
        });
    });

    router.post('/choose-icon', isAuthenticated, async (req, res) => {
        const { icon } = req.body;
        const user = await UserModel.findById(req.session.userId);
        if (user) {
            user.icon = icon;
            await user.save();
            req.session.userIcon = icon;
        }
        res.redirect('/genres'); // Redirect to the genres selection page after sign-up
    });

    return router;
};
