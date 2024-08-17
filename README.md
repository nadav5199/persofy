# Persofy: Movie Store Application

### Project Overview

Persofy is a dynamic and secure movie store web application built using Node.js and Express.js. It allows users to browse, search, and purchase movies while providing user authentication, movie reviews, personalized movie recommendations, and secure data handling using MongoDB. This app also utilizes the OpenAI API to generate personalized movie recommendations based on user preferences and previous reviews.

---
## Features

- **User Authentication**: Sign up, sign in, and logout functionalities.
- **Movie Browsing**: Users can browse, search, and sort movies.
- **Shopping Cart**: Users can add movies to their cart and complete purchases.
- **Movie Reviews**: Users can rate and review movies they have purchased.
- **Personalized Recommendations**: Recommendations are generated based on user preferences and reviews using the OpenAI API.
- **Admin Panel**: Admins can manage movie data and view user activities.

---


## Project Structure

Here's an overview of the project's root directory structure:

```plaintext
persofy/
├── config/                 # Configuration files for database, session, OpenAI API, etc.
│   ├── database.js
│   ├── openaiConfig.js
│   └── session.js
│
├── DataBase/               # Database schema models and persistence logic
│   ├── models/
│   │   ├── Activity.js
│   │   ├── Movie.js
│   │   └── User.js
│   ├── fetchMovies.js      # Uses OMDB API to fetch movies and turns it to movies.json 
│   ├── index.js            # Imports movies.json data into the MongoDB database
│   └── persist.js          # Functions for managing movie and user data
│
├── middleware/             # Middleware for authentication, authorization, and security
│   ├── auth.js
│   └── security.js
│
├── public/                 # Static files (e.g., CSS, images, JS)
│
├── routes/                 # Express route handlers
│   ├── admin.js
│   ├── auth.js
│   ├── cart.js
│   ├── chooseIcon.js
│   ├── genres.js
│   ├── movies.js
│   ├── recommendations.js
│   └── reviews.js
│
├── test/                   # Test files for testing routes and functionalities
│   └── test.js
│
├── views/                  # EJS template files for rendering the frontend
│   ├── partials/           # Reusable partial views for the frontend
│   │   ├── header.ejs
│   │   ├── menu.ejs
│   │   └── sort_menu.ejs
│   ├── adminActivity.ejs
│   ├── chooseIcon.ejs
│   ├── editStore.ejs
│   ├── foryou.ejs
│   ├── genres.ejs
│   ├── movies.ejs
│   ├── payment.ejs
│   ├── review.ejs
│   ├── signin.ejs
│   ├── signup.ejs
│   └── store.ejs
│
├── .env                    # Environment variables (not included in version control)
├── app.js                  # Main application entry point
├── package.json            # Project dependencies and scripts
└── README.md               # Project documentation (this file)
```
 ---
## Installation & Setup
### Prerequisites
- **Node.js:**  Ensure Node.js is installed on your machine.
- **MongoDB:** Install MongoDB on your machine.

### Step 1: Clone the Repository
````bash
git clone https://github.com/nadav5199/persofy.git

cd persofy
````

### Step 2: Install Dependencies

````bash
npm install
````

### Step 3: Environment Variables

Create a .env file in the root directory and add the following:
````plaintext
OPENAI_API_KEY=your-openai-api-key
````
### Step 4: Set Up MongoDB

- Ensure MongoDB is installed and running.
- Create databases called movies.
 
### Step 5: Import Movie Data

Run the following script to import the initial set of movie data into the MongoDB movies database:

```bash 
node DataBase/index.js
```

This script will read movie data from movies.json and populate the database.

### Step 6: Start the Application

````bash 
npm start
````
The app should now be running on http://localhost:3000.

---
## Routes

Below are the different routes supported by the application:
### Public Routes
- **GET /** - Displays the movie store homepage with search, sorting, and genre filtering options.
- **GET /signin** - Displays the sign-in page.
- **GET /review** - Allows users to review movies they have purchased.
- **GET /foryou**- Displays personalized movie recommendations.
- **GET /payment** - Displays the payment page.
- **POST /complete-payment** - Completes the payment for movies in the cart
### Admin Routes
- **GET /admin/movies** - Admin panel for managing movies.
- **POST /admin/movies** - Adds a new movie.
- **PUT /admin/movies/** - Updates an existing movie.
- **DELETE /admin/movies/** - Deletes a movie.
- **GET /admin/activity**  - Displays user activity logs for the admin.

---
## Running Test

To run the tests for the application, use:
````bash
node test/test.js
````
This will execute both GET and POST tests to ensure the routes and functionality are working correctly.

---

![Logo](./public/logo.jpg)
