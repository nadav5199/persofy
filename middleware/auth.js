/**
 * Authentication and Authorization Middleware:
 * Handles checking if a user is authenticated or has admin rights.
 *
 * Functions:
 * - isAuthenticated: Verifies if the user is logged in by checking for the userId cookie.
 * - isAdmin: Verifies if the logged-in user has admin rights by checking if the userName cookie is 'admin'.
 *
 * Dependencies:
 * - express: Web framework (implied by the middleware setup)
 */

function isAuthenticated(req, res, next) {
    if (req.cookies.userId) {
        return next(); // Proceed if user is authenticated
    } else {
        res.redirect('/signin'); // Redirect to sign-in page if not authenticated
    }
}

function isAdmin(req, res, next) {
    if (req.cookies.userName === 'admin') {
        return next(); // Proceed if user is admin
    } else {
        res.status(403).send('Access denied'); // Send 403 Forbidden if not admin
    }
}

module.exports = { isAuthenticated, isAdmin };
