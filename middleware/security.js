/**
 * Security Middleware:
 * Implements security measures like helmet, XSS protection, rate limiting, and MongoDB sanitization.
 * Bypasses certain routes for flexibility in static content delivery and admin routes.
 *
 * Dependencies:
 * - helmet: For securing HTTP headers
 * - xss-clean: Middleware to prevent cross-site scripting (XSS) attacks
 * - express-rate-limit: Middleware to prevent DDoS attacks by limiting request rates
 * - express-mongo-sanitize: Middleware to prevent NoSQL injection attacks
 */

const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

module.exports = (app) => {
    // Conditional application of helmet based on route
    app.use((req, res, next) => {
        if (req.path.startsWith('/icons') || req.path.endsWith('/chooseIcon.js') || req.path.startsWith('/admin') || req.path.endsWith('/admin.js') || req.path.startsWith('/choose-icon')) {
            return next();
        }
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://code.jquery.com'],
                    styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://stackpath.bootstrapcdn.com'],
                    imgSrc: ["'self'", 'data:', 'https:'],
                    mediaSrc: ["'self'", 'https:'],
                    frameSrc: ["'self'", 'https:'],
                },
            },
            crossOriginEmbedderPolicy: false,
        })(req, res, next);
    });

    // Apply XSS Protection to all routes
    app.use(xss());

    // Rate Limiting to prevent DDoS
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15-minute window
        max: 100 // Limit each IP to 100 requests per window
    });
    app.use(limiter);

    // Prevent NoSQL injection by sanitizing input
    app.use(mongoSanitize({
        replaceWith: '_', // Replace prohibited characters with '_'
    }));
};
