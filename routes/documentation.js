const express = require('express');

const router = express.Router();

router.get('/readme.html', (req, res) => {
    res.render('readme',{userName: req.cookies.userName, cart: req.cookies.cart ? JSON.parse(req.cookies.cart) : [],userIcon: req.cookies.userIcon});
});

module.exports = router;