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


### Public Routes:

1. **GET /**
    - **Description**: Displays the movie store homepage with search, sorting, and genre filtering options.
    - **Handler**: Homepage route for browsing and viewing movies.

2. **GET /signin**
    - **Description**: Displays the sign-in page.
    - **Handler**: Provides a form for user login.

3. **GET /signup**
    - **Description**: Displays the sign-up page.
    - **Handler**: Provides a form for new user registration.


### User Routes:

1. **GET /choose-icon**
    - **Description**: Allows the user to select an avatar/icon.
    - **Handler**: Presents a page for choosing icons/avatars.

2. **GET /genres**
    - **Description**: Displays available genres for the user to choose their favorites.
    - **Handler**: Lets users select genres they are interested in.

3. **GET /review**
    - **Description**: Allows users to review movies they have purchased.
    - **Handler**: Shows a review form for rated movies.

4. **GET /foryou**
    - **Description**: Displays personalized movie recommendations for the user.
    - **Handler**: Presents personalized recommendations based on user preferences and reviews.

5. **GET /payment**
    - **Description**: Displays the payment page.
    - **Handler**: Shows a page where the user can complete their payment for movies in the cart.

6. **POST /complete-payment**
    - **Description**: Completes the payment for movies in the cart.
    - **Handler**: Processes the payment after submission.

7. **GET /cart**
    - **Description**: Displays the user's shopping cart.
    - **Handler**: Shows the items currently in the user's cart.

8. **POST /cart/add/:id**
    - **Description**: Adds a movie to the cart.
    - **Handler**: Adds a specified movie to the user's shopping cart.

9. **POST /cart/remove/:id**
    - **Description**: Removes a movie from the cart.
    - **Handler**: Removes a specified movie from the user's shopping cart.

### Admin Routes:

1. **GET /admin/movies**
    - **Description**: Displays a list of movies for the admin to manage.
    - **Handler**: Admin page for managing all movies in the store.

2. **POST /admin/movies**
    - **Description**: Adds a new movie to the database.
    - **Handler**: Allows admins to add new movies to the store.

3. **PUT /admin/movies/:id**
    - **Description**: Updates an existing movie.
    - **Handler**: Allows admins to edit the details of an existing movie.

4. **DELETE /admin/movies/:id**
    - **Description**: Deletes a movie from the database.
    - **Handler**: Allows admins to delete a movie from the store.

5. **GET /admin/activity**
    - **Description**: Displays user activity logs for the admin.
    - **Handler**: Shows the admin a list of user activities, such as purchases and reviews.

---
## Running Test

To run the tests for the application, use:
````bash
node test/test.js
````
This will execute both GET and POST tests to ensure the routes and functionality are working correctly.

---

![Logo](./public/logo.jpg)
