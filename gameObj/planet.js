
var DefaultPlanet = { x: 0, y: 0, r: 100, mass: 100, color: 'green', orbit_active: false, orbit_r: 300, orbit_speed: 0.01, orbit_theta: 0, destination_objective: false};

var Planets = function(){
	
	this.i = U.setObjWithDefault({}, DefaultPlanet);
	var THIS = this;
	
	this.set = function(obj, reDraw){
		for(var key in obj)this.i[key] = obj[key];
		if(reDraw)this.draw();
		return this;
	}
	
	this.draw = function(){
		var i = THIS.i
		C.save();
		if(i.orbit_active){
			C.translate(i.x, i.y);
			C.rotate(i.orbit_theta);
			C.translate(i.orbit_r, 0);
		}
		else C.translate(i.x, i.y);
		C.beginPath();
		C.fillStyle = i.color;
		C.lineWidth = 2;
		C.strokeStyle = i.color;
		C.beginPath();
		C.arc(0, 0, THIS.i.r+1, 0, 2*Math.PI, false);
		C.fill();
		C.stroke();		
		C.restore();
		
	}
	
	this.drawLightEffect = function(){
	
		var i = THIS.i
		C.save();
		if(i.orbit_active){
			C.translate(i.x, i.y);
			C.rotate(i.orbit_theta);
			C.translate(i.orbit_r, 0);
		}
		else C.translate(i.x, i.y);
		
		C.beginPath();
		C.fillStyle = THIS.i.color;
		C.arc(0, 0, THIS.i.r, 0, 2*Math.PI, false);
		C.fill();
		C.strokeStyle = THIS.i.color;
		
		var n = 5, baseAlpha = 0.4
		
		for(var i = 0; i <n; i+= 1){
			C.beginPath();
			C.lineWidth = 20;
			C.globalAlpha = baseAlpha - i * baseAlpha / n
			C.arc(0, 0	, THIS.i.r+(i)*C.lineWidth +C.lineWidth / 2 -1	, 0, 2*Math.PI, false)
			C.stroke();
		}
		C.restore();

	}
	
	this.nextFrame = function(){
		if(THIS.i.orbit_active)THIS.i.orbit_theta += THIS.i.orbit_speed;
	}
	
	this.correlate = function(x, y){
		var p = T.pointToWorld(x, y);
		return U.distance(p[0], p[1], THIS.center().x, THIS.center().y) <= THIS.i.r
	}
	
	this.center = function(){
		var i = THIS.i
		if(i.orbit_active){
			var x = i.x + Math.cos(i.orbit_theta)*i.orbit_r;
			var y =  i.y + Math.sin(i.orbit_theta)*i.orbit_r;
		}else{
			x = i.x; y = i.y;
		}
		return {x: x, y: y}
	}
	
	this.boundingBox = function(){
		var i = THIS.i
		if(i.orbit_active){
			var x = i.x + Math.cos(i.orbit_theta)*i.orbit_r;
			var y =  i.y + Math.sin(i.orbit_theta)*i.orbit_r;
		}else{
			x = i.x; y = i.y;
		}
			
		return {x: x - THIS.i.r, y: y - THIS.i.r,w: 2*THIS.i.r,h: 2*THIS.i.r}
	}
	this.bounding = function(Context){
		var i = THIS.i;
		Context.beginPath();
		if(i.orbit_active)Context.arc(i.x + Math.cos(i.orbit_theta)*i.orbit_r, i.y + Math.sin(i.orbit_theta)*i.orbit_r, i.r, Math.PI * 2, false);
		else Context.arc(i.x, i.y, i.r, Math.PI * 2, false);
		Context.fill();
	}
}