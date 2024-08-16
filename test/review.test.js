const request = require('supertest');
const express = require('express');
const reviewsRouter = require('../routes/reviews'); // Adjust the path to your file
const {getUserById, getMoviesByIds, saveOrUpdateUser} = require('../DataBase/persist');
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session"); // Adjust the path

jest.mock('../DataBase/persist'); // Mock your database persistence layer

const app = express();
// Set view engine and static files directory
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(reviewsRouter);

describe('Review Routes', () => {
    describe('GET /review', () => {
        it('should return 404 if the user is not found', async () => {
            getUserById.mockResolvedValue(null); // Mock user not found

            const response = await request(app)
                .get('/review')
                .set('Cookie', ['userId=someInvalidUserId']);

            console.log(response.text); // Check the response body if you want to see what it returns

            expect(response.status).toBe(404);
            expect(response.text).toBe('User not found');
        });


        it('should return the review page with movies if user and movies are found', async () => {
            getUserById.mockResolvedValue({_id: 'validUserId', reviews: {}});
            getMoviesByIds.mockResolvedValue([{_id: 'movie1', name: 'Movie 1'}]);

            const response = await request(app)
                .get('/review')
                .set('Cookie', ['userId=validUserId', 'recentlyPurchasedMovies=["movie1"]']);

            expect(response.status).toBe(200);
            expect(response.text).toContain('Movie 1'); // Assuming the movie titles will be rendered on the page
        });
    });

    describe('POST /review', () => {
        it('should save reviews and redirect when user and reviews are valid', async () => {
            const user = {id: 'validUserId', reviews: new Map()};
            getUserById.mockResolvedValue(user);
            saveOrUpdateUser.mockResolvedValue(user);

            const response = await request(app)
                .post('/review')
                .set('Cookie', ['userId=validUserId'])
                .send({reviews: {movie1: 5, movie2: 4}});

            expect(response.status).toBe(302); // Redirect status
            expect(response.headers.location).toBe('/'); // Redirection target
            expect(saveOrUpdateUser).toHaveBeenCalledWith(user);
        });

        it('should return 404 if the user is not found on review submission', async () => {
            getUserById.mockResolvedValue(null); // Mock user not found

            const response = await request(app)
                .post('/review')
                .set('Cookie', ['userId=someInvalidUserId'])
                .send({reviews: {movie1: 5}});

            expect(response.status).toBe(404);
            expect(response.text).toBe('User not found');
        });
    });
});
