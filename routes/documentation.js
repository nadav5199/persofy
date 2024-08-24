const express = require('express');
const path = require('path');

const howToVideo = path.join(__dirname, '../public/howTo.mp4');
const router = express.Router();

router.get('/readme.html', (req, res) => {
    res.render('readme', {
        userIcon: req.cookies.userIcon,
        cart: req.cookies.cart ? JSON.parse(req.cookies.cart) : [],
        userName: req.cookies.userName,
    });
});

module.exports = router;