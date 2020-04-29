const {Log} = require("./logs")
let express = require('express');
let app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http)

var clients = []

let host = 3000

app.use(express.static('public'));

let activeUser = null

// var messages = [];

io.on('connection', newConnection)

function newConnection(socket){
console.log('connection:', socket.id);
const obj = new Log(socket.id)
clients.push(obj)
console.log("object added is :",obj)
console.log("number of clients",clients.length)

socket.on('mouse', mouseMsg);
socket.on('active',activeHandler)
function activeHandler(socketId) {
    console.log("current active",socketId)
    activeUser = socketId
    socket.broadcast.emit('active',socketId)
}

socket.on('disconnect', function () {
console.log('user disconnected');
for (i in clients){
// console.log(i, clients[i])
if (io.sockets.connected[clients[i].getSocketId()] == undefined){
clients[i].updateActive()
console.log(clients[i])
}
}
});

socket.on('clear', function(dump){
socket.broadcast.emit('clear',"helloooo")
});

socket.on('erase', function(flag){
console.log("Erase server",flag)
socket.broadcast.emit('erase',flag)
});

// socket.on('notActive', function (socketId) {
// console.log("hello")
    //     for (i in clients){
// console.log("client is ",clients[i]);

// if (clients[i].getSocketId() == socketId){
// clients[i].updateActive(false);
// console.log('updated');
// }
// }
// });

socket.on('chat', function({socketId,msg,time}){
for (i in clients){
// console.log("client is ",clients[i]);
if (clients[i].getSocketId() == socketId){
clients[i].appendMessages({
msg:msg,
time:time
})
}
}
console.log(socketId)
console.log(msg)
io.emit('chat', msg);
});

function mouseMsg({socketId,data,time}) {
socket.broadcast.emit('mouse',data)
for (i in clients){
// console.log("client is ",clients[i]);
if (clients[i].getSocketId() == socketId){
clients[i].appendMousePositions({
data:data,
time:time
})
}
}
// console.log(data)
}
}


http.listen(host, function(){
console.log("Listening on 3000")
})
