//server file
// Require the packages we will use:
var http = require("http"),
	socketio = require("socket.io"),
	fs = require("fs");

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
app.listen(3456);

// Do the Socket.IO magic:
var io = socketio.listen(app);
io.sockets.on("connection", function(socket, username){
	// This callback runs when a new Socket.IO connection is established.
    socket.on('little_newbie', function(username) {
        socket.username = username;
        //io.sockets.emit("message_to_client",{username:data["username"] })
        //io.sockets.emit("message_to_client", socket.username + " ")
    });
});

	socket.on('message_to_server', function(data) {
		// This callback runs when the server receives a new message from the client.
		//console.log(socket.username)
        //console.log("message: "+ socket.username + data["message"]); // log it to the Node.JS output
        io.sockets.emit("message_to_client",{message:data["message"] }) // broadcast the message to other users
        
    });
        
    
    

//socket.username =username;

