const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const authRoutes = require('../routes/auth');
const { getUserByName, setUser, logActivity, getMoviesByIds, saveOrUpdateUser } = require('../DataBase/persist');
const path = require("path");

jest.mock('../DataBase/persist'); // Mock the database persistence functions

const app = express();
// Set view engine and static files directory
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(authRoutes);

// Mock the render function to simplify testing of rendered views
app.use((req, res, next) => {
    res.render = jest.fn((view, options) => {
        res.send(`Rendered: ${view} with ${JSON.stringify(options)}`);
    });
    next();
});

/**
 * Test suite for authentication routes (signin, signup, logout).
 * This suite tests various scenarios for rendering views,
 * handling authentication, and managing user sessions.
 */
describe('Auth Routes', () => {

    /**
     * Test case: Renders the signin page.
     *
     * This test checks that the signin page is rendered correctly
     * and that the response contains a form for user input.
     */
    it('should render the signin page', async () => {
        const response = await request(app).get('/signin');
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('<form'); // Checking if form exists in the rendered page
    });

    console.log('-----------------------------------------------------------------------');

    /**
     * Test case: Renders the signup page.
     *
     * This test checks that the signup page is rendered correctly
     * and that the response contains a form for user input.
     */
    it('should render the signup page', async () => {
        const response = await request(app).get('/signup');
        expect(response.statusCode).toBe(200);
        expect(response.text).toContain('<form'); // Checking if form exists in the rendered page
    });

    console.log('-----------------------------------------------------------------------');

    /**
     * Test case: Signs in the user and redirects to the homepage.
     *
     * This test verifies that a valid user can sign in successfully,
     * that user activity is logged, and that the session and cookies
     * are correctly set.
     */
    it('should sign in the user and redirect to the homepage', async () => {
        const mockUser = {_id: 'user123', name: 'John Doe', password: 'password', cart: [], icon: 'icon.png'};
        getUserByName.mockResolvedValue(mockUser);
        getMoviesByIds.mockResolvedValue([]); // Assuming no movies in the cart

        const response = await request(app)
            .post('/signin')
            .send({name: 'John Doe', password: 'password', rememberMe: true});

        expect(getUserByName).toHaveBeenCalledWith('John Doe');
        expect(logActivity).toHaveBeenCalledWith('John Doe', 'login');
        expect(response.statusCode).toBe(302); // Redirect
        expect(response.headers['set-cookie']).toBeDefined(); // Cookies should be set
    });

    console.log('-----------------------------------------------------------------------');

    /**
     * Test case: Returns an error when the user does not exist.
     *
     * This test verifies that an appropriate error message is displayed
     * when a non-existent user attempts to sign in.
     */
    it('should return an error when user doesn\'t exist', async () => {
        getUserByName.mockResolvedValue(null);

        const response = await request(app)
            .post('/signin')
            .send({name: 'John Doe', password: 'password'});

        expect(getUserByName).toHaveBeenCalledWith('John Doe');
        expect(response.statusCode).toBe(200); // Renders signin page with error
        expect(response.text).toContain('User doesn&#39;t exist');
    });

    console.log('-----------------------------------------------------------------------');

    /**
     * Test case: Signs up a new user and redirects to the choose-icon page.
     *
     * This test verifies that a new user can successfully sign up,
     * and that the system redirects the user to the page for choosing
     * an avatar icon.
     */
    it('should sign up a new user and redirect to choose-icon page', async () => {
        getUserByName.mockResolvedValue(null);
        setUser.mockResolvedValue({_id: 'user123', name: 'John Doe', cart: []});

        const response = await request(app)
            .post('/signup')
            .send({name: 'John Doe', email: 'john@example.com', password: 'password'});

        expect(getUserByName).toHaveBeenCalledWith('John Doe');
        expect(setUser).toHaveBeenCalledWith('John Doe', 'john@example.com', 'password');
        expect(response.statusCode).toBe(302); // Redirect
        expect(response.headers['set-cookie']).toBeDefined(); // Cookies should be set
        expect(response.headers.location).toBe('/choose-icon');
    });

    console.log('-----------------------------------------------------------------------');

    /**
     * Test case: Returns an error if the user already exists.
     *
     * This test verifies that an appropriate error message is displayed
     * when a user attempts to sign up with an existing username.
     */
    it('should return an error if the user already exists', async () => {
        const existingUser = { _id: 'user123', name: 'John Doe' };
        getUserByName.mockResolvedValue(existingUser);

        const response = await request(app)
            .post('/signup')
            .send({ name: 'John Doe', email: 'john@example.com', password: 'password' });

        expect(getUserByName).toHaveBeenCalledWith('John Doe');
        expect(response.statusCode).toBe(200); // Renders signup page with error

        // Ensure the error message is rendered correctly
        expect(response.text).toContain('User already exists');
    });

    console.log('-----------------------------------------------------------------------');

    /**
     * Test case: Logs out the user and clears cookies.
     *
     * This test verifies that the user is logged out,
     * their session data is saved, and the session cookies
     * are cleared appropriately.
     */
    it('should log out the user and clear cookies', async () => {
        const mockUser = {_id: 'user123', name: 'John Doe', cart: []};
        getUserByName.mockResolvedValue(mockUser);
        saveOrUpdateUser.mockResolvedValue(mockUser);

        const response = await request(app)
            .post('/logout')
            .set('Cookie', [
                'userName=John Doe',
                'cart=[]',
            ]);

        expect(logActivity).toHaveBeenCalledWith('John Doe', 'logout');
        expect(saveOrUpdateUser).toHaveBeenCalledWith(mockUser);
        expect(response.statusCode).toBe(302); // Redirect to /signin
        expect(response.headers['set-cookie']).toBeDefined(); // Cookies should be cleared
    });

});
