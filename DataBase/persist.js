// persist.js
const mongoose = require('mongoose');
const Movie = require('./models/Movie');
const Activity = require('./models/Activity');
const User = require('./models/User');
const {connectMoviesDb, connectUsersDb} = require("../config/database");


// Database connections
connectMoviesDb();
const userDb = connectUsersDb();

const UserModel = userDb.model('User', require('../DataBase/models/User').schema);

// Function to get a movie by ID
async function getMovieById(movieId) {
    try {
        return await Movie.findById(movieId);
    } catch (error) {
        console.error('Error fetching movie by ID:', error);
        throw error;
    }
}

// Function to get all movies with optional filters
async function getAllMovies(query = {}, sortOption = {}) {
    try {
        return await Movie.find(query).sort(sortOption);
    } catch (error) {
        console.error('Error fetching all movies:', error);
        throw error;
    }
}

// Function to save a new movie
async function saveMovie(movieData) {
    try {
        const movie = new Movie(movieData);
        return await movie.save();
    } catch (error) {
        console.error('Error saving movie:', error);
        throw error;
    }
}

// Function to update a movie by ID
async function updateMovieById(movieId, movieData) {
    try {
        return await Movie.findByIdAndUpdate(movieId, movieData, { new: true });
    } catch (error) {
        console.error('Error updating movie by ID:', error);
        throw error;
    }
}

// Function to delete a movie by ID
async function deleteMovieById(movieId) {
    try {
        return await Movie.findByIdAndDelete(movieId);
    } catch (error) {
        console.error('Error deleting movie by ID:', error);
        throw error;
    }
}

// Function to get a user by ID
async function getUserById(objectId) {
    try {
        return await UserModel.findById(objectId);
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        throw error;
    }
}

// Function to get a user by ID
async function getUserByName(name) {
    try {
        return await UserModel.findOne(name);
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        throw error;
    }
}

// Function to save or update a user
async function saveOrUpdateUser(user) {
    try {
        return await user.save();
    } catch (error) {
        console.error('Error saving/updating user:', error);
        throw error;
    }
}


async function setUser({ name, email, password }) {
    try {
        const user = new User({ name, email, password }); // Initialize the User model with an object
        await user.save(); // Save and return the user
        return user;
    } catch (error) {
        console.error('Error saving/updating user:', error);
        throw error;
    }
}

// Function to log an activity
async function logActivity(userName , activityData) {
    try {
        const activity = new Activity({userName , activityData});
        return await activity.save();
    } catch (error) {
        console.error('Error logging activity:', error);
        throw error;
    }
}

async function getActivity(query){
    return Activity.find(query).sort({datetime: -1});
}

// Function to get movies by their IDs
async function getMoviesByIds(ids) {
    try {
        return await Movie.find({ _id: { $in: ids } });
    } catch (error) {
        console.error('Error fetching movies by IDs:', error);
        throw error;
    }
}
async function getTags(){
    return Movie.distinct('tags');
}

module.exports = {
    getMovieById,
    getAllMovies,
    saveMovie,
    updateMovieById,
    deleteMovieById,
    getUserById,
    saveOrUpdateUser,
    logActivity,
    getMoviesByIds,
    getActivity,
    getTags,
    getUserByName,
    setUser,
};
