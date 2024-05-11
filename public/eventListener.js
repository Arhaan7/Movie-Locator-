document.addEventListener('DOMContentLoaded', function() {
    // Add the event listener to the document
    document.addEventListener('click', function(event) {
        // Check if the clicked element is the homepageButton
        if (event.target.id === 'homeButton') {
            console.log('Home button clicked');
            window.location.href = '/login';
        }
    });

    // Event listener for the login button
    var loginButton = document.getElementById('login');
    if (loginButton) {
        loginButton.addEventListener('click', function() {
            window.location.href = '/login';
        });
    }

    // Event listener for the create new user button
    var newUserButton = document.getElementById('newUser');
    if (newUserButton) {
        newUserButton.addEventListener('click', function() {
            // Hide the buttons
            var loginButton = document.getElementById('login');
            if (loginButton) {
                loginButton.style.display = 'none';
            }
            this.style.display = 'none'; // Hide the create new user button

            // Show the form
            var form = document.querySelector('form');
            if (form) {
                form.style.display = 'block';
            }
        });
    }

    // Event listener for the create user form
    var form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(event) {
            // Prevent the form from being submitted normally
            event.preventDefault();

            // Get the form data
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Send an AJAX request to the server
            fetch('/create-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
            })
            .then(response => response.text())
            .then(data => {
                alert(data);
                // Hide the form
                if (form) {
                    form.style.display = 'none';
                }
                // Show the buttons
                if (loginButton) {
                    loginButton.style.display = 'block';
                }
                if (newUserButton) {
                    newUserButton.style.display = 'block';
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
        });
    }

    // Event listener for the search form
    var searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', function(event) {
            // Prevent the default form submission
            event.preventDefault();

            // Get the search query
            const title = document.querySelector('input[name="q"]').value;

            // Update the action attribute of the form with the search query
            searchForm.action = `/search?q=${encodeURIComponent(title)}`;

            // Submit the form manually
            searchForm.submit();
        });
    }

    // Event listener for the add favorite button
    var addFavoriteButtons = document.querySelectorAll('.favouriteButton');
    addFavoriteButtons.forEach(function(addFavoriteButton) {
        addFavoriteButton.addEventListener('click', function() {
            var movieTitle = this.getAttribute('data-title');
            fetch('/favourites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({movieTitle: movieTitle}),
            })
            .then(response => {
                if (!response.ok) {
                    // If the server responds with an error status code, convert the response to JSON and throw an error with the message from the server
                    return response.json().then(err => { throw new Error(err.message) });
                }
                return response.json();
            })
            .then(data => {
                console.log('Success:', data);
                alert('Movie added to favourites successfully!');
            })
            .catch((error) => {
                console.error('Error:', error);
                alert(error.message);
            });
        });
    });

    // Event listener for the get favorites button
    var getFavoritesButton = document.getElementById('getFavourites');
    console.log(getFavoritesButton);
    if (getFavoritesButton) {
        getFavoritesButton.addEventListener('click', function() {
            window.location.href = '/getFavourites';
        });
    }

    // Event listener for the 'goBack' button
    var goBackButton = document.getElementById('goBack');
    if (goBackButton) {
        goBackButton.addEventListener('click', function() {
            window.location.href = '/login';
        });
    }

    // Event listener for the 'getUsers' button
    var getUsersButton = document.getElementById('getUsers');
    if (getUsersButton) {
        getUsersButton.addEventListener('click', function() {
            window.location.href = '/users';
        });
    }

    // Event listener for the 'goHome' button
    var goHomeButton = document.getElementById('goHome');
    if (goHomeButton) {
        goHomeButton.addEventListener('click', function(event) {
            window.location.href = '/login';
        });
    }
}); 