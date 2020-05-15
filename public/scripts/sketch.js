// This file is the major front end script for the project.
let clr
let socket
let isErase
let activeUser = null
let isRecorded = true

// Functions to get colour in required hex format.
function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
let color = "#ff0000";
let colorInput;

// This is the default function called when the client is connected to the server.
function setup() {

  // define dimensions of whiteboard
  let h = 500;
  let w = 947;

  isErase = "false"

  // color picker implementation.
  colorInput = document.querySelector('#c');
  colorInput.addEventListener('input', () => {
    if (isErase == "true") {
      isErase = "false"
    }
    color = colorInput.value;
  })

  // here, it connects to the server and gets a unique socket object.
  socket = io.connect('http://localhost:3000')


  // Here we use JQuery to add a onclick function to all the UI components.
  $('form').submit(sendMsg);
  $("#clearbtn").click(emitClear);
  $("#pencilbtn").click(emitDraw);
  $("#erasebtn").click(emitErase);
  $('#logbtn').click(emitLog);

  // Functions to implement whenever the specific tag is recieved.
  socket.on('mouse', newDrawing);
  socket.on('clear', clearPlease);
  socket.on('erase', erasePlease);
  socket.on('marker', sendMarker);

  // Defines the active user. This tells the client whether it has mutex or not.
  socket.on('active', function (socketId) {
    activeUser = socketId;
    if (activeUser == socket.id) {
      isRecorded = false;
    } else {
      isRecorded = true;
    }
    console.log(isRecorded)
  });

  socket.on('logfile', generateLog);

  // disconnect the socket.
  socket.on('disconnect', function () {
    socket.disconnect();
  });

  // append the recieved message inside the chat window using JQuery.
  socket.on('chat', function (msg) {
    if (msg != "") {
      $('#messages').append($('<li>').text(msg));
      window.scrollTo(0, document.body.scrollHeight);
    }
  });

  // define canvas id and render it.
  var canvas = createCanvas(w, h);
  canvas.parent('sketch-holder');
  canvas.id("myCanvas")
  background(255);
  clr = random(360)
  noStroke()
}

// this displays a particular dot on the whiteboard.
function displayDot(x, y, color) {
  colorMode(RGB)
  fill(color.r, color.g, color.b)
  ellipse(x, y, 10)
  colorMode(RGB)
}

function draw() {
}

// default mouse pressed function for UI
function mousePressed() {
  mouseDragged()
}

// default mouse released function for UI
function mouseReleased() {
  isRecorded = true;
  activeUser = null
  socket.emit("active",null)
}

// default mouse dragged function for UI
function mouseDragged() {
  colorInput = document.querySelector('#c');
  color = colorInput.value;

  if (isErase == "true") {
    rgb_color = { r: 255, g: 255, b: 255 }
  } else {
    rgb_color = hexToRgb(color)
  }

  // check if user has mutex, then go ahead
  if (activeUser == null || activeUser == socket.id) {
    
    // if mutex is free, then acquire it
    if (activeUser == null) {
      activeUser = socket.id;
      isRecorded = false;
      socket.emit("active",activeUser)
    }

    // set the mouse data, draw on that position and emit the coordinates to the server.
    let data = {
      x: mouseX,
      y: mouseY,
      color: rgb_color
    }
    var datetime = new Date();
    var time = datetime.toISOString();
    socket.emit('mouse', {
      socketId: socket.id,
      data: data,
      time: time,
      colr: rgb_color.r,
      colg: rgb_color.g,
      colb: rgb_color.b,
      flag: isErase
    });
    socket.emit('marker', "marker");
    noStroke()
    console.log(data)
    displayDot(mouseX, mouseY, rgb_color)

  } else {
    // error when mutex cant be acquired/
  }
  
}

// Function to send the message in chat
function sendMsg(){

    var datetime = new Date();
    var time = datetime.toISOString();
    console.log($('#m').val())
    
    // emit the message typed to the server.
    socket.emit('chat', {
      socketId: socket.id,
      msg: $('#m').val(),
      time: time
    });
    socket.emit('marker', "marker");

    // clear the message window
    $('#m').val('');
    return false;  
}

// start the drawing of coordinates.
function newDrawing(data) {
  color = rgbToHex(data.color.r, data.color.g, data.color.b)

  displayDot(data.x, data.y, data.color)
}

// clear pressed. Clears the whiteboard when recieves the tag
function clearPlease(dump) {
  clear();
  background(255);
}

// send local state record
function emitLog() {
  socket.emit('logfile', socket.id)
}

// emit clear instruction to the server
function emitClear() {
  if (activeUser == null || activeUser == socket.id) {
    clear();
    background(255);

    socket.emit('clear', "lollll");
  }
}

// set erase flag as flag, to switch between erase and draw modes
function erasePlease(flag) {
  isErase = flag
}

// display local log in JSON format
function generateLog(data) {
  var myjson = JSON.stringify(data, null, 2);
  var x = window.open();
  x.document.open();
  x.document.write('<html><body><pre>' + myjson + '</pre></body></html>');
  x.document.close();
}

// set draw flag as flag, to switch between erase and draw modes
function emitDraw() {
  isErase = "false"
  socket.emit('erase', isErase);

}

// Implementation of chandy lamport algorithm
function sendMarker(dump) {
  if (isRecorded) {
    var recordedState = null
    socket.emit('send-marker', {
      state : recordedState
    })
  } else {
    var recordedState = socket.id
    socket.emit('send-marker', {
      state : recordedState
    })
  }
}

// emit erase instruction to the server
function emitErase() {
  isErase = "true"
  socket.emit('erase', isErase);
}