//server file
// Require the packages we will use:
var express = require('express');
var http = require('http');
var app = express();
var anyDB = require('any-db');
var con = anyDB.createConnection('sqlite3://chatroom.db');
var engines = require('consolidate');
var server = http.createServer(app);
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.engine('html', engines.hogan); 
app.set('views', __dirname + '/views'); 


	
con.query("CREATE TABLE IF NOT EXISTS rooms ( name varchar(255) PRIMARY KEY, messages mediumtext, password varchar(255) DEFAULT NULL, user varchar(255));")
	.on('end', function(){
		console.log('Made rooms table'); })
	.on('error', console.error);

con.query("CREATE TABLE IF NOT EXISTS messages ( id INTEGER PRIMARY KEY AUTOINCREMENT, content mediumtext NOT NULL, timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, user varchar(255) NOT NULL, room_name varchar(255) DEFAULT NULL, FOREIGN KEY (room_name) REFERENCES rooms (name));")
	.on('end', function(){
		console.log('Made messages table'); })
	.on('error', console.error);

con.query("CREATE TABLE IF NOT EXISTS users ( user varchar(255) NOT NULL, id INTEGER PRIMARY KEY AUTOINCREMENT, room varchar(255) DEFAULT NULL);")
	.on('end', function(){
		console.log('Made messages table'); })
	.on('error', console.error);

// on load, display client.html
app.get('/', function(request, response){
	response.render('client.html', {});
});

var io = require('socket.io').listen(server);
// Do the Socket.IO magic:
io.on('connection', function (socket) {
	
	// ON LOG IN, USERNAME GOES INTO DATABASE AND ALL ROOMS ARE DISPLAYED
    socket.on('little_newbie', function(data) {
		var username = data["username"];		
		var insert = "INSERT INTO users (user) values ($1)";
		con.query(insert, username)
			.on('error', console.error);
		console.log(username+' inserted into users');
		
		var qry = "SELECT name from rooms";
		con.query(qry)
			.on('error', console.error)
			.on('data', function(result){
				roomName = result.name;
				socket.emit("room_names",{roomName:roomName, username:username}) 
			});
		socket.emit("display_user", {username:username}); //sends the username to the html so the html can access it for later use
	});
	
	// NEW ROOM CAN BE CREATED
	socket.on("get_room_name", function(data){ //needs username

		roomName = data["roomName"]; 
		username = data["username"];
		var sql = "INSERT INTO rooms (name, user) VALUES ($1, $2)";
		var values = [roomName, username];
		con.query(sql, values)
			.on('error', console.error);
		console.log(roomName+' inserted into db');

		io.sockets.emit("room_names",{roomName:roomName}); //send the new roomname to the html //do not pass username as data
	});

	// INSERTS MESSAGE INTO DB
	socket.on('message_to_server', function(data) {
		var mess = data["message"];
		var roomName = data["roomName"];
		var username = data["username"];

		var sql = "INSERT INTO messages (content, user, room_name) VALUES ($1, $2, $3)";
		var values = [mess, username, roomName]; 
			con.query(sql, values)
				.on('error', console.error);  
			console.log(mess+' inserted into '+roomName);

		io.sockets.emit("display_message",{message:mess, username:username, timestamp:'now'}) // broadcast the new message to other users  
	});
	
	// GET ALL USERS IN A ROOM WHO HAVENT LEFT *if a user closes the tab w/o clicking leave, their name is still in the DB!!
	socket.on("users_in_room", function(data){
		var roomName = data["roomName"];
		var qry = ("SELECT user from users where room = $1") 
		con.query(qry, roomName)
			.on('data', function(result){
				username = result.user;
				socket.emit("display_users",{username:username}) //
			})
			.on('error', console.error); 	
			
	});

	// GET ALL PREVIOUS MESSAGES IN A ROOM
	socket.on("messages_in_room", function(data){
		var roomName = data["roomName"];
		var qry = ("SELECT * from messages where room_name = $1") 
		con.query(qry, roomName)
			.on('data', function(result){
				username = result.user;
				mess = result.content;
				time = result.timestamp;
				socket.emit("display_message",{message:mess, username:username, timestamp:time}); // send messages to client
			})
			.on('error', console.error); 	
	});

	// ADDS USER TO ROOM DB
	socket.on("add_user_to_room", function(data){ //needs username
		var roomName = data["roomName"];
		var username = data["username"];
		var sql = "UPDATE users SET room = $1 WHERE user = $2"; 
		var values = [roomName, username];
		con.query(sql, values)
			.on('error', console.error);
		console.log('updated '+roomName+' db to include '+username);	 
		io.sockets.emit("display_users", {username:username}); 
	});

	// REMOVES USER FROM ROOM DB 
	socket.on("remove_user_from_room", function(data){ //needs username and room name
		var roomName = data["roomName"];
		var username = data['username'];
		var sql = "UPDATE users SET room = 'NULL' WHERE user = $1";
		con.query(sql, username)
			.on('error', console.error); 
		console.log('removed '+username+' from room '+roomName);
		io.sockets.emit("remove_user", {username:username, roomName:roomName});
	});

});

server.listen(3456);