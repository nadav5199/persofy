// securityMiddleware.js
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

module.exports = (app) => {
    // Middleware to bypass security for specific routes
    app.use((req, res, next) => {
        if (req.path.startsWith('/icons') || req.path.endsWith('/chooseIcon.js') || req.path.startsWith('/admin') || req.path.endsWith('/admin.js') || req.path.startsWith('/choose-icon')) {
            return next();
        }
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
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

    // Apply Rate Limiting to all routes
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    });
    app.use(limiter);

    // Protect against NoSQL Injection Attacks for all routes
    app.use(mongoSanitize({
        replaceWith: '_', // Replace prohibited characters with '_'
    }));
};
