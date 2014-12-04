var Trash = new function(){
	
	var trash = [], destroyed = []
	
	this.clear = function(){trash = []; destroyed = [];}
	
	this.getIndex = function(id){
		for(var i = 0; i < trash.length && trash[i].id != id; i++); return (trash[i].id == id ? i : undefined)}
		
	this.get = function(id){ return trash[this.getIndex(id)]}
	this.set = function(id, obj){
		var i = this.getIndex(id);
		for(var key in obj)trash[i][key] = obj[key];
	}
	this.getCenterOf = function(id){
		var t = Trash.get(id);
		var x = t.x, y = t.y;
		if(t.orbit_active){
			x += Math.cos(t.orbit_theta)*t.orbit_r
			y += Math.sin(t.orbit_theta)*t.orbit_r
		}
		return {x: x, y: y}
	}
	
	this.add = function(conf, id){
		var default_conf = {x: 200, y:200, size: 100, controlVar: 20, trashness: 1, orbit_active: false, orbit_r: 100, orbit_theta: 0, orbit_speed: 0.01, rotate_active: false, rotate_theta: 0, rotate_speed: 0.1
			,texture_w: 500, texture_h: 500, texture_offx: 0, texture_offy: 0
		}
		var Conf = U.setObjWithDefault(conf, default_conf);
		var size = Conf.size, controlVar = Conf.controlVar;
		
		Conf.texture_offx = Math.random() * (Conf.texture_w - Conf.size)
		Conf.texture_offy = Math.random() * (Conf.texture_h - Conf.size)
		Conf.id = id;
		
		if(!Conf.beziers){
			var pts = [];
			
			pts.push({x: Math.random() * size / 2 , y: Math.random() * size / 2});		
			pts.push({x: Math.random() * size / 2 + size/2, y: Math.random() * size / 2 });
			pts.push({x: Math.random() * size / 2 + size/2, y: Math.random() * size / 2 + size / 2});
			pts.push({x: Math.random() * size / 2 , y: Math.random() * size / 2 + size / 2});
			
			Conf.beziers = U.blobGenerator(pts, controlVar);
		}
		trash.push(Conf);
		return trash.length - 1;
	}
	
	this.destroy = function(id){
	
		for(var i = 0; i < trash.length && trash[i].id != id; i++);
		if(trash[i].id == id){		
			var ret = trash[i].trashness;
			destroyed.push(trash[i]);
			trash[i] = trash[trash.length-1];
			trash.pop();
			return ret;
			}
		return 0;
	}
	
	this.resume = function(){
		for(var i = 0; i < destroyed.length; i++){
			var t = destroyed[i];
			trash.push(t);			
		}
		destroyed = [];
	}
	
	this.draw = function(){
		for(var i = 0; i < trash.length; i++){
				C.save();
				
				var cx= trash[i].size / 2; var cy= trash[i].size / 2
				
				C.translate(trash[i].x, trash[i].y);
				if(trash[i].orbit_active){
					C.rotate(trash[i].orbit_theta);
					C.translate(trash[i].orbit_r, 0);
				}
				if(trash[i].rotate_active)
					C.rotate(-trash[i].rotate_theta);					
				C.translate(-cx, -cy);
				
				C.beginPath();
				C.moveTo(trash[i].beziers[0].p1.x, trash[i].beziers[0].p1.y);
				for(var j = 0; j < trash[i].beziers.length; j++){
					var b = trash[i].beziers[j];
					C.bezierCurveTo(b.c1.x, b.c1.y, b.c2.x, b.c2.y, b.p2.x, b.p2.y);
				}
				
				C.fillStyle = '#585858';
				C.strokeStyle = '#a29e9e'
				C.lineWidth = 10;
				C.stroke();
				C.fill();
				
				C.clip();
				var img = document.createElement('img');
				img.src= 'res/clouds.png'
				C.drawImage(img, -trash[i].texture_offx, -trash[i].texture_offy);
				
				C.restore();	
							
		}
	}
	
	this.drawOne = function(id){
		C.save();
		var i = Trash.getIndex(id);
		C.beginPath();
		var cx= trash[i].size / 2; var cy= trash[i].size / 2
		
		C.translate(trash[i].x, trash[i].y);
		if(trash[i].orbit_active){
			C.rotate(trash[i].orbit_theta);
			C.translate(trash[i].orbit_r, 0);
		}
		if(trash[i].rotate_active)
			C.rotate(-trash[i].rotate_theta);					
		C.translate(-cx, -cy);
		
		C.beginPath();
		C.moveTo(trash[i].beziers[0].p1.x, trash[i].beziers[0].p1.y);
		for(var j = 0; j < trash[i].beziers.length; j++){
			var b = trash[i].beziers[j];
			C.bezierCurveTo(b.c1.x, b.c1.y, b.c2.x, b.c2.y, b.p2.x, b.p2.y);
		}
		
		C.fillStyle = '#585858';
		C.strokeStyle = '#a29e9e'
		C.lineWidth = 10;
		C.stroke();
		C.fill();
		
		C.restore();	
	}
	
	this.nextFrame = function(){
		for(var i = 0; i < trash.length; i++){
				if(trash[i].rotate_active)trash[i].rotate_theta+=trash[i].rotate_speed;
				if(trash[i].orbit_active)trash[i].orbit_theta+=trash[i].orbit_speed;			
			}
		for(var i = 0; i < destroyed.length; i++){
				if(destroyed[i].rotate_active)destroyed[i].rotate_theta+=destroyed[i].rotate_speed;
				if(destroyed[i].orbit_active)destroyed[i].orbit_theta+=destroyed[i].orbit_speed;
			}
	}
	
	this.correlate = function(x, y, id){
		var i = Trash.getIndex(id);
		C.save();
		
		var cx= trash[i].size / 2; var cy= trash[i].size / 2
		
		C.translate(trash[i].x, trash[i].y);
		if(trash[i].orbit_active){
			C.rotate(trash[i].orbit_theta);
			C.translate(trash[i].orbit_r, 0);
		}
		if(trash[i].rotate_active)
			C.rotate(-trash[i].rotate_theta);					
		C.translate(-cx, -cy);

		C.beginPath();
		C.moveTo(trash[i].beziers[0].p1.x, trash[i].beziers[0].p1.y);
		for(var j = 0; j < trash[i].beziers.length; j++){
			var b = trash[i].beziers[j];
			C.bezierCurveTo(b.c1.x, b.c1.y, b.c2.x, b.c2.y, b.p2.x, b.p2.y);
		}
		C.restore();	
		return C.isPointInPath(x, y) || C.isPointInStroke(x, y);
	}
	
	this.boundingBox = function(id){
		var i = this.getIndex(id);
		if(i < 0)return {x: 0, y:0, w:0, h:0};
		
		var t = trash[i]; var x = t.x - t.size/2, y=t.y - t.size / 2;
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
		var cx= trash[i].size / 2; var cy= trash[i].size / 2
		
		C.translate(trash[i].x, trash[i].y);
		if(trash[i].orbit_active){
			C.rotate(trash[i].orbit_theta);
			C.translate(trash[i].orbit_r, 0);
		}
		if(trash[i].rotate_active)
			C.rotate(-trash[i].rotate_theta);					
		C.translate(-cx, -cy);
		
		C.beginPath();
		C.moveTo(trash[i].beziers[0].p1.x, trash[i].beziers[0].p1.y);
		for(var j = 0; j < trash[i].beziers.length; j++){
			var b = trash[i].beziers[j];
			C.bezierCurveTo(b.c1.x, b.c1.y, b.c2.x, b.c2.y, b.p2.x, b.p2.y);
		}
		C.fill();
		
		C.restore();
	}
	
}