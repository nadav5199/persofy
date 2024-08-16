/**
 * Admin routes: Manage movies and user activities in the system
 * Provides routes for movie management (CRUD operations) and viewing user activities for admins.
 *
 * Dependencies:
 * - express: Web framework
 * - DataBase/persist: Custom database persistence methods for movie data, user activity, and admin tasks
 * - middleware/auth: Custom authentication middleware to ensure users are authenticated and authorized as admins
 */
const express = require('express');
const {isAuthenticated, isAdmin} = require('../middleware/auth');
const {getAllMovies, saveMovie, updateMovieById, deleteMovieById, getActivity} = require("../DataBase/persist");

const router = express.Router();

// Route to display the admin movie management page
// Allows sorting and searching for movies
router.get('/admin/movies', isAuthenticated, isAdmin, async (req, res) => {
    const {sort, search} = req.query;
    let query = {};
    let sortOption = {};

    // Apply case-insensitive search query for movie names
    if (search) {
        query.name = {$regex: search, $options: 'i'};
    }

    // Apply sorting options for movie name, rating, or release date
    if (sort === 'name') {
        sortOption.name = 1; // Sort by name ascending
    } else if (sort === 'rating') {
        sortOption.rating = -1; // Sort by rating descending
    } else if (sort === 'date') {
        sortOption.releaseDate = -1; // Sort by release date descending
    }

    // Fetch all movies based on search and sort criteria
    const movies = await getAllMovies(query, sortOption);

    // Render the admin movie management page with movie data and user information
    res.render('editStore', {
        movies,
        sort,
        search,
        userName: req.cookies.userName,
        userIcon: req.cookies.userIcon,
        cart: req.cookies.cart ? JSON.parse(req.cookies.cart) : []
    });
});

// Route to add a new movie to the database
router.post('/admin/movies', isAuthenticated, isAdmin, async (req, res) => {
    const {name, description, director, actors, rating, posterUrl, trailerUrl, tags} = req.body;

    // Convert actors and tags from comma-separated strings to arrays
    const actorsArray = actors ? actors.split(',').map(actor => actor.trim()) : [];
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

    // Save the new movie to the database
    await saveMovie({
        name,
        description,
        director,
        actors: actorsArray,
        rating,
        posterUrl,
        trailerUrl,
        tags: tagsArray
    });

    // Redirect back to the movie management page after adding the movie
    res.redirect('/admin/movies');
});

// Route to update an existing movie in the database
router.put('/admin/movies/:id', isAuthenticated, isAdmin, async (req, res) => {
    const {name, description, director, actors, rating, posterUrl, trailerUrl, tags} = req.body;

    // Convert actors and tags from comma-separated strings to arrays
    const actorsArray = actors ? actors.split(',').map(actor => actor.trim()) : [];
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

    // Update the movie by ID in the database
    await updateMovieById(req.params.id, {
        name,
        description,
        director,
        actors: actorsArray,
        rating,
        posterUrl,
        trailerUrl,
        tags: tagsArray
    });

    // Redirect back to the movie management page after updating the movie
    res.redirect('/admin/movies');
});

// Route to delete a movie from the database
router.delete('/admin/movies/:id', isAuthenticated, isAdmin, async (req, res) => {
    // Delete the movie by ID
    await deleteMovieById(req.params.id);

    // Redirect back to the movie management page after deleting the movie
    res.redirect('/admin/movies');
});

// Route to display user activity logs for the admin
// Allows searching for activities by username
router.get('/admin/activity', isAuthenticated, isAdmin, async (req, res) => {
    const {username} = req.query;
    let query = {};

    // Apply case-insensitive search query for usernames
    if (username) {
        query.username = {$regex: '^' + username, $options: 'i'}; // Prefix match
    }

    // Fetch user activities based on the search query
    const activities = await getActivity(query);

    // Render the admin activity page with activity logs and user information
    res.render('adminActivity', {
        activities,
        userName: req.cookies.userName,
        userIcon: req.cookies.userIcon,
        cart: req.cookies.cart ? JSON.parse(req.cookies.cart) : []
    });
});

module.exports = router;
