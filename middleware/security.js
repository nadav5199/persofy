// securityMiddleware.js
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

module.exports = (app) => {
    // Helmet to secure the app by setting various HTTP headers
    app.use(helmet({
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
    }));

    // XSS Protection
    app.use(xss());

    // Rate Limiting
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    });
    app.use(limiter);
};
