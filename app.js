const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('./config/session');
const { connectMoviesDb, connectUsersDb } = require('./config/database');
const Movie = require('./DataBase/models/Movie');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const app = express();

require('dotenv').config();

// Set view engine and static files directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
            styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://stackpath.bootstrapcdn.com'],
            imgSrc: ["'self'", 'data:', 'https:'],
            mediaSrc: ["'self'", 'https:'],
            frameSrc: ["'self'", 'https:'],
        },
    },
    crossOriginEmbedderPolicy: false,
}));
app.use(xss());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middleware setup
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10kb' }));
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

app.use(genreRoutes);
app.use(reviewRoutes);
app.use(authRoutes);
app.use(cartRoutes);
app.use(movieRoutes);
app.use(adminRoutes);
app.use(recommendationRoutes);

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});