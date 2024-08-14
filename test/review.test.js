const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const router = require('../routes/reviews');
const { getUserById, getMoviesByIds, saveOrUpdateUser } = require('../DataBase/persist');

jest.mock('../DataBase/persist');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use('/', router);

describe('Review Routes', () => {

    describe('GET /review', () => {
        it('should return 404 if the user is not found', async () => {
            getUserById.mockResolvedValue(null);

            const response = await request(app)
                .get('/review')
                .set('Cookie', ['userId=someInvalidUserId']);

            expect(response.status).toBe(404);
            expect(response.text).toBe('User not found');
        });

        it('should render the review page with user data and movies', async () => {
            const mockUser = { _id: 'userId', name: 'John Doe', reviews: {} };
            const mockMovies = [{ _id: 'movieId1', title: 'Movie 1' }, { _id: 'movieId2', title: 'Movie 2' }];

            getUserById.mockResolvedValue(mockUser);
            getMoviesByIds.mockResolvedValue(mockMovies);

            const response = await request(app)
                .get('/review')
                .set('Cookie', ['userId=someValidUserId', 'recentlyPurchasedMovies=["movieId1","movieId2"]']);

            expect(response.status).toBe(200);
            expect(response.text).toContain('John Doe');
            expect(response.text).toContain('Movie 1');
            expect(response.text).toContain('Movie 2');
        });

        it('should return 500 if there is a server error', async () => {
            getUserById.mockRejectedValue(new Error('Server Error'));

            const response = await request(app)
                .get('/review')
                .set('Cookie', ['userId=someValidUserId']);

            expect(response.status).toBe(500);
            expect(response.text).toBe('Internal Server Error');
        });
    });

    describe('POST /review', () => {
        it('should save reviews and redirect to home', async () => {
            const mockUser = { _id: 'userId', reviews: new Map() };

            getUserById.mockResolvedValue(mockUser);
            saveOrUpdateUser.mockResolvedValue(mockUser);

            const response = await request(app)
                .post('/review')
                .send({ reviews: { movieId1: 5, movieId2: 4 } })
                .set('Cookie', ['userId=someValidUserId']);

            expect(response.status).toBe(302);  // 302 is the status code for a redirect
            expect(response.header.location).toBe('/');
            expect(mockUser.reviews.get('movieId1')).toBe(5);
            expect(mockUser.reviews.get('movieId2')).toBe(4);
        });

        it('should return 404 if the user is not found', async () => {
            getUserById.mockResolvedValue(null);

            const response = await request(app)
                .post('/review')
                .send({ reviews: { movieId1: 5 } })
                .set('Cookie', ['userId=someInvalidUserId']);

            expect(response.status).toBe(404);
            expect(response.text).toBe('User not found');
        });

        it('should return 500 if there is a server error', async () => {
            getUserById.mockRejectedValue(new Error('Server Error'));

            const response = await request(app)
                .post('/review')
                .send({ reviews: { movieId1: 5 } })
                .set('Cookie', ['userId=someValidUserId']);

            expect(response.status).toBe(500);
            expect(response.text).toBe('Internal Server Error');
        });
    });

});
