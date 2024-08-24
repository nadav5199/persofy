/**
 * Movie store routes: Fetch and display movies, handle search, sort, and payment processes
 *
 * Dependencies:
 * - express: Web framework
 * - DataBase/persist: Custom database persistence methods for movie and user data, and logging activity
 * - middleware/auth: Custom authentication middleware to ensure users are authenticated
 */
const express = require('express');
const {isAuthenticated} = require('../middleware/auth');
const {getAllMovies, getMovieById, saveOrUpdateUser, logActivity, getUserById} = require('../DataBase/persist');

const router = express.Router();

// Route to display the movie store, handling sorting, searching, and filtering by genre
router.get('/', async (req, res) => {
    const {sort, search, genre} = req.query;
    let query = {};
    let sortOption = {};

    // Apply search query for movie name (case-insensitive)
    if (search) {
        query.name = {$regex: search, $options: 'i'};
    }

    // Apply genre filter
    if (genre) {
        query.tags = genre;
    }

    // Apply sorting based on query parameters
    if (sort === 'name') {
        sortOption.name = 1; // Sort by name ascending
    } else if (sort === 'rating') {
        sortOption.rating = -1; // Sort by rating descending
    } else if (sort === 'date') {
        sortOption.date = -1; // Sort by release date descending
    }

    // Fetch all movies based on search, genre, and sort criteria
    const movies = await getAllMovies(query, sortOption);

    // Render the store page with movies and user information
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

// Route to display details for a specific movie by its ID
router.get('/movie/:id', async (req, res) => {
    try {
        // Fetch the movie by ID from the database
        const movie = await getMovieById(req.params.id);

        if (!movie) {
            return res.status(404).send('Movie not found');
        }

        // Render the movie details page with movie and user information
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

// Route to handle completing a payment for the movies in the cart
router.post('/complete-payment', isAuthenticated, async (req, res) => {
    try {
        const userId = req.cookies.userId;
        console.log('Completing payment for user ID:', userId);

        // Fetch the user by ID from the database
        const user = await getUserById(userId);
        if (!user) {
            console.log('User not found with ID:', userId);
            return res.status(404).send('User not found');
        }

        // Initialize the user's purchasedMovies array if it doesn't exist
        user.purchasedMovies = user.purchasedMovies || [];

        // Get the list of movies from the user's cart
        const cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
        const movieIds = cart.map(movie => movie._id.toString());

        console.log('Movies in cart:', cart);
        console.log('Movie IDs to add:', movieIds);

        // Add the movies from the cart to the user's purchasedMovies if not already present
        movieIds.forEach(id => {
            if (!user.purchasedMovies.includes(id)) {
                user.purchasedMovies.push(id);
            }
        });

        console.log('Updated purchasedMovies:', user.purchasedMovies);

        // Save the updated user data in the database
        await saveOrUpdateUser(user);
        console.log('User saved successfully');

        // Store recently purchased movie IDs in a cookie for later use
        res.cookie('recentlyPurchasedMovies', JSON.stringify(movieIds), { httpOnly: true });
        res.clearCookie('cart');

        // Log the purchase activity
        await logActivity(user.name, 'purchase');

        // Redirect to the review page after completing the purchase
        res.redirect('/review');
    } catch (err) {
        console.error('Error during payment:', err);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
