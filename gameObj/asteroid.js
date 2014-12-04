var Asteroid = new function(){
	
	var asteroid = [], destroyed = []
	
	this.clear = function(){asteroid = []; destroyed = [];}
	
	this.getIndex = function(id){for(var i = 0; i < asteroid.length && asteroid[i].id != id; i++); return (asteroid[i].id == id ? i : undefined)}
	this.get = function(id){ return asteroid[this.getIndex(id)]}
	this.set = function(id, obj){
		var i = this.getIndex(id);
		for(var key in obj)asteroid[i][key] = obj[key];
	}
	this.getCenterOf = function(id){
		var t = Asteroid.get(id);
		var x = t.x, y = t.y;
		if(t.orbit_active){
			x += Math.cos(t.orbit_theta)*t.orbit_r
			y += Math.sin(t.orbit_theta)*t.orbit_r
		}
		return {x: x, y: y}
	}
	
	
	this.add = function(conf, id){
		var default_conf = {x: 0, y:0, size: 100, controlVar: 20, orbit_active: false, orbit_r: 100, orbit_theta: 0, orbit_speed: 0.01, rotate_active: false, rotate_theta: 0, rotate_speed: 0.1
			,texture_w: 500, texture_h: 500, texture_offx: 0, texture_offy: 0
		}
		var Conf = U.setObjWithDefault(conf, default_conf);
		var size = Conf.size, controlVar = Conf.controlVar;
		
		Conf.texture_offx = Math.random() * (Conf.texture_w - Conf.size)
		Conf.texture_offy = Math.random() * (Conf.texture_h - Conf.size)
		Conf.id = id;
		
		if(!Conf.beziers){
			var pts = [];
			
			pts.push({x: Math.random() * size / 2 , y: Math.random() * size / 2 });		
			pts.push({x: Math.random() * size / 2  + size/2, y: Math.random() * size / 2 });
			pts.push({x: Math.random() * size / 2  + size/2, y: Math.random() * size / 2 + size / 2});
			pts.push({x: Math.random() * size / 2 , y: Math.random() * size / 2 + size / 2});
			
			Conf.beziers = U.blobGenerator(pts, controlVar);
		}		
		asteroid.push(Conf);
		return asteroid.length - 1;
	}
	
	this.destroy = function(id){
		asteroid[Asteroid.getIndex(id)] = asteroid[asteroid.length - 1];
		asteroid.push();
	}
	
	this.draw = function(){
		for(var i = 0; i < asteroid.length; i++){
				C.save();
				var cx= asteroid[i].size / 2; var cy= asteroid[i].size / 2
				
				C.translate(asteroid[i].x, asteroid[i].y);
				if(asteroid[i].orbit_active){
					C.rotate(asteroid[i].orbit_theta);
					C.translate(asteroid[i].orbit_r, 0);
				}
				if(asteroid[i].rotate_active)
					C.rotate(-asteroid[i].rotate_theta);					
				C.translate(-cx, -cy);
				
				C.beginPath();
				C.moveTo(asteroid[i].beziers[0].p1.x, asteroid[i].beziers[0].p1.y);
				for(var j = 0; j < asteroid[i].beziers.length; j++){
					var b = asteroid[i].beziers[j];
					C.bezierCurveTo(b.c1.x, b.c1.y, b.c2.x, b.c2.y, b.p2.x, b.p2.y);
				}
				
				C.fillStyle = '#451f00';
				C.strokeStyle = '#451f00'
				C.lineWidth = 10;
				C.stroke();
				C.fill();
				C.clip();
				var img = document.createElement('img');
				img.src= 'res/clouds.png'
				C.drawImage(img, - asteroid[i].texture_offx, - asteroid[i].texture_offy);
				C.restore();
		}
	}
	
	this.drawOne = function(id){
		C.save();
		var i = Asteroid.getIndex(id);
		C.beginPath();
		var cx= asteroid[i].size / 2; var cy= asteroid[i].size / 2
		
		C.translate(asteroid[i].x, asteroid[i].y);
		if(asteroid[i].orbit_active){
			C.rotate(asteroid[i].orbit_theta);
			C.translate(asteroid[i].orbit_r, 0);
		}
		if(asteroid[i].rotate_active)
			C.rotate(-asteroid[i].rotate_theta);					
		C.translate(-cx, -cy);
		
		C.beginPath();
		C.moveTo(asteroid[i].beziers[0].p1.x, asteroid[i].beziers[0].p1.y);
		for(var j = 0; j < asteroid[i].beziers.length; j++){
			var b = asteroid[i].beziers[j];
			C.bezierCurveTo(b.c1.x, b.c1.y, b.c2.x, b.c2.y, b.p2.x, b.p2.y);
		}
		
		C.fillStyle = '#451f00';
		C.strokeStyle = '#351800'
		C.lineWidth = 10;
		C.stroke();
		C.fill();
		
		C.restore();	
	}
	
	this.correlate = function(x, y, id){
		var i = Asteroid.getIndex(id);
		C.save();
		
		var cx= asteroid[i].size / 2; var cy= asteroid[i].size / 2
		
		C.translate(asteroid[i].x, asteroid[i].y);
		if(asteroid[i].orbit_active){
			C.rotate(asteroid[i].orbit_theta);
			C.translate(asteroid[i].orbit_r, 0);
		}
		if(asteroid[i].rotate_active)
			C.rotate(-asteroid[i].rotate_theta);					
		C.translate(-cx, -cy);

		C.beginPath();
		C.moveTo(asteroid[i].beziers[0].p1.x, asteroid[i].beziers[0].p1.y);
		for(var j = 0; j < asteroid[i].beziers.length; j++){
			var b = asteroid[i].beziers[j];
			C.bezierCurveTo(b.c1.x, b.c1.y, b.c2.x, b.c2.y, b.p2.x, b.p2.y);
		}
		C.restore();	
		return C.isPointInPath(x, y) || C.isPointInStroke(x, y);
	}
	
	this.nextFrame = function(){
		for(var i = 0; i < asteroid.length; i++){
				if(asteroid[i].rotate_active)asteroid[i].rotate_theta+=asteroid[i].rotate_speed;
				if(asteroid[i].orbit_active)asteroid[i].orbit_theta+=asteroid[i].orbit_speed;			
			}
		for(var i = 0; i < destroyed.length; i++){
				if(destroyed[i].rotate_active)destroyed[i].rotate_theta+=destroyed[i].rotate_speed;
				if(destroyed[i].orbit_active)destroyed[i].orbit_theta+=destroyed[i].orbit_speed;
			}
	}
	
	this.boundingBox = function(id){
		var i = this.getIndex(id);
		if(i < 0)return {x: 0, y:0, w:0, h:0};
		
		var t = asteroid[i]; var x = t.x - t.size/2, y=t.y - t.size / 2;
		if(t.orbit_active){
		x += t.orbit_r * Math.cos(t.orbit_theta);
		y += t.orbit_r * Math.sin(t.orbit_theta);
		}
		
		return {x: x, y: y, w: t.size, h: t.size};
	}
	
	this.bounding = function(C, id){
		var i = this.getIndex(id);
		if(i < 0)return;
	
		C.save();
	
		var cx= asteroid[i].size / 2; var cy= asteroid[i].size / 2
		
		C.translate(asteroid[i].x, asteroid[i].y);
		if(asteroid[i].orbit_active){
			C.rotate(asteroid[i].orbit_theta);
			C.translate(asteroid[i].orbit_r, 0);
		}
		if(asteroid[i].rotate_active)
			C.rotate(-asteroid[i].rotate_theta);					
		C.translate(-cx, -cy);
		
		C.beginPath();
		C.moveTo(asteroid[i].beziers[0].p1.x, asteroid[i].beziers[0].p1.y);
		for(var j = 0; j < asteroid[i].beziers.length; j++){
			var b = asteroid[i].beziers[j];
			C.bezierCurveTo(b.c1.x, b.c1.y, b.c2.x, b.c2.y, b.p2.x, b.p2.y);
		}
		C.fill();
		
		C.restore();
	}
	
}