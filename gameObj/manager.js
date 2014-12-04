var gameObjManager = new function(){
	this.obj = [];
	
	this.add = function(o){ this.obj.push(o)};
	this.clear = function(){ this.obj = [] }
	this.get = function(i){ return this.obj[i]; }
	
	this.drawAll = function(){
		for(var i = 0; i < this.obj.length; i++)this.obj[i].draw();
		Trash.draw();
		Asteroid.draw();
	}

	this.drawAllLightEffect = function(){
		for(var i = 0; i < this.obj.length; i++)this.obj[i].drawLightEffect();
	}

	this.nextAll = function(){
		for(var i = 0; i < this.obj.length; i++)this.obj[i].nextFrame();
		Trash.nextFrame();
		Asteroid.nextFrame();
		S.nextFrame();
		G.base.nextFrame();
	}
	
	this.gravityEffect = function(S){
		for(var j = 0; j < this.obj.length; j++){
			var o = this.obj[j].i;
			if(o.mass){			
				var ox = o.x + ( o.orbit_active ? Math.cos(o.orbit_theta)*o.orbit_r : 0)
				var oy = o.y + ( o.orbit_active ? Math.sin(o.orbit_theta)*o.orbit_r : 0)
				var a = P.gravity * o.mass / Math.pow(U.distance(S.i.x, S.i.y, ox, oy), 2)
				var angle = U.angleBetween(S.i.x, S.i.y, ox, oy);
				
				var newSpeed = U.vectorSum(angle, a, S.i.theta, S.i.speed);
				S.i.theta = newSpeed[0];
				S.i.speed = newSpeed[1];
			}
		}
	}
}