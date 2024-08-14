/**
 * Middleware to check if the user is authenticated.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {Function} next - Next middleware function.
 */
function isAuthenticated(req, res, next) {
    if (req.cookies.userId) {
        return next();
    } else {
        res.redirect('/signin');
    }
}

/**
 * Middleware to check if the user is an admin.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {Function} next - Next middleware function.
 */
function isAdmin(req, res, next) {
    if (req.cookies.userName === 'admin') {
        return next();
    } else {
        res.status(403).send('Access denied');
    }
}

module.exports = { isAuthenticated, isAdmin };
