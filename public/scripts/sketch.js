let clr
let socket


function setup() {
	
	let h = 500
	let w = 500
	var isErase = false

	socket = io.connect('http://localhost:3000')

	$('form').submit(function(){
		console.log("SUBMIT")
		socket.emit('chat', $('#m').val());
		$('#m').val('');
		return false;
	});

	$("#clearbtn").click(emitClear);
	$("#erasebtn").click(emitErase);

	socket.on('mouse', newDrawing);
	socket.on('clear', clearPlease);
	
	socket.on('chat', function(msg){
		if (msg != "") {
			$('#messages').append($('<li>').text(msg));
			window.scrollTo(0, document.body.scrollHeight);
		}
	  });

  	var canvas = createCanvas(h, w);
   	canvas.parent('sketch-holder');
   	canvas.id("myCanvas")

  	background(255);
  	clr = random(360)
   	noStroke()
}

function displayDot(x, y, color, color2 = 100){
	colorMode(HSB)
	fill(color, 100, color2)
	ellipse(x, y, 10)
	colorMode(RGB)
}

function draw() {
}

function mousePressed(){
	mouseDragged()
}

function mouseDragged() {
	clr += 1
	clr = upgradeColor(clr)
	clr = 100
	let data = {
		x: mouseX,
		y: mouseY,
		color: clr
	}
	socket.emit('mouse', data);
	// console.log('sending:', mouseX +',', mouseY +',', clr)
	noStroke()
	displayDot(mouseX, mouseY, clr)
}
function newDrawing(data){
	console.log(data.color)
	data.color = 100
	displayDot(data.x, data.y, data.color, 100)
}

function upgradeColor(c){
	if (c < 0){
		c = 360 - c
	} else if(c > 360){
		c = c % 360
	}
	return c
}


function clearPlease(dump){
	console.log(dump)
	clear();
	background(255);	
}

function emitClear(){
	clear();
	background(255);
	socket.emit('clear',"lollll");
}

function emitErase(dump){
	console.log(dump)

	var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");
    
    var bMouseDown = false;
    
    $("#myCanvas").mousedown(function() {
        bMouseDown = true;
    });
    
    $("#myCanvas").mouseup(function() {
        bMouseDown = false;  
    });
    
    $("#myCanvas").mousemove(function(e) {
        if (bMouseDown) {
			context.strokeStyle = "#ff0000";
            context.lineWidth = 10;
            context.beginPath();
            context.globalCompositeOperation="destination-out";
            
            context.moveTo(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
            context.lineTo(e.pageX ,e.pageY);
            context.stroke();
            
        }  
    });
}

console.log($('messages'))
console.log("dwguwdayg")
