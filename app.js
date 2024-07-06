const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');


const session = require('express-session');
const Movie = require('./DataBase/models/Movie');
const User = require('./DataBase/models/User'); // Include the User model
const Activity = require('./DataBase/models/Activity');

const app = express();


const methodOverride = require('method-override');
app.use(methodOverride('_method'));


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
}));

// Connect to movies database
mongoose.connect('mongodb://127.0.0.1:27017/movies');

const movieDb = mongoose.connection;
movieDb.on('error', console.error.bind(console, 'connection error:'));
movieDb.once('open', () => {
    console.log('Movies database connected');
});

// Create a new connection for the user database
const userDb = mongoose.createConnection('mongodb://127.0.0.1:27017/users');

userDb.on('error', console.error.bind(console, 'connection error:'));
userDb.once('open', async () => {
    console.log('Users database connected');

    try {
        const existingAdmin = await User.findOne({ name: 'admin' });
        if (!existingAdmin) {
            const adminUser = new User({ name: 'admin', password: 'admin' , email: 'admin@admin.com' });
            await adminUser.save();
            console.log('Admin user created');
        } else {
            console.log('Admin user already exists');
        }
    } catch (err) {
        console.error('Error creating admin user:', err);
    }
});

// Use the userDb connection for the User model
const UserModel = userDb.model('User', User.schema);


// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    } else {
        res.redirect('/signin');
    }
}

// Middleware to check if the user is an admin
function isAdmin(req, res, next) {
    if (req.session.userName === 'admin') {
        return next();
    } else {
        res.status(403).send('Access denied');
    }
}

// Sign-in and Sign-up routes
app.get('/signin', (req, res) => {
    const userName = req.session.userName; // Retrieve the user name from the session
    res.render('signin', { error: null, userName: req.session.userName, cart: req.session.cart || [] });
});

app.get('/signup', (req, res) => {
    const userName = req.session.userName; // Retrieve the user name from the session
    res.render('signup', { error: null, userName, cart: req.session.cart || [] });
});

app.post('/signin', async (req, res) => {
    const { name, password, rememberMe } = req.body;
    try {
        const user = await UserModel.findOne({ name });
        if (!user) {
            res.render('signin', { error: 'User doesn\'t exist', userName: null, cart: [] });
        } else if (user.password !== password) {
            res.render('signin', { error: 'Incorrect password', userName: null, cart: [] });
        } else {
            req.session.regenerate(err => {
                if (err) {
                    console.error(err);
                    return res.render('signin', { error: 'An error occurred. Please try again.', userName: null, cart: [] });
                }

                req.session.userId = user._id;
                req.session.userName = user.name;
                req.session.userIcon = user.icon; // Save the icon in the session
                req.session.cart = req.session.cart || [];

                // Log the login activity
                const loginActivity = new Activity({ username: user.name, type: 'login' });
                loginActivity.save();

                // Set cookie max age based on "Remember Me" checkbox
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
        res.render('signin', { error: 'An error occurred. Please try again.', userName: null, cart: [] });
    }
});

app.post('/choose-icon', isAuthenticated, async (req, res) => {
    const { icon } = req.body;
    const user = await UserModel.findById(req.session.userId);
    if (user) {
        user.icon = icon;
        await user.save();
        req.session.userIcon = icon; // Save the icon in the session
    }
    res.redirect('/');
});




app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            res.render('signup', { error: 'User already exists', userName: null, cart: [] });
        } else {
            const user = new UserModel({ name, email, password });
            await user.save();
            req.session.regenerate(err => {
                if (err) {
                    console.error(err);
                    return res.render('signup', { error: 'An error occurred. Please try again.', userName: null, cart: [] });
                }

                req.session.userId = user._id;
                req.session.userName = user.name;
                req.session.cart = [];
                res.redirect('/choose-icon');
            });
        }
    } catch (err) {
        console.error(err);
        res.render('signup', { error: 'An error occurred. Please try again.', userName: null, cart: [] });
    }
});



app.post('/logout', (req, res) => {
    // Log the logout activity
    const logoutActivity = new Activity({ username: req.session.userName, type: 'logout' });
    logoutActivity.save();

    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/signin');
    });
});


