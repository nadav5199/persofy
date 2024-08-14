const express = require('express');
const {getUserByName, logActivity, getMoviesByIds, saveOrUpdateUser, setUser} = require("../DataBase/persist");


const router = express.Router();
router.get('/signin', (req, res) => {
    res.render('signin', {error: null, userName: req.session.userName, cart: req.session.cart || []});
});

router.get('/signup', (req, res) => {
    res.render('signup', {error: null, userName: req.session.userName, cart: req.session.cart || []});
});

router.post('/signin', async (req, res) => {
    const {name, password, rememberMe} = req.body;
    try {
        const user = await getUserByName(name);
        if (!user) {
            res.render('signin', {error: 'User doesn\'t exist', userName: null, cart: []});
        } else if (user.password !== password) {
            res.render('signin', {error: 'Incorrect password', userName: null, cart: []});
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
                req.session.cart = await getMoviesByIds(user.cart); // Store the movie objects in session.cart;

                await logActivity(user.name, 'login');

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
        res.render('signin', {error: 'An error occurred. Please try again.', userName: null, cart: []});
    }
});


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

                req.session.userId = user._id;
                req.session.userName = user.name;
                req.session.cart = [];
                res.redirect('/choose-icon');
            });
        }
    } catch (err) {
        console.error(err);
        res.render('signup', {error: 'An error occurred. Please try again.', userName: null, cart: []});
    }
});

router.post('/logout', async (req, res) => {
    await logActivity(req.session.userName, 'logout');

    const user = await getUserByName(req.session.userName);

    // Extract the movie IDs from the session's cart and save them to the user's cart in the database
    if (req.session.cart) {
        user.cart = req.session.cart.map(movie => movie._id);
    } else {
        user.cart = [];
    }

    await saveOrUpdateUser(user);

    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/signin');
    });
})
module.exports = router;
