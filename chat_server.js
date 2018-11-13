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
		var check = "SELECT user from users";
		var exists = false;
		con.query(check) // loop through all exisiting users and check if username exists
			.on('error', console.error)
			.on('data', function(result){
				var name = result.user;
				if (username == name){
					exists = true;
					//console.log(username +" is the same as "+name+" which is already in db");
					socket.emit("username_already_exists", {username:username}); //throw error bc username already exists
				}
			})
			.on('end', function(){
				if(exists == false){
					console.log("the username does not exist");
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
					socket.emit("configure_display", {username:username});
					//sends the username to the html so the html can access it for later use
				}
			});
	});
	
	// NEW ROOM CAN BE CREATED
	socket.on("get_room_name", function(data){ 
		roomName = data["roomName"]; 
		username = data["username"];
		var sql = "INSERT INTO rooms (name, user) VALUES ($1, $2)";
		var values = [roomName, username];
		con.query(sql, values)
			.on('error', console.error);
		console.log(roomName+' inserted into db');

		io.sockets.emit("room_names",{roomName:roomName}); //send the new roomname to the html
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

		io.sockets.emit('new_message', {message:mess, roomName:roomName, username:username}); // new messages must be broadcasted to all users
	});
	
	// GET ALL USERS IN A ROOM WHO HAVENT LEFT *if a user closes the tab w/o clicking leave, their name is still in the DB!!
	socket.on("users_in_room", function(data){
		var roomName = data["roomName"];
		var qry = ("SELECT user from users where room = $1");
		var usersList = new Array();
		con.query(qry, roomName)
			.on('data', function(result){
				usersList.push(result.user); // add all users to a list
			})
			.on('end', function(){
				var sql1 = "SELECT user from rooms where name = $1"; // figure out who created the room
				con.query(sql1, roomName)
					.on('data', function(result){
						var creator = result.user;
						socket.emit("display_users",{usersList:usersList, roomName:roomName, creator:creator});
					})
					.on('error', console.error);
			})
			.on('error', console.error); 	
	});

	// GET ALL PREVIOUS MESSAGES IN A ROOM
	socket.on("messages_in_room", function(data){
		var roomName = data["roomName"];
		var qry = ("SELECT * from messages where room_name = $1");
		var messageList = new Array();
		con.query(qry, roomName)
			.on('data', function(result){
				username = result.user;
				mess = result.content;
				time = result.timestamp;
				// add these to a list
				messageList.push(new Array(username, mess, time));
			})
			.on('end', function(){
				socket.emit("display_messages",{messageList:messageList, roomName:roomName});
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

		//console.log('updated '+roomName+' db to include '+username);
		io.sockets.emit("add_new_user", {username:username, roomName:roomName});
	});

	// REMOVES USER FROM ROOM DB 
	socket.on("remove_user_from_room", function(data){ //needs username and room name
		var roomName = data["roomName"];
		var username = data['username'];
		var sql = "UPDATE users SET room = 'NULL' WHERE user = $1";
		con.query(sql, username)
			.on('error', console.error); 
		//console.log('removed '+username+' from room '+roomName);
		io.sockets.emit("remove_user", {username:username, roomName:roomName});
	});

});

server.listen(3456);