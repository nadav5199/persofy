const express = require('express');
const {isAuthenticated} = require('../middleware/auth');
const {getAllMovies, getMovieById, saveOrUpdateUser, logActivity, getUserById} = require('../DataBase/persist');

const router = express.Router();

// Route to get all movies
router.get('/', async (req, res) => {
    const {sort, search, genre} = req.query;
    let query = {};
    let sortOption = {};

    if (search) {
        query.name = {$regex: search, $options: 'i'}; // Case-insensitive search
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

    const movies = await getAllMovies(query, sortOption);
    res.render('store', {
        movies,
        sort,
        search,
        genre,
        userName: req.cookies.userName,
        userIcon: req.cookies.userIcon,
        cart: req.cookies.cart ? JSON.parse(req.cookies.cart) : []
    });
});

// Route to get a specific movie by ID
router.get('/movie/:id', async (req, res) => {
    try {
        const movie = await getMovieById(req.params.id);
        if (!movie) {
            return res.status(404).send('Movie not found');
        }
        res.render('movies', {
            userIcon: req.cookies.userIcon,
            movie,
            userName: req.cookies.userName,
            cart: req.cookies.cart ? JSON.parse(req.cookies.cart) : []
        });
    } catch (err) {
        console.error('Error fetching movie:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Route to render the payment page
router.get('/payment', isAuthenticated, (req, res) => {
    res.render('payment', {
        userIcon: req.cookies.userIcon,
        cart: req.cookies.cart ? JSON.parse(req.cookies.cart) : [],
        userName: req.cookies.userName
    });
});

// Route to handle completing payment
router.post('/complete-payment', isAuthenticated, async (req, res) => {
    try {
        const userId = req.cookies.userId;
        console.log('Completing payment for user ID:', userId);

        const user = await getUserById(userId);
        if (!user) {
            console.log('User not found with ID:', userId);
            return res.status(404).send('User not found');
        }

        user.purchasedMovies = user.purchasedMovies || [];

        const cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
        const movieIds = cart.map(movie => movie._id.toString());
        console.log('Movies in cart:', cart);
        console.log('Movie IDs to add:', movieIds);

        movieIds.forEach(id => {
            if (!user.purchasedMovies.includes(id)) {
                user.purchasedMovies.push(id);
            }
        });

        console.log('Updated purchasedMovies:', user.purchasedMovies);

        await saveOrUpdateUser(user);

        console.log('User saved successfully');

        // Store recently purchased movie IDs in a cookie
        res.cookie('recentlyPurchasedMovies', JSON.stringify(movieIds), { httpOnly: true });
        res.clearCookie('cart');
        await logActivity(user.name, 'purchase');

        res.redirect('/review');
    } catch (err) {
        console.error('Error during payment:', err);
        res.status(500).send('Internal Server Error');
    }
})

module.exports = router;
