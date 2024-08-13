const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('./config/session');
const {connectMoviesDb, connectUsersDb} = require('./config/database');
const Movie = require('./DataBase/models/Movie');
const securityMiddleware = require('./middleware/security');
const app = express();

require('dotenv').config();

// Set view engine and static files directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Apply Security Middleware
securityMiddleware(app);

// Middleware setup
app.use(bodyParser.json({limit: '10kb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '10kb'}));
app.use(methodOverride('_method'));
app.use(session);

// Database connections
connectMoviesDb();
const userDb = connectUsersDb();

// Make the userDb and movieDb connections accessible to other modules
app.set('userDb', userDb);

Movie.find().then(movies => {
    app.locals.allMovies = movies;
}).catch(err => {
    console.error('Error fetching movies:', err);
});

// Remove this in production
app.use((req, res, next) => {
    console.log('Session Data:', req.session);
    next();
});

// Routes
const authRoutes = require('./routes/auth')(userDb);
const cartRoutes = require('./routes/cart');
const movieRoutes = require('./routes/movies')(userDb);
const adminRoutes = require('./routes/admin')(userDb);
const reviewRoutes = require('./routes/reviews')(userDb);
const genreRoutes = require('./routes/genres')(userDb);
const recommendationRoutes = require('./routes/recommendations')(userDb);
const chooseIconRoutes = require('./routes/chooseIcon')(userDb);

app.use(genreRoutes);
app.use(reviewRoutes);
app.use(authRoutes);
app.use(cartRoutes);
app.use(movieRoutes);
app.use(adminRoutes);
app.use(recommendationRoutes);
app.use(chooseIconRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
