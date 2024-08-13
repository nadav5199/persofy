const mongoose = require('mongoose');
const User = require('../DataBase/models/User');
const {getUserByName, setUser} = require("../DataBase/persist");

/**
 * Connect to the movies database.
 */
function connectMoviesDb() {
    mongoose.connect('mongodb://127.0.0.1:27017/movies');
    const movieDb = mongoose.connection;
    movieDb.on('error', console.error.bind(console, 'connection error:'));
    movieDb.once('open', () => {
        console.log('Movies database connected');
    });
}

/**
 * Connect to the users database and ensure admin user exists.
 * @returns {mongoose.Connection} The users database connection.
 */
function connectUsersDb() {
    const userDb = mongoose.createConnection('mongodb://127.0.0.1:27017/users');
    userDb.on('error', console.error.bind(console, 'connection error:'));
    userDb.once('open', async () => {
        console.log('Users database connected');
        try {
            const existingAdmin = await getUserByName('admin');
            if (!existingAdmin) {
                await setUser('admin', 'admin', 'admin@admin');
                console.log('Admin user created');
            } else {
                console.log('Admin user already exists');
            }
        } catch (err) {
            console.error('Error creating admin user:', err);
        }
    });
    return userDb;
}

module.exports = { connectMoviesDb, connectUsersDb };
