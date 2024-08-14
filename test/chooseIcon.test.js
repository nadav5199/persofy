const request = require('supertest');
const express = require('express');
const fs = require('fs');
const { getUserById, saveOrUpdateUser } = require('../DataBase/persist');
const chooseIconRoutes = require('../routes/chooseIcon');
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");

jest.mock('fs'); // Mock the filesystem module
jest.mock('../DataBase/persist'); // Mock the database persistence functions
jest.mock('../middleware/auth', () => ({
    isAuthenticated: (req, res, next) => next(), // Mock the authentication middleware
}));

const app = express();

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(chooseIconRoutes);

/**
 * Test suite for the Choose Icon Routes.
 * This suite tests the routes responsible for allowing users to select an avatar icon.
 */
describe('Choose Icon Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    /**
     * Test suite for the GET /choose-icon route.
     * This route should render the page for selecting an avatar icon.
     */
    describe('GET /choose-icon', () => {

        /**
         * Test case: Returns a 500 error if there is a problem reading the directory.
         *
         * This test verifies that the server returns a 500 status code and an appropriate error message
         * if there is an issue accessing the directory containing icon files.
         */
        it('should return a 500 error if there is a problem reading the directory', async () => {
            fs.readdir.mockImplementation((dir, callback) => callback(new Error('File system error'), null));

            const response = await request(app).get('/choose-icon');

            expect(response.statusCode).toBe(500);
            expect(response.text).toContain('Server Error');
        });
    });

    // -----------------------------

    /**
     * Test suite for the POST /choose-icon route.
     * This route allows users to submit their selected avatar icon.
     */
    describe('POST /choose-icon', () => {

        /**
         * Test case: Updates the user icon and sets the cookie.
         *
         * This test verifies that the user's selected icon is saved in the database,
         * that the appropriate cookie is set, and that the user is redirected to the next page.
         */
        it('should update the user icon and set the cookie', async () => {
            // Mock user data
            const mockUser = { id: 'user123', icon: null };
            getUserById.mockResolvedValue(mockUser);
            saveOrUpdateUser.mockResolvedValue();

            // Make the POST request
            const response = await request(app)
                .post('/choose-icon')
                .send({ icon: 'icon1.jpg' })
                .set('Cookie', 'userId=user123');

            // Assertions to verify correct behavior
            expect(getUserById).toHaveBeenCalledWith('user123');
            expect(saveOrUpdateUser).toHaveBeenCalledWith({ id: 'user123', icon: 'icon1.jpg' });
            expect(response.headers['set-cookie'][0]).toContain('userIcon=icon1.jpg');
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe('/genres');
        });

        // -----------------------------

        /**
         * Test case: Handles the case where the user is not found.
         *
         * This test verifies that if the user ID provided in the cookie does not correspond
         * to an existing user, the server still redirects the user to the next page.
         */
        it('should handle case where user is not found', async () => {
            // Mock getUserById to return null, simulating a non-existent user
            getUserById.mockResolvedValue(null);

            // Make the POST request
            const response = await request(app)
                .post('/choose-icon')
                .send({ icon: 'icon1.jpg' })
                .set('Cookie', 'userId=user123');

            // Assertions to verify correct behavior
            expect(response.statusCode).toBe(302);
            expect(response.headers.location).toBe('/genres');
        }, 10000);  // Adjust the timeout if necessary
    });
});
