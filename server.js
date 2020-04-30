const { Log } = require("./logs")
let express = require('express');
let app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http)

var clients = []

let host = 3000
var messages = [];
let activeUser = null

var standard_input = process.stdin;
standard_input.setEncoding('utf-8');

app.use(express.static('public'));
io.on('connection', newConnection)

function newConnection(socket) {
	console.log('connection:', socket.id);
	const obj = new Log(socket.id)
	clients.push(obj)
	//console.log("object added is :", obj)
//	console.log("number of clients", clients.length)

	socket.on('mouse', mouseMsg);
	socket.on('active', activeHandler);
	socket.on('marker', function(dump) {
		socket.broadcast.emit('marker', "marker");
	})

	function activeHandler(socketId) {
		console.log("current active", socketId);
		activeUser = socketId;
		socket.broadcast.emit('active', activeUser);
	}

	socket.on('disconnect', function () {
	//	console.log('user disconnected');
		for (i in clients) {
			// console.log(i, clients[i])
			if (io.sockets.connected[clients[i].getSocketId()] == undefined) {
				clients[i].updateActive()
			//	console.log(clients[i])
			}
		}
	});

	socket.on('clear', function (dump) {
		socket.broadcast.emit('clear', "helloooo")
	});

	socket.on('logfile', function(socketId) {
		
		for (i in clients) {
			if (clients[i].getSocketId() == socketId) {
				console.log(clients[i])
				socket.emit('logfile', clients[i]);
				break;
			}
		}
	});

	socket.on('erase', function (flag) {
	//	console.log("Erase server", flag)
		socket.broadcast.emit('erase', flag)
	});

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
	//	console.log(socketId)
	//	console.log(msg)
		io.emit('chat', msg);
	});

	function mouseMsg({ socketId, data, time }) {
		socket.broadcast.emit('mouse', data)
		for (i in clients) {
			// console.log("client is ",clients[i]);
			if (clients[i].getSocketId() == socketId) {
				clients[i].appendMousePositions({
					data: data.x +" " +data.y,
					time: time
				})
			}
		}
		// console.log(data)
	}
}


http.listen(host, function () {
	console.log("Listening on 3000")
})

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