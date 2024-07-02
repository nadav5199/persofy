const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    username: String,
    type: String,
    datetime: { type: Date, default: Date.now }
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
