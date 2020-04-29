let clr
let socket
let isErase

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
 
//   alert(hexToRgb("#0033ff").g); // "51";
let color = "#ff0000";
let colorInput;
let activeUser = null
let canvas
function setup() {

let h = 500
let w = 500

isErase = "false"

colorInput = document.querySelector('#c');
colorInput.addEventListener('input',()=>{
color = colorInput.value;
console.log(color);
})

socket = io.connect('http://localhost:3000')

$('form').submit(function(){
console.log("SUBMIT")
var datetime = new Date();
    var time = datetime.toISOString();
// console.log("timestamp is ",new Date().getTime())
// console.log($('#m').val())
socket.emit('chat', {
socketId: socket.id,
msg: $('#m').val(),
time: time
});
$('#m').val('');
return false;
});

$("#clearbtn").click(emitClear);
$("#pencilbtn").click(emitDraw);
$("#erasebtn").click(emitErase);

socket.on('mouse', newDrawing);
socket.on('clear',clearPlease);
socket.on('erase',erasePlease);
socket.on('active',function(socketId){
  activeUser = socketId
});




socket.on('disconnect', function(){
socket.disconnect();
// socket.emit('notActive', socket.id);
});

socket.on('chat', function(msg){
if (msg != "") {
$('#messages').append($('<li>').text(msg));
window.scrollTo(0, document.body.scrollHeight);
}
 });



    canvas = createCanvas(h, w);
    canvas.parent('sketch-holder');
    canvas.id("myCanvas")

  background(255);
  clr = random(360)
    noStroke()
}

function displayDot(x, y, color){
colorMode(RGB)
fill(color.r,color.g,color.b)
ellipse(x, y, 10)
colorMode(RGB)
}

function draw() {
  // if (activeUser != socket.id){
  //   canvas.addClass('disabledbutton');
  // }
  
}

function mousePressed(){

  if (activeUser == null || activeUser == socket.id){
    console.log("you are active yo " ,socket.id)
    activeUser = socket.id
    socket.emit("active",socket.id)
    mouseDragged()
  }else{
    console.log("someone else is active on board yo " ,activeUser)
  }

}
function mouseReleased() {
  socket.emit("active",null)
}
function mouseDragged() {
// clr += 1
// clr = upgradeColor(clr)
// clr = 100

if(isErase=="true") {
rgb_color = {r: 255, g: 255, b: 255}
}else{
rgb_color = hexToRgb(color)
}
console.log(rgb_color)


// console.log('sending:', mouseX +',', mouseY +',', clr)

if (activeUser == null || activeUser == socket.id){
  activeUser = socket.id
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
    time:time
    });
    noStroke()
  displayDot(mouseX, mouseY, rgb_color)
}else{
  console.log("someone else is active on board yo " ,activeUser)
}
}

function newDrawing(data){
console.log("hello",data)
// data.color = 100

colorInput.value = rgbToHex(data.color.r,data.color.g,data.color.b)
color = rgbToHex(data.color.r,data.color.g,data.color.b)

displayDot(data.x, data.y, data.color)
}

// function upgradeColor(c){
// if (c < 0){
// c = 360 - c
// } else if(c > 360){
// c = c % 360
// }
// return c
// }


function clearPlease(dump){
console.log(dump)
clear();
background(255);
  
}

function emitClear(){

  if (activeUser == socket.id){
    clear();
    background(255);

    socket.emit('clear',"lollll");
  }
  

}

function erasePlease(flag){
console.log("Flag erase",flag)
isErase = flag
}

function emitDraw(){

  isErase = "false"
    socket.emit('erase',isErase);

}

function emitErase(){
    isErase = "true"
    console.log("Erase",isErase);
    socket.emit('erase',isErase);
}

console.log($('messages'))
console.log("dwguwdayg")