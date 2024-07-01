const express = require('express');
const path = require('path');
const Movie = require('./DataBase/models/Movie');
const mongoose = require('mongoose');
const app = express();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Serve static files from the "public" directory
app.use(express.static('public'));


mongoose.connect('mongodb://127.0.0.1:27017/movies');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});


app.get('/', async (req, res) => {
    try {
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
        res.render('store', { movies, sort, search });
    } catch (err) {
        console.error('Error fetching movies:', err);
        res.status(500).send('Internal Server Error');
    }
});


// Route for individual movie pages
app.get('/movie/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).send('Movie not found');
        }
        res.render('movies', { movie });
    } catch (err) {
        console.error('Error fetching movie:', err);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/', (req, res) => {
    res.send('Welcome to the fullstack app!');
})
app.listen(3000, () => {
    console.log('Server is running on port 3000')
});
