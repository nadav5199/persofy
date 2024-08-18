const axios = require('axios');
const fs = require('fs');

const apiKey = 'your_api_key'; // Replace with your OMDb API key

const movieTitles = [
    "Inception", "The Matrix", "The Dark Knight", "Interstellar", "Fight Club",
    "Pulp Fiction", "Forrest Gump", "The Lord of the Rings: The Fellowship of the Ring",
    "The Lord of the Rings: The Two Towers", "The Lord of the Rings: The Return of the King",
    "The Shawshank Redemption", "The Godfather", "The Godfather: Part II", "The Dark Knight Rises",
    "The Social Network", "The Avengers", "Avengers: Endgame", "Avatar", "Titanic",
    "The Lion King", "Gladiator", "Jurassic Park", "Terminator 2: Judgment Day",
    "Toy Story", "Toy Story 2", "Toy Story 3", "Toy Story 4", "Finding Nemo",
    "The Incredibles", "Shrek", "Shrek 2", "Shrek the Third", "Shrek Forever After",
    "Harry Potter and the Philosopher's Stone", "Harry Potter and the Chamber of Secrets",
    "Harry Potter and the Prisoner of Azkaban", "Harry Potter and the Goblet of Fire",
    "Harry Potter and the Order of the Phoenix", "Harry Potter and the Half-Blood Prince",
    "Harry Potter and the Deathly Hallows: Part 1", "Harry Potter and the Deathly Hallows: Part 2",
    "Star Wars: Episode IV - A New Hope", "Star Wars: Episode V - The Empire Strikes Back",
    "Star Wars: Episode VI - Return of the Jedi", "Star Wars: Episode I - The Phantom Menace",
    "Star Wars: Episode II - Attack of the Clones", "Star Wars: Episode III - Revenge of the Sith",
    "Star Wars: Episode VII - The Force Awakens", "Star Wars: Episode VIII - The Last Jedi",
    "Star Wars: Episode IX - The Rise of Skywalker", "The Hobbit: An Unexpected Journey",
    "The Hobbit: The Desolation of Smaug", "The Hobbit: The Battle of the Five Armies",
    "The Hunger Games", "The Hunger Games: Catching Fire", "The Hunger Games: Mockingjay - Part 1",
    "The Hunger Games: Mockingjay - Part 2", "Pirates of the Caribbean: The Curse of the Black Pearl",
    "Pirates of the Caribbean: Dead Man's Chest", "Pirates of the Caribbean: At World's End",
    "Pirates of the Caribbean: On Stranger Tides", "Pirates of the Caribbean: Dead Men Tell No Tales",
    "The Bourne Identity", "The Bourne Supremacy", "The Bourne Ultimatum",
    "The Bourne Legacy", "Jason Bourne", "Iron Man", "Iron Man 2", "Iron Man 3",
    "Captain America: The First Avenger", "Captain America: The Winter Soldier",
    "Captain America: Civil War", "Thor", "Thor: The Dark World", "Thor: Ragnarok",
    "Black Panther", "Doctor Strange", "Guardians of the Galaxy", "Guardians of the Galaxy Vol. 2",
    "Spider-Man: Homecoming", "Spider-Man: Far From Home", "Spider-Man: No Way Home",
    "Batman Begins", "The Dark Knight Rises", "Man of Steel", "Wonder Woman",
    "Justice League", "Aquaman", "Batman v Superman: Dawn of Justice", "Suicide Squad",
    "The Suicide Squad", "Deadpool", "Deadpool 2", "X-Men", "X2: X-Men United",
    "X-Men: The Last Stand", "X-Men: First Class", "X-Men: Days of Future Past",
    "X-Men: Apocalypse", "Logan", "Fantastic Beasts and Where to Find Them",
    "Fantastic Beasts: The Crimes of Grindelwald", "Fantastic Beasts: The Secrets of Dumbledore",
    "Indiana Jones and the Raiders of the Lost Ark", "Indiana Jones and the Temple of Doom",
    "Indiana Jones and the Last Crusade", "Indiana Jones and the Kingdom of the Crystal Skull",
    "Jurassic World", "Jurassic World: Fallen Kingdom", "Jurassic World: Dominion",
    "Mad Max: Fury Road", "The Terminator", "Terminator 2: Judgment Day",
    "Terminator 3: Rise of the Machines", "Terminator Salvation", "Terminator Genisys",
    "Terminator: Dark Fate", "Rocky", "Rocky II", "Rocky III", "Rocky IV",
    "Rocky V", "Rocky Balboa", "Creed", "Creed II", "Creed III",
    "Mission: Impossible", "Mission: Impossible 2", "Mission: Impossible III",
    "Mission: Impossible - Ghost Protocol", "Mission: Impossible - Rogue Nation",
    "Mission: Impossible - Fallout", "Die Hard", "Die Hard 2", "Die Hard with a Vengeance",
    "Live Free or Die Hard", "A Good Day to Die Hard", "The Fast and the Furious",
    "2 Fast 2 Furious", "The Fast and the Furious: Tokyo Drift", "Fast & Furious",
    "Fast Five", "Fast & Furious 6", "Furious 7", "The Fate of the Furious",
    "F9: The Fast Saga", "The Exorcist", "The Exorcist II: The Heretic", "The Exorcist III",
    "Halloween", "Halloween II", "Halloween III: Season of the Witch",
    "Halloween 4: The Return of Michael Myers", "Halloween 5: The Revenge of Michael Myers",
    "Halloween: The Curse of Michael Myers", "Halloween H20: 20 Years Later",
    "Halloween: Resurrection", "Halloween (2018)", "Halloween Kills", "Halloween Ends",
    "Saw", "Saw II", "Saw III", "Saw IV", "Saw V", "Saw VI", "Saw 3D", "Jigsaw", "Spiral"
];


async function fetchMovieData(title) {
    try {
        const response = await axios.get('http://www.omdbapi.com/', {
            params: {
                apikey: 'a7345267',
                t: title,
            }
        });

        const data = response.data;
        if (data.Response === 'True') {
            return {
                name: data.Title,
                actors: data.Actors.split(', '),
                description: data.Plot,
                director: data.Director,
                tags: data.Genre.split(', '),
                rating: data.imdbRating, // Fetch the rating
                posterUrl: data.Poster,
                date : data.Released
            };
        } else {
            console.error(`Error fetching data for ${title}: ${data.Error}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching data for ${title}:`, error);
        return null;
    }
}

async function fetchAllMovies() {
    const movies = [];

    for (const title of movieTitles) {
        const movie = await fetchMovieData(title);
        if (movie) {
            movies.push(movie);
        }
    }

    // Write the movie data to a file
    fs.writeFileSync('movies.json', JSON.stringify(movies, null, 2));
    console.log('Movies data saved to movies.json');
}

fetchAllMovies();
