/*
Arhaan Wazid 
101256222
*/ 
// Initialize the server and define routes
const http = require('http')
const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const fs = require('fs')
const https = require('https')

const API_KEY = 'c107adb9'; //API key for OMDB API

//read routes modules
const routes = require('./routes/index')
const app = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse incoming request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set the views directory
app.set('views', path.join(__dirname, 'views'))
// Set the view engine to use Handlebars
app.set('view engine', 'hbs') 

// Define a route to render the initial page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//some logger middleware functions
function methodLogger(request, response, next){
    console.log("METHOD LOGGER")
    console.log("================================")
    console.log("METHOD: " + request.method)
    console.log("URL:" + request.url)
    next(); //call next middleware registered
}
function headerLogger(request, response, next){
    console.log("HEADER LOGGER:")
    console.log("Headers:")
    for(k in request.headers) console.log(k)
    next() //call next middleware registered
}

//register middleware with dispatcher
//middleware
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))


// Define a route to add a user
app.post('/create-user', (req, res) => {
    // Get the user data from the request body
    const newUser = req.body;
    routes.addUser(newUser)
        .then(user => {
            if (user) {
                res.status(200).send('User was successfully added'); // Send a success message
            } else {
                res.status(400).send('No user was added');
            }
        })
        .catch(err => res.status(500).send(err));
});

app.use(routes.authenticate); //authenticate user

// Define a route to render the template when the button is clicked
app.get('/login', routes.authenticate, (req, res) => {
    // Data to render the template
    const data = {
        title: 'Home Page',
        message: 'Welcome to the movie site!',
        username: req.username // Use the username from the authenticated user
    };

    // Render the 'index' template and pass the data
    res.render('index', data);
});

//routes to the users and getFavourites
app.get('/users', routes.users)
app.get('/getFavourites', routes.getFavourites)

// Define a route to search for movies
app.get('/search', (req, res) => {
    // Get the title from the query string
    const title = req.query.q;
    // Make a request to the OMDB API
    https.get(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${title}`, (apiRes) => {
        let data = '';

        // A 'data' event is emitted when a chunk of the response data is available
        apiRes.on('data', (chunk) => {
            data += chunk;
        });

        // The 'end' event is emitted when the complete response has been received
        apiRes.on('end', () => {
            const movies = JSON.parse(data).Search;
            res.render('movies', { movies: movies });
        });
        // Handle errors
    }).on('error', (err) => {
        console.error('Error: ' + err.message);
    });
});

app.post('/favourites', (req, res) => {
    // Get the movie title from the request body
    const movieTitle = req.body.movieTitle;

    // Add the movie to the favourites
    routes.addFavourite(movieTitle)
    // Send a success message if the movie was added successfully
        .then(favorite => {
            res.status(200).json({message: 'Movie added successfully', favorite: favorite});
        })
        // Send an error message if the movie is already in the favourites
        .catch(err => {
            if (err.message === 'Movie already exists in favourites') {
                res.status(409).json({message: 'The movie is already in the favourites list'});
            } else {
                res.status(500).json({error: err});
            }
        });
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log("http://localhost:3000/")
    console.log("http://localhost:3000/users")
    console.log("http://localhost:3000/getfavourites")
});