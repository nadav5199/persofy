const express = require('express');
const {isAuthenticated} = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const {getUserById, saveOrUpdateUser} = require("../DataBase/persist");

/**
 * Defines the choose icon routes.
 * @returns {Router} Express router.
 */

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
                    userName: req.session.userName,
                    userIcon: req.session.userIcon,
                    cart: req.session.cart || [],
                    images: images
                });
            }
        });
    });

    router.post('/choose-icon', isAuthenticated, async (req, res) => {
        const {icon} = req.body;
        const user = await getUserById(req.session.userId);
        if (user) {
            user.icon = icon;
            await saveOrUpdateUser(user);
            req.session.userIcon = icon;
        }
        res.redirect('/genres'); // Redirect to the genres selection page after sign-up
    })
    module.exports = router;

