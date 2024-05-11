Install Instructions: 
1. Go to the directory of where the project is located in the terminal after you unzip it
2. Then type into the terminal 'npm install'
3. Then you should have the correct modules for this project 

Launch Instructions: 
1. Stay in the directory of the project then type in "node server.js". Make sure you have sqlite3 in your path on windows with the project file 
this will make it so that you can work with the database on the server allowing you to login and authenticate credentials and allow you to add
movies to a table and add users. 
2. Then it should say it connected to the database and show these server links: 
http://localhost:3000/
http://localhost:3000/users
http://localhost:3000/getfavourites

Testing Instructions: 
1. If you go to: "http://localhost:3000/", it will prompt you to login, you can login as the admin which is: 
user: awazid
pass: carleton
2. Then you will have to use search bar to search movies 
3. After searching movies you can add some to the favourite list that is shared by all users so people have suggestions to see 
what movie they want to watch 
4. You can also create a new guest account by clicking create user in the first home page and it will prompt you to put in a 
user ID and password. Then next time the server prompts you to login, you can use the credentials you made to login as it saves
on to the database. 
5. If you admin priviledges, which only the awazid user has, you can go to this server to see all the users of the site: 
http://localhost:3000/users
6. If you go directly to this server: http://localhost:3000/getfavourites, it will display all favourited movies made by all different
users on the server. 

URL to test: 
http://localhost:3000/
http://localhost:3000/users
http://localhost:3000/getfavourites

Youtube Video: https://youtu.be/vq6LKJz7VV0



