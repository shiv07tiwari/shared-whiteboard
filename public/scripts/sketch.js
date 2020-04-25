let clr
let socket
function setup() {
	
	let h = 400
	let w = 400
	

	socket = io.connect('http://localhost:3000')

	$('form').submit(function(){
		console.log("SUBMIT")
		socket.emit('chat', $('#m').val());
		$('#m').val('');
		$('#messages li:last-child').remove();
		return false;
	});

	socket.on('mouse', newDrawing);
	
	socket.on('chat', function(msg){
		if (msg != "") {
			$('#messages').append($('<li>').text(msg));
			window.scrollTo(0, document.body.scrollHeight);
		}
	  });

  	var canvas = createCanvas(h, w);
   	canvas.parent('sketch-holder');


  	background(0);
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
setup()
console.log($('messages'))
console.log("dwguwdayg")