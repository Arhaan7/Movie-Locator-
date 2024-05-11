//require statements for sqlite3
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs')
const Handlebars = require('handlebars');


//getting the database and connecting to it
const db = new sqlite3.Database('./mydb.sqlite3', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the mydb.sqlite3 database.');
});

//defining the file paths
const headerFilePath = __dirname + '/../public/index.html'
const footerFilePath = __dirname + '/../views/footer.html'
const userFilePath = __dirname + '/../views/userMovies.html'

//creating the tables
db.serialize(function() {
  let sqlString = "CREATE TABLE IF NOT EXISTS users (userid TEXT PRIMARY KEY, password TEXT, role TEXT)"
  db.run(sqlString)
  sqlString = "INSERT OR REPLACE INTO users VALUES ('awazid', 'carleton', 'admin')"
  db.run(sqlString)
});

//creating the favourites table of users and movies
db.serialize(function() {
  let sqlString = "CREATE TABLE IF NOT EXISTS favourites (movieTitle TEXT)"
  db.run(sqlString)
});

exports.authenticate = function(request, response, next) {
  /*
	Middleware to do BASIC http 401 authentication
	*/
  let auth = request.headers.authorization
  // auth is a base64 representation of (username:password)
  //so we will need to decode the base64
  if (!auth) {
    //note here the setHeader must be before the writeHead
    response.setHeader('WWW-Authenticate', 'Basic realm="need to login"')
    response.writeHead(401, {
      'Content-Type': 'text/html'
    })
    console.log('No authorization found, send 401.')
    response.end();
  } else {
    console.log("Authorization Header: " + auth)
    //decode authorization header
    // Split on a space, the original auth
    //looks like  "Basic Y2hhcmxlczoxMjM0NQ==" and we need the 2nd part
    var tmp = auth.split(' ')

    // create a buffer and tell it the data coming in is base64
    var buf = Buffer.from(tmp[1], 'base64');

    // read it back out as a string
    //should look like 'ldnel:secret'
    var plain_auth = buf.toString()
    console.log("Decoded Authorization ", plain_auth)

    //extract the userid and password as separate strings
    var credentials = plain_auth.split(':') // split on a ':'
    var username = credentials[0]
    var password = credentials[1]
    var user_role = credentials[2]

    console.log("User: ", username)
    console.log("Password: ", password)

    var authorized = false
    //check database users table for user
    db.all("SELECT userid, password, role FROM users", function(err, rows) {
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].userid == username & rows[i].password == password){
          authorized = true
          request.username = rows[i].userid
          request.user_role = rows[i].role
        }
      }
      if (authorized == false) {
        //we had an authorization header by the user:password is not valid
        response.setHeader('WWW-Authenticate', 'Basic realm="need to login"')
        response.writeHead(401, {
          'Content-Type': 'text/html'
        })
        console.log('No authorization found, send 401.')
        response.end()
      } else
        next()
    })
  }

}

function handleError(response, err) {
  //report file reading error to console and client
  console.log('ERROR: ' + JSON.stringify(err))
  //respond with not found 404 to client
  response.writeHead(404)
  response.end(JSON.stringify(err))
}


//function to send users
function send_users(request, response, rows) {
  //read the header of the html file
  fs.readFile('./views/footer.html', 'utf8', (err, data) => {
    if (err) {
      handleError(response, err);
      return;
    }

    //compile the data
    const template = Handlebars.compile(data);
    const result = template({ users: rows });

    //send the data
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(result);
    response.end();
  });
}

exports.index = function(request, response) {
  // index.html
  fs.readFile(headerFilePath, function(err, data) {
    if (err) {
      handleError(response, err);
      return;
    }
    response.writeHead(200, {
      'Content-Type': 'text/html'
    })
    response.write(data)

    fs.readFile(footerFilePath, function(err, data) {
      if (err) {
        handleError(response, err);
        return;
      }
      response.write(data)
      response.end()
    })
  })
}

exports.users = function(request, response) {
   // Check if user has admin privileges
   if (request.user_role !== 'admin') {
    response.write('<h1><b>Error: You do not have admin privileges.</b></h1>');
    response.end();
    return;
  }

  // /send_users
  console.log('USER ROLE: ' + request.user_role)
  db.all("SELECT userid, password, role FROM users", function(err, rows) {
    send_users(request, response, rows)
  })

}

exports.addUser = function(user) {
  return new Promise((resolve, reject) => {
    //check the user database for the user
      console.log(user); 
      const checkSql = 'SELECT * FROM users WHERE userid = ?';
      db.get(checkSql, [user.username], (err, row) => {
          if (err) {
              reject(err);
          } else if (row) {
              reject('User already exists');
          } else {
            // Insert the user into the database
              const insertSql = 'INSERT INTO users(userid, password, role) VALUES(?,?,?)';
              db.run(insertSql, [user.username, user.password, 'guest'], function(err) {
                  console.log(err);
                  // Check for errors
                  if (err) {
                      console.log('Promise rejected');
                      reject(err);
                  } else {
                      console.log('Promise resolved');
                      user.id = this.lastID; 
                      resolve(user); 
                  }
              });
          }
      });
  });
};

//function to add a favourite movie
exports.addFavourite = function(movieTitle) {
  // Add the movie to the favourites table
  return new Promise((resolve, reject) => {
      const selectSql = 'SELECT * FROM favourites WHERE movieTitle = ?';
      db.get(selectSql, [movieTitle], function(err, row) {
          if (err) {
              reject(err);
          } else if (row) {
              reject(new Error('Movie already exists in favourites'));
          } else {
              const insertSql = 'INSERT INTO favourites(movieTitle) VALUES(?)';
              // Insert the movie title into the database, and call the resolve function if successful
              db.run(insertSql, [movieTitle], function(err) {
                  if (err) {
                      reject(err);
                  } else {
                      resolve({movieTitle: movieTitle});
                  }
              });
          }
      });
  });
};

exports.getFavourites = function(request, response) {
  const selectSql = 'SELECT * FROM favourites';
  db.all(selectSql, function(err, rows) {
    // Check for errors
      if (err) {
          console.error('Database error:', err);
          response.status(500).send('Server error');
          return;
      }


      // Extract the movie titles from the rows
      console.log('Rows:', rows); 

      // Extract the movie titles from the rows
      const movieTitles = rows.map(row => row.movieTitle);

      console.log('Movie Titles:', movieTitles);  // Log the movie titles

      // Call sendMovies with the response and the movie titles
      sendMovies(response, movieTitles);
  });
};

function sendMovies(response, movies) {
  // Read the userMovies.html file
  fs.readFile(userFilePath, 'utf8', (err, data) => {
    // Check for errors
    if (err) {
      console.error(err);
      response.status(500).send('Server error');
      return;
    }
    // Compile the Handlebars template
    const template = Handlebars.compile(data);
    const result = template({ movies: movies });
    // Send the response
    response.set('Content-Type', 'text/html');
    response.status(200).send(result);
  });
}