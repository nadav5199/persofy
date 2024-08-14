const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const movieRoutes = require('../routes/movies'); // Adjust the path as necessary
const {saveOrUpdateUser, getUserById} = require('../DataBase/persist'); // Adjust the path as necessary

jest.mock('../DataBase/persist'); // Mock the database persistence functions

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(movieRoutes); // Use the movie routes in the Express app

/**
 * Test suite for the POST /complete-payment endpoint.
 * This endpoint is responsible for completing the payment process,
 * clearing the user's cart, and handling various scenarios such as
 * user authentication, empty carts, and server errors.
 */
describe('POST /complete-payment', () => {

    /**
     * Test case: Successfully completes payment and clears the cart.
     *
     * This test checks that the payment is completed, the user's
     * purchased movies are updated, and the cart is cleared after the
     * payment process. It also verifies that appropriate cookies are set.
     */
    it('should complete payment and clear the cart', async () => {
        // Mock user data
        const mockUser = {
            _id: 'user123',
            name: 'John Doe',
            purchasedMovies: [],
        };

        // Mock cart data
        const cart = [{_id: 'movie123', name: 'Inception'}];

        // Stub the database functions to return the mocked user
        getUserById.mockResolvedValue(mockUser);
        saveOrUpdateUser.mockResolvedValue(mockUser);

        // Make the POST request to complete payment
        const response = await request(app)
            .post('/complete-payment')
            .set('Cookie', [
                'userId=user123',
                `cart=${JSON.stringify(cart)}`,
            ]);

        // Assertions to verify correct behavior
        expect(getUserById).toHaveBeenCalledWith('user123');
        expect(saveOrUpdateUser).toHaveBeenCalled();
        expect(response.statusCode).toBe(302); // Expect a redirect

        const recentlyPurchasedMoviesCookie = response.headers['set-cookie'].find(cookie => cookie.startsWith('recentlyPurchasedMovies'));
        expect(recentlyPurchasedMoviesCookie).toBeDefined();
        expect(recentlyPurchasedMoviesCookie).toContain('recentlyPurchasedMovies');

        const cartCookie = response.headers['set-cookie'].find(cookie => cookie.startsWith('cart='));
        expect(cartCookie).toBeDefined();
        expect(cartCookie).toContain('cart=; Path=/');
    });

    console.log('-----------------------------------------------------------------------');

    /**
     * Test case: Returns 404 if the user is not found.
     *
     * This test checks that the server responds with a 404 status code
     * when the user ID provided in the cookie does not exist in the database.
     */
    it('should return 404 if the user is not found', async () => {
        // Mock database function to return null for an invalid user
        getUserById.mockResolvedValue(null);

        // Make the POST request with an invalid user ID
        const response = await request(app)
            .post('/complete-payment')
            .set('Cookie', ['userId=invalidUser']);

        // Assertions to verify correct behavior
        expect(response.statusCode).toBe(404);
        expect(response.text).toBe('User not found');
    });

    console.log('-----------------------------------------------------------------------');

    /**
     * Test case: Handles server errors gracefully.
     *
     * This test checks that the server responds with a 500 status code
     * when an error occurs during the database operation.
     */
    it('should handle server errors', async () => {
        // Mock database function to throw an error
        getUserById.mockRejectedValue(new Error('Database error'));

        // Make the POST request to simulate a server error
        const response = await request(app)
            .post('/complete-payment')
            .set('Cookie', ['userId=user123']);

        // Assertions to verify correct behavior
        expect(response.statusCode).toBe(500);
        expect(response.text).toBe('Internal Server Error');
    });

    console.log('-----------------------------------------------------------------------');

    /**
     * Test case: Handles an empty cart gracefully.
     *
     * This test checks that the server correctly processes a payment
     * request when the user's cart is empty. It ensures the cart is cleared,
     * and appropriate cookies are set even when no items are purchased.
     */
    it('should handle empty cart gracefully', async () => {
        // Mock user data
        const mockUser = {
            _id: 'user123',
            name: 'John Doe',
            purchasedMovies: [],
        };

        // Stub the database functions to return the mocked user
        getUserById.mockResolvedValue(mockUser);
        saveOrUpdateUser.mockResolvedValue(mockUser);

        // Make the POST request with an empty cart
        const response = await request(app)
            .post('/complete-payment')
            .set('Cookie', [
                'userId=user123',
                'cart=[]', // Empty cart
            ]);

        // Assertions to verify correct behavior
        expect(response.statusCode).toBe(302); // Expect a redirect
        const recentlyPurchasedMoviesCookie = response.headers['set-cookie'].find(cookie => cookie.startsWith('recentlyPurchasedMovies'));
        expect(recentlyPurchasedMoviesCookie).toBeDefined();
        expect(recentlyPurchasedMoviesCookie).toContain('recentlyPurchasedMovies=%5B%5D');
        const cartCookie = response.headers['set-cookie'].find(cookie => cookie.startsWith('cart='));
        expect(cartCookie).toBeDefined();
        expect(cartCookie).toContain('cart=; Path=/');
    });

    console.log('-----------------------------------------------------------------------');

    /**
     * Test case: Blocks access if the user is not authenticated.
     *
     * This test checks that the server redirects the user to the sign-in
     * page if they attempt to complete a payment without being authenticated.
     */
    it('should block access if the user is not authenticated', async () => {
        // Make the POST request without authentication
        const response = await request(app)
            .post('/complete-payment')
            .set('Cookie', []); // No authentication

        // Assertions to verify correct behavior
        expect(response.statusCode).toBe(302); // Expect a redirect
        expect(response.headers.location).toBe('/signin'); // Adjust to the correct path
    });
});
