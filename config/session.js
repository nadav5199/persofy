const session = require('express-session');

module.exports = session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
});
