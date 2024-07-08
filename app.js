const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const session = require('./config/session');
const { connectMoviesDb, connectUsersDb } = require('./config/database');

const app = express();

// Set view engine and static files directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(session);

// Database connections
connectMoviesDb();
const userDb = connectUsersDb();

// Make the userDb and movieDb connections accessible to other modules
app.set('userDb', userDb);




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


app.use(reviewRoutes);
app.use(authRoutes);
app.use(cartRoutes);
app.use(movieRoutes);
app.use(adminRoutes);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
