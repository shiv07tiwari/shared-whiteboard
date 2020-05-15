// This file is the backend script for the project

// Get the dependencies for the script
const { Log } = require("./logs")
let express = require('express');

// declare express app, port, network http object and socket.io object
let app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http)
let host = 3000

var clients = []
let activeUser = null

// user input object declaration
var standard_input = process.stdin;
standard_input.setEncoding('utf-8');

// make the express app use static files inside the public directory
app.use(express.static('public'));


// "connection" declares the default function whenever a new connection is establishes
io.on('connection', newConnection)

// This function is executed whenever a new connection is established

function newConnection(socket) {
	
	//Print a new connection on terminal
	console.log("New Client Connected")
	console.log('Client Unique Id:', socket.id);

	// Add this connection in log
	const obj = new Log(socket.id)
	clients.push(obj)
	
	// declaring the functions whenever a message with the particular tag is recieved
	socket.on('mouse', mouseMsg);
	socket.on('active', activeHandler);
	socket.on('marker', function(dump) {
		socket.broadcast.emit('marker', "marker");
	})

	// Defines the active user and grants him the Mutex
	function activeHandler(socketId) {
		if (socketId != null) {
			console.log("Resource locked by: ", socketId);
		}
		activeUser = socketId;
		socket.broadcast.emit('active', activeUser);
	}

	//Updates the log file when a client disconnects.
	socket.on('disconnect', function () {
		for (i in clients) {
			if (io.sockets.connected[clients[i].getSocketId()] == undefined) {
				clients[i].updateActive()
			}
		}
	});


	// function to clear the board. This recieves a clear request and then tells other clients to clear the board too.
	socket.on('clear', function (dump) {
		socket.broadcast.emit('clear', "")
	});

	// logfile generation for global state record
	socket.on('logfile', function(socketId) {
		for (i in clients) {
			if (clients[i].getSocketId() == socketId) {
				socket.emit('logfile', clients[i]);
				break;
			}
		}
	});

	// function to erase the board at given flag data. This recieves a erase request and then tells other clients to clear the board too.
	socket.on('erase', function (flag) {
		socket.broadcast.emit('erase', flag)
	});

	// recieves a message from a client and emits it to other clients. Then they add it on their chat UI.
	socket.on('chat', function ({ socketId, msg, time }) {
		for (i in clients) {
			// console.log("client is ",clients[i]);
			if (clients[i].getSocketId() == socketId) {
				clients[i].appendMessages({
					msg: msg,
					time: time
				})
			}
		}
		io.emit('chat', msg);
	});

	// recieves mouse coordinates from a client and emits it to other clients so they can draw on that position too.
	function mouseMsg({ socketId, data, time, colr, colg, colb, flag}) {
		socket.broadcast.emit('mouse', data)
		for (i in clients) {
			if (clients[i].getSocketId() == socketId) {
				clients[i].appendMousePositions({
					data: data.x +" " +data.y + " " + colr + " " + colr + " " + " " +colb + " " + flag,
					time: time
				})
			}
		}
	}
}

// Server starts and listens on 3000 port.
http.listen(host, function () {
	console.log("Listening on 3000")
})

// user input output
standard_input.on('data', function (data) {
	var inp = data.trim().split(" ");

	if (inp.length == 1) {
		if(data === 'exit\n'){
			console.log("User input complete, program exit.");
			process.exit();
		}
		if (data.trim() == "collect") {
			console.log(clients)
		}
	}
});