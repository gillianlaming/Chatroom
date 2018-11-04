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
		console.log("hello " + socket.username);
		//io.sockets.emit("message_to_client",username["user"])
		// con.connect(function(err) {
		// 	if (err) throw err;
		// 	console.log("Connected!");
		// 	var sql = "INSERT INTO messages (user) VALUES (?)";
		// 	var value = socket.username;
		// 	  con.query(sql, value, function (err) {
		// 		if (err) throw err;
		// 		console.log("1 record inserted");
		// 	  });
			  
		//   });
    });
	
	socket.on('message_to_server', function(data) {
		// This callback runs when the server receives a new message from the client.
		//console.log(socket.username)
		//socket.username = username;
		console.log("username is global " + socket.username);
		socket.message = data["message"];
		var sql = "INSERT INTO messages (content, user) VALUES (?)";
		var values = [socket.message, socket.username];
		  con.query(sql, [values], function (err) {
			if (err) throw err;
			console.log("1 record inserted");
		  });  
        console.log(data["message"]); // log it to the Node.JS output
		io.sockets.emit("message_to_client",{message:data["message"]}) // broadcast the message to other users
		
        
	});



	
		
	  
	//con.end();

	
});


  
  
    
    

//socket.username =username;

