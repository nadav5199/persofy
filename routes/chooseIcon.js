/**
 * Icon selection routes: Allows users to choose an avatar/icon for their profile
 * Handles the retrieval of available icons and saving the selected icon to the user's profile.
 *
 * Dependencies:
 * - express: Web framework
 * - fs: File system module for reading icon files
 * - path: Utility for handling file paths
 * - DataBase/persist: Custom database persistence methods for user data
 * - middleware/auth: Custom authentication middleware to ensure users are authenticated
 */
const express = require('express');
const {isAuthenticated} = require('../middleware/auth');
const fs = require('fs');
const path = require('path');
const {getUserById, saveOrUpdateUser} = require("../DataBase/persist");

const router = express.Router();

// Route to display the icon selection page
router.get('/choose-icon', isAuthenticated, (req, res) => {
    const iconsDirectory = path.join(__dirname, '../public/icons');

    // Read the available icon files from the directory
    fs.readdir(iconsDirectory, (err, files) => {
        if (err) {
            console.error("Could not list the directory.", err);
            res.status(500).send("Server Error");
        } else {
            // Filter the files to only include .jpg and .jpeg images
            const images = files.filter(file => file.endsWith('.jpg') || file.endsWith('.jpeg'));

            // Render the icon selection page with available images and user information
            res.render('chooseIcon', {
                userName: req.cookies.userName,
                userIcon: req.cookies.userIcon,
                cart: req.cookies.cart ? JSON.parse(req.cookies.cart) : [],
                images: images
            });
        }
    });
});

// Route to handle the user's icon selection and save it to their profile
router.post('/choose-icon', isAuthenticated, async (req, res) => {
    const {icon} = req.body;

    // Retrieve the user by ID from the database
    const user = await getUserById(req.cookies.userId);

    if (user) {
        // Update the user's icon and save the changes to the database
        user.icon = icon;
        await saveOrUpdateUser(user);

        // Set the updated icon in the user's cookie
        res.cookie('userIcon', icon, {httpOnly: true });
    }

    // Redirect the user to the genres page after selecting the icon
    res.redirect('/genres');
});

module.exports = router;
