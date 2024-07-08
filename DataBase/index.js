const mongoose = require('mongoose');
const fs = require('fs');
const Movie = require('./models/Movie');

async function importData() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://127.0.0.1:27017/movies');
        console.log('Database connected');

        // Read the JSON file
        const movies = JSON.parse(fs.readFileSync('movies.json', 'utf8'));

        // Insert the data into the collection
        await Movie.insertMany(movies);
        console.log('Movies data inserted successfully');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Connection closed');
    }
}

importData();
