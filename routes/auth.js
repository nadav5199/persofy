const express = require('express');
const { isAuthenticated } = require('../middleware/auth');
const Activity = require('../DataBase/models/Activity');

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
                req.session.regenerate(err => {
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
                    req.session.cart = req.session.cart || [];

                    const loginActivity = new Activity({ username: user.name, type: 'login' });
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

    router.post('/logout', (req, res) => {
        const logoutActivity = new Activity({ username: req.session.userName, type: 'logout' });
        logoutActivity.save();

        req.session.destroy(err => {
            if (err) {
                return res.redirect('/');
            }
            res.clearCookie('connect.sid');
            res.redirect('/signin');
        });
    });

    router.get('/choose-icon', isAuthenticated, (req, res) => {
        res.render('chooseIcon', { userName: req.session.userName, userIcon: req.session.userIcon, cart: req.session.cart || [] });
    });

    router.post('/choose-icon', isAuthenticated, async (req, res) => {
        const { icon } = req.body;
        const user = await UserModel.findById(req.session.userId);
        if (user) {
            user.icon = icon;
            await user.save();
            req.session.userIcon = icon;
        }
        res.redirect('/');
    });

    return router;
};
