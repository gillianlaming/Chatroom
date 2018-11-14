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
var bcrypt = require('bcrypt');
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.engine('html', engines.hogan); 
app.set('views', __dirname + '/views'); 


	
con.query("CREATE TABLE IF NOT EXISTS rooms ( name varchar(255) PRIMARY KEY, messages mediumtext, password varchar(255) DEFAULT NULL, user varchar(255));")
	.on('error', console.error);

con.query("CREATE TABLE IF NOT EXISTS messages ( id INTEGER PRIMARY KEY AUTOINCREMENT, content mediumtext NOT NULL, timestamp timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, user varchar(255) NOT NULL, room_name varchar(255) DEFAULT NULL, FOREIGN KEY (room_name) REFERENCES rooms (name));")
	.on('error', console.error);

con.query("CREATE TABLE IF NOT EXISTS users ( user varchar(255) NOT NULL, id INTEGER PRIMARY KEY AUTOINCREMENT, room varchar(255) DEFAULT NULL);")
	.on('error', console.error);

con.query("CREATE TABLE IF NOT EXISTS banned ( username varchar(255) NOT NULL, room1 varchar(255) DEFAULT NULL, room2 varchar(255) DEFAULT NULL);")
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
					socket.join(username); //join the socket thru unique username (?)
					var insert = "INSERT INTO users (user) values ($1)";
					con.query(insert, username)
						.on('error', console.error);
					console.log(username+' inserted into users');
					
					var qry = "SELECT * from rooms";
					con.query(qry)
						.on('error', console.error)
						.on('data', function(result){
							var roomName = result.name;
							var creator = result.user;
							socket.emit("room_names",{roomName:roomName, username:username, creator:creator});
						});
					socket.emit("configure_display", {username:username});
					//sends the username to the html so the html can access it for later use
				}
			});
	});
	socket.on("check_password", function(data){
		var roomName = data["roomName"]; 
		var username = data["username"];
		var password = data["password"];
		var creator = data["creator"];
		
		var qry = ("SELECT password from rooms where name = $1");
		con.query(qry, roomName)
			.on('data', function(result){
				pass = result.password;
				if ((bcrypt.compareSync(password, pass))){
					console.log("password is correct!!!");
					socket.emit("enter_room", {username:username, roomName:roomName, creator:creator}); //just let them enter the room already!!
				}
				else{
					console.log("incorrect password");
					//socket.emit("ask_for_password", {username:username, roomName:roomName}); 
				}
			})
			.on('error', console.error);
	});
	// NEW ROOM CAN BE CREATED
	socket.on("get_room_name", function(data){ 
		roomName = data["roomName"]; 
		username = data["username"];
		var sql = "INSERT INTO rooms (name, user, password) VALUES ($1, $2, $3)";
		var values = [roomName, username, "yeet"];
		con.query(sql, values)
			.on('error', console.error);
		console.log(roomName+' inserted into db');

		io.sockets.emit("room_names",{roomName:roomName, creator:username}); //send the new roomname to the html
	});

	// INSERTS MESSAGE INTO DB
	socket.on('message_to_server', function(data) {
		var mess = data["message"];
		var roomName = data["roomName"];
		var username = data["username"];
		//parse message
		var isBad = "false";
		var content = mess.split(" ");
		var badWord = ["shit", "fuck", "damn", "ass", "whore", "dick", "bitch", "asshole"];
		for (var i=0; i<content.length; i++){
			for (var j = 0; j<badWord.length; j++){
				if (content[i] == badWord[j]){
					console.log("you said a bad word");
					isBad = "true";
					socket.emit("bad_word",{username:username, roomName:roomName});
				}
			}
		}
		
		if (!isBad){
		var sql = "INSERT INTO messages (content, user, room_name) VALUES ($1, $2, $3)";
		var values = [mess, username, roomName]; 
		con.query(sql, values)
			.on('error', console.error);  

		io.sockets.emit('new_message', {message:mess, roomName:roomName, username:username}); // new messages must be broadcasted to all users
		}
	});
	//delete a room
	socket.on("delete_room", function(data){
		roomName = data["roomName"];
		mess = 'The room you are currently in has been deleted.'
		var qry = ("SELECT user from users where room = $1");
		con.query(qry, roomName)
			.on('data', function(result){
				user = result.user; //capture each user in the room
				io.sockets.in(user).emit('delete_msg', {message:mess, roomName:roomName});
			})
			.on('error', console.error); 	
		//now actually delete the room
		var sql = ("DELETE from rooms where name = $1")
		con.query(sql, roomName)
			.on('error', console.error); 
		console.log("room deleted from table");	
		io.sockets.emit('remove_room', {roomName:roomName});
	})

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
				socket.emit("display_users",{usersList:usersList, roomName:roomName});
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

	socket.on("is_there_password", function(data){
		var roomName = data["roomName"];
		var username = data["username"];
		var creator = data["creator"];

		var qry = ("SELECT password from rooms where name = $1");
		con.query(qry, roomName)
			.on('data', function(result){
				pass = result.password;
				if(bcrypt.compareSync('yeet', pass)) {
					pass = "yeet";
					console.log("password is yeet");
				}
				if (pass == 'yeet'){ // no password
					console.log("checking to see if "+username+" has been banned from "+roomName);
					// see if user is banned from this room
					var q = "SELECT * from banned where username = $1";
					con.query(q, username)
						.on('data', function(result){
							if (result.room1 == roomName || result.room2 == roomName){
								console.log(username+" is banned from this room!");
								//io.sockets.emit("you_are_banned", {username:username, roomName:roomName});
							}
						})
						.on('end', function(){
							console.log(username+" is not banned from "+roomName);
							socket.emit("enter_room", {username:username, roomName:roomName, creator:creator}); //just let them enter the room already!!
						})
						.on('error', console.error);
					}
				else{ // has password
					socket.emit("ask_for_password", {username:username, roomName:roomName, creator:creator}); 
				}
			})
			.on('error', console.error);
	})
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
		console.log('removed '+username+' from room '+roomName);
		io.sockets.emit("remove_user", {username:username, roomName:roomName});
	});

	//get password from server side
	socket.on("set_password", function(data){
		var password = data["password"];
		var roomName = data["roomName"];
		var hash = bcrypt.hashSync(password, 10); //hash the password to store in sql
		console.log(hash)
		var sql = "UPDATE rooms SET password = $1 WHERE name = $2";
		var values = [hash, roomName];
		con.query(sql, values)
			.on('error', console.error);
		console.log("updated "+ roomName +" to have password "+ hash);
	});
	// check if user has been kicked out
	socket.on("check_for_kick", function(data){
		console.log("kick????");
		
		var roomName = data["roomName"];
		var username = data["username"];
		
		io.sockets.emit("kick", {username:username, roomName:roomName});
	});

	//private message a user
	socket.on("private_message", function(data){
		chatRecipient = data['username'];
		message = data["message"];
		sender = data["sender"]
		console.log(chatRecipient + " should be receiving message "+ message);
		//capture the message from client side
		//socket.emit("new_msg", {username:chatRecipient, message:message});
		io.sockets.in(chatRecipient).emit('new_msg', {username:sender, message:message});
	})
	

	// Adds bans on users to db
	socket.on("ban", function(data){
		var roomName = data["roomName"];
		var username = data["username"];
		console.log("banning "+username +" from "+roomName);
		var banned_num = 0;
		// see if user is already banned from any rooms
		var q = "SELECT * from banned where username = $1";
		con.query(q, username)
			.on('data', function(result){
				if (result.room1 != null){
					banned_num++;
				}
				if (result.room2 != null){
					banned_num++;
				}
			})
			.on('end', function(){
				if (banned_num == 0){
					// insert username and roomname into banned table
					var sql = "INSERT INTO banned (username, room1) VALUES ($1, $2)";
					con.query(sql, [username, roomName])
						.on('error', console.error);

					console.log("added "+username+" to banned db");
				}
				else if (banned_num == 1){
					var sql = "UPDATE banned SET room2 = $1 WHERE username = $2";
					con.query(sql, [roomName, username])
						.on('error', console.error);

					console.log("updated "+username+" in banned db");
				}
				else {
					console.log("more than 2 banned rooms already!");
				}
			})
			.on('error', console.error);
	});

});

server.listen(3456);