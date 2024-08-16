/**
 * Application Entry Point:
 * Initializes the Express app, sets up middleware, database connections, routes, and security features.
 *
 * Dependencies:
 * - express: Web framework
 * - dotenv: Environment variable manager
 * - middleware: Security, session management, and route handling
 * - config/database: Database connection methods for movies and users
 */

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const session = require('./config/session');
const {connectMoviesDb, connectUsersDb} = require('./config/database');
const securityMiddleware = require('./middleware/security');
const app = express();

require('dotenv').config();

// Set up view engine and static file directory
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Apply security middleware for security headers, XSS, rate limiting, etc.
securityMiddleware(app);

// Parse JSON and URL-encoded form data
app.use(bodyParser.json({limit: '10kb'}));
app.use(bodyParser.urlencoded({extended: true, limit: '10kb'}));
app.use(methodOverride('_method')); // Enable method override for form submissions
app.use(session);
app.use(cookieParser());

// Connect to databases
connectMoviesDb();
const userDb = connectUsersDb();
app.set('userDb', userDb); // Store userDb in app locals

// Temporary middleware for logging session data (for development purposes)
app.use((req, res, next) => {
    console.log('Session Data:', req.session);
    next();
});

// Import routes
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const movieRoutes = require('./routes/movies');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/reviews');
const genreRoutes = require('./routes/genres');
const recommendationRoutes = require('./routes/recommendations');
const chooseIconRoutes = require('./routes/chooseIcon');

// Use routes
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

// Start the server
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
