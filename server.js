
let express = require('express');
let app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http)

 let host = 3000

app.use(express.static('public'));

var messages = [];

io.on('connection', newConnection)

function newConnection(socket){
	console.log('connection:',	socket.id);
	socket.on('mouse', mouseMsg);

	socket.on('chat', function(msg){
		io.emit('chat', msg);
	});
	
	function mouseMsg(data) {
		socket.broadcast.emit('mouse',data)
		console.log(data)
	}
}

http.listen(host, function(){
	console.log("Listening on 3000")
})