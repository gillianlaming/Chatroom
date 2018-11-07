//server file
// Require the packages we will use:
var http = require("http"),
	socketio = require("socket.io"),
	fs = require("fs"),
	mysql = require('mysql');


// Listen for HTTP connections.  This is essentially a miniature static file server that only serves our one file, client.html:
var app = http.createServer(function(req, resp){
	// This callback runs when a new connection is made to our HTTP server.
	
	fs.readFile("client.html", function(err, data){
		// This callback runs when the client.html file has been read from the filesystem.
		
		if(err) return resp.writeHead(500);
		resp.writeHead(200);
		resp.end(data);
	});
});
var con = mysql.createConnection({
	host: "localhost",
	user: "chatroom_user",
	password: "chatroom_pass",
	database: "chatroom"
	//socketPath: '/var/run/mysqld/mysqld.sock',
	//port: 3456
  });
  con.connect(function(err) {
	if (err) throw err;
	console.log("Connected!");
  });

app.listen(3456);
// Do the Socket.IO magic:
var io = socketio.listen(app);
io.sockets.on("connection", function(socket){
	// This callback runs when a new Socket.IO connection is established.
    socket.on('little_newbie', function(username) {
		socket.username = username;			
		var insert = "INSERT INTO users (user) values (?)";
		con.query(insert, socket.username, function(err){
			if (err) throw err;
			console.log("1 user inserted")
		})
		//io.sockets.emit("display_users", username);	
		var qry = "SELECT name from rooms";
		con.query(qry, function(err, result, fields){
			if (err) throw err;
			for (var i =0; i<result.length; ++i){
				roomName = result[i].name;
				//console.log(roomName);
				socket.emit("room_names",roomName) //this needs to broadcast to all users
			}
		})
			
    });
	socket.on("get_room_name", function(roomName){
		socket.roomName = roomName; //this is a session variable. we may need to change this later
		console.log("roomname " + socket.roomName);
		var sql = "INSERT INTO rooms (name, user) VALUES (?)";
		var values = [socket.roomName, socket.username];
		con.query(sql, [values], function (err) {
			if (err) throw err;
			console.log("1 record inserted");
			}); 
		io.sockets.emit("room_names",roomName); //send the new roomname to the html
		
	})
	socket.on('message_to_server', function(data) {
		// This callback runs when the server receives a new message from the client.
		console.log("username is global " + socket.username);
		socket.message = data["message"];
		var sql = "INSERT INTO messages (content, user) VALUES (?)";
		var values = [socket.message, socket.username]; //message and username
		  con.query(sql, [values], function (err) {
			if (err) throw err;
			console.log("1 record inserted");
		  });  
        console.log(data["message"]); // log it to the Node.JS output
		io.sockets.emit("message_to_client",{message:data["message"]}) // broadcast the message to other users  
	});

	socket.on("users_in_room", function(roomName){
		var name = roomName;
		var qry = ("SELECT user from users where room = ?") //FIX THIS
		var values = roomName;
				con.query(qry, [values], function(err, result, fields){
					if (err) throw err;
					for (var i =0; i<(result.length); ++i){
						user1 = result[i].user;
						io.sockets.emit("display_users",user1) //displays all the users to the current user
					}
					//insert more things here
			})
	})

	socket.on("add_user_to_room", function(roomName){
		var sql = "UPDATE users SET room = 'testing' WHERE user = ?"; //FIX THIS, mysql syntax error
		//var values = [roomName, socket.username];
		con.query(sql, socket.username, function (err) {
			if (err) throw err;
			console.log("1 record updated");
		  }); 
	})

	socket.on("remove_user_from_room", function(){
		var sql = "UPDATE users SET room = 'NULL' WHERE user = ?";
		con.query(sql, socket.username, function (err) {
			if (err) throw err;
			console.log("1 record updated");
		  }); 
	})

});


  
  
    
    

//socket.username =username
