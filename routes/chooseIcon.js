const express = require('express');
const {isAuthenticated} = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const {getUserById, saveOrUpdateUser} = require("../DataBase/persist");

const router = express.Router();

router.get('/choose-icon', isAuthenticated, (req, res) => {
    const iconsDirectory = path.join(__dirname, '../public/icons');

    fs.readdir(iconsDirectory, (err, files) => {
        if (err) {
            console.error("Could not list the directory.", err);
            res.status(500).send("Server Error");
        } else {
            const images = files.filter(file => file.endsWith('.jpg') || file.endsWith('.jpeg'));
            res.render('chooseIcon', {
                userName: req.cookies.userName,
                userIcon: req.cookies.userIcon,
                cart: req.cookies.cart ? JSON.parse(req.cookies.cart) : [],
                images: images
            });
        }
    });
});

router.post('/choose-icon', isAuthenticated, async (req, res) => {
    const {icon} = req.body;
    const user = await getUserById(req.cookies.userId);
    if (user) {
        user.icon = icon;
        await saveOrUpdateUser(user);
        res.cookie('userIcon', icon, {httpOnly: true });
    }
    res.redirect('/genres');
})

module.exports = router;
