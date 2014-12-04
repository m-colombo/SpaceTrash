var Station = function(){
	var This = this;
	
	this.i = { 
		x : 0, y : 0,
		theta: [0,Math.PI / 2 + 1],
		speed: [0.002, 0.005]
		};
	
	this.set = function(obj, reDraw){
		for(var key in obj)this.i[key] = obj[key];
		if(reDraw)this.draw();
		return this;
	}
	
	this.draw = function(){	
		T.save();
		T.translate(This.i.x, This.i.y, true);
		
		//Solar panels
		for(var i = 0;  i < 2; i++){
			C.rotate(This.i.theta[i]);
			C.beginPath();
			C.fillStyle = 'grey';
			C.strokeStyle = 'black';
			C.rect(-100, -5, 200, 10);
			C.rect(-200, -40, 100, 80);
			C.rect(100, -40, 100, 80);		
			C.stroke();
			C.fill();
			
			C.beginPath();
			C.fillStyle = 'blue';
			C.rect(-195, -35, 90, 70);
			C.rect(105, -35, 90, 70);
			C.fill();
			
			U.Draw.grid({x: -195, y: -35, w: 90,h: 70, color: 'grey', lineWidth: 2, space: 10});
			U.Draw.grid({x: 105, y: -35, w: 90,h: 70, color: 'grey', lineWidth: 2, space: 10});
			
			C.rotate(-This.i.theta[i]);
		}
		
		//Outter circle
		C.beginPath();
		C.fillStyle = 'grey';
		C.strokeStyle = 'blue';
		C.arc(0, 0, 50, 0, Math.PI*2);
		C.fill();
		C.stroke();
		
		//Inner circle
		C.beginPath();
		C.fillStyle = 'grey';
		C.strokeStyle = 'blue';
		C.arc(0, 0, 15, 0, Math.PI*2);
		C.fill();
		C.stroke();
		
		T.restore();
	}
	
	this.correlate = function(x, y){
		var p = T.pointToWorld(x, y);
		
		T.save();
		T.setId();
		C.translate(This.i.x, This.i.y);
		
		C.beginPath();
		C.arc(0, 0, 50, 0, Math.PI*2);
		for(var i = 0;  i < 2; i++){
			C.rotate(This.i.theta[i]);
			C.rect(-100, -5, 200, 10);
			C.rect(-200, -40, 100, 80);
			C.rect(100, -40, 100, 80);				
			C.rotate(-This.i.theta[i]);
		}
		
		T.restore();
		return C.isPointInPath(p[0], p[1]);
	}
	
	this.nextFrame = function(){
		This.i.theta[0] += This.i.speed[0];
		This.i.theta[1] -= This.i.speed[1];
	}

}