app.post('/cart/add', isAuthenticated, async (req, res) => {
    const { movieId } = req.body;
    if (!req.session.cart) {
        req.session.cart = [];
    }
    const movie = await Movie.findById(movieId);
    if (movie) {
        req.session.cart.push(movie);

        // Log the add-to-cart activity
        const addToCartActivity = new Activity({ username: req.session.userName, type: 'add-to-cart' });
        addToCartActivity.save();
    }
    res.redirect('/');
});


app.post('/cart/remove', isAuthenticated, (req, res) => {
    const { movieId } = req.body;
    req.session.cart = req.session.cart.filter(movie => movie._id.toString() !== movieId);
    res.redirect('/');
});

app.get('/', async (req, res) => {
    const { sort, search, genre } = req.query;
    let query = {};
    let sortOption = {};

    if (search) {
        query.name = { $regex: search, $options: 'i' }; // Case-insensitive search
    }

    if (genre) {
        query.tags = genre;
    }

    if (sort === 'name') {
        sortOption.name = 1;
    } else if (sort === 'rating') {
        sortOption.rating = -1;
    } else if (sort === 'date') {
        sortOption.releaseDate = -1; // Assuming you have a releaseDate field
    }

    const movies = await Movie.find(query).sort(sortOption);
    const userName = req.session.userName; // Retrieve the user name from the session
    const userIcon = req.session.userIcon; // Retrieve the user icon from the session
    const cart = req.session.cart || [];
    res.render('store', { movies, sort, search, genre, userName, userIcon, cart });
});


// Route for individual movie pages
app.get('/movie/:id', async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);
        if (!movie) {
            return res.status(404).send('Movie not found');
        }
        res.render('movies', { userIcon,movie, userName: req.session.userName, cart: req.session.cart || []});
    } catch (err) {
        console.error('Error fetching movie:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Route for payment page
app.get('/payment', isAuthenticated, (req, res) => {
    const cart = req.session.cart || [];
    const userName = req.session.userName;
    res.render('payment', { userIcon,cart, userName });
});

// Route for completing payment
app.post('/complete-payment', isAuthenticated, async (req, res) => {
    const user = await UserModel.findById(req.session.userId);
    if (user) {
        user.purchasedMovies.push(...req.session.cart.map(movie => movie._id));
        await user.save();

        // Log the purchase activity
        const purchaseActivity = new Activity({ username: user.name, type: 'purchase', datetime: new Date() });
        purchaseActivity.save();
    }
    req.session.cart = [];
    res.redirect('/');
});

app.get('/choose-icon', isAuthenticated, (req, res) => {
    const cart = req.session.cart || [];
    res.render('chooseIcon', { userName: req.session.userName, userIcon: req.session.userIcon, cart });
});




// Admin CRUD routes
app.get('/admin/movies', isAuthenticated, isAdmin, async (req, res) => {
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
    const userName = req.session.userName;
    const cart = req.session.cart || [];
    res.render('editStore', { movies, sort, search, userName, cart });
});

app.post('/admin/movies', isAuthenticated, isAdmin, async (req, res) => {
    const { name, description, director, actors, rating, posterUrl, trailerUrl, tags } = req.body;

    // Ensure actors and tags are arrays, even if they are empty
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

app.put('/admin/movies/:id', isAuthenticated, isAdmin, async (req, res) => {
    const { name, description, director, actors, rating, posterUrl, trailerUrl, tags } = req.body;

    // Ensure actors and tags are arrays, even if they are empty
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

app.delete('/admin/movies/:id', isAuthenticated, isAdmin, async (req, res) => {
    await Movie.findByIdAndDelete(req.params.id);
    res.redirect('/admin/movies');
});

// Admin activity log route
app.get('/admin/activity', isAuthenticated, isAdmin, async (req, res) => {
    const { username } = req.query;
    let query = {};

    if (username) {
        query.username = { $regex: '^' + username, $options: 'i' }; // Case-insensitive prefix match
    }

    const activities = await Activity.find(query).sort({ datetime: -1 }); // Sort by datetime descending
    const userName = req.session.userName; // Retrieve the user name from the session
    const userIcon = req.session.userIcon; // Retrieve the user icon from the session
    const cart = req.session.cart || [];
    res.render('adminActivity', { activities, userName, userIcon, cart });
});




app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
