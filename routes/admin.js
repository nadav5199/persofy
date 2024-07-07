const express = require('express');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const Movie = require('../DataBase/models/Movie');
const Activity = require('../DataBase/models/Activity');

/**
 * Defines admin routes.
 * @param {mongoose.Connection} userDb - The users database connection.
 * @returns {Router} Express router.
 */
module.exports = function (userDb) {
    const router = express.Router();

    router.get('/admin/movies', isAuthenticated, isAdmin, async (req, res) => {
        const { sort, search } = req.query;
        let query = {};
        let sortOption = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' }; // Case-insensitive search
        }

        if (sort === 'name') {
            sortOption.name = 1;
        } else if (sort === 'rating') {
            sortOption.rating = -1;
        } else if (sort === 'date') {
            sortOption.releaseDate = -1; // Assuming you have a releaseDate field
        }

        const movies = await Movie.find(query).sort(sortOption);
        res.render('editStore', { movies, sort, search, userName: req.session.userName, userIcon: req.session.userIcon, cart: req.session.cart || [] });
    });


    router.post('/admin/movies', isAuthenticated, isAdmin, async (req, res) => {
        const { name, description, director, actors, rating, posterUrl, trailerUrl, tags } = req.body;

        const actorsArray = actors ? actors.split(',').map(actor => actor.trim()) : [];
        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

        const movie = new Movie({
            name,
            description,
            director,
            actors: actorsArray,
            rating,
            posterUrl,
            trailerUrl,
            tags: tagsArray
        });
        await movie.save();
        res.redirect('/admin/movies');
    });

    router.put('/admin/movies/:id', isAuthenticated, isAdmin, async (req, res) => {
        const { name, description, director, actors, rating, posterUrl, trailerUrl, tags } = req.body;

        const actorsArray = actors ? actors.split(',').map(actor => actor.trim()) : [];
        const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

        await Movie.findByIdAndUpdate(req.params.id, {
            name,
            description,
            director,
            actors: actorsArray,
            rating,
            posterUrl,
            trailerUrl,
            tags: tagsArray
        });
        res.redirect('/admin/movies');
    });

    router.delete('/admin/movies/:id', isAuthenticated, isAdmin, async (req, res) => {
        await Movie.findByIdAndDelete(req.params.id);
        res.redirect('/admin/movies');
    });

    router.get('/admin/activity', isAuthenticated, isAdmin, async (req, res) => {
        const { username } = req.query;
        let query = {};

        if (username) {
            query.username = { $regex: '^' + username, $options: 'i' }; // Case-insensitive prefix match
        }

        const activities = await Activity.find(query).sort({ datetime: -1 });
        res.render('adminActivity', { activities, userName: req.session.userName, userIcon: req.session.userIcon, cart: req.session.cart || [] });
    });

    return router;
};
