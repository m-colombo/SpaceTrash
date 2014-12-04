var collisionManager = new function(){
	
	var INTERVAL = 2, COUNT = 0;
	
	var canvas = document.createElement('canvas');
	var C = canvas.getContext('2d');
	canvas.width = P.width; canvas.height = P.height;
	
	var T1 = new TCostructor(C);
	
	/*DEBUG
	canvas.style.border ='1px solid black';
	document.body.appendChild(canvas);
	ENDEBUG*/
	
	var collisionCallback = [],
		collisionBox = [],
		collisionBounding = [],
		listenerName = [],
		inactive = [];
	
	this.clear = function(){collisionCallback = [];collisionBox = [];collisionBounding = []; inactive = []; listenerName = [];}
	
	this.addCollisionListener = function(boundingBox1, boundingBox2, bounding1, bounding2, callback, name){
		collisionCallback.push(callback);
		collisionBox.push([boundingBox1, boundingBox2]);
		collisionBounding.push([bounding1, bounding2]);
		listenerName.push(name);
	}
	
	this.removeListener = function(name, notToResume){
		for(var i = 0; i < listenerName.length && listenerName[i] != name; i++);
		if(listenerName[i] == name){
			if(!notToResume)inactive.push({callback: collisionCallback[i], box: collisionBox[i], bounding: collisionBounding[i], name: listenerName[i]});
			listenerName[i] = listenerName[listenerName.length -1];
			collisionBounding[i] = collisionBounding[collisionBounding.length -1];
			collisionBox[i] = collisionBox[collisionBox.length -1];
			collisionCallback[i] = collisionCallback[collisionCallback.length -1];
			listenerName.pop();
			collisionCallback.pop();
			collisionBounding.pop();
			collisionBox.pop();
		}
	}
	
	this.resume = function(){
		for(var i = 0; i < inactive.length; i++){
			var c = inactive[i];
			collisionCallback.push(c.callback);
			collisionBox.push(c.box);
			collisionBounding.push(c.bounding);
			listenerName.push(c.name);
		}
		inactive = []
	}
	
	this.debugCollisionGrid = function(imageData, i, collision){
		imageData.data[i] = 0; imageData.data[i+1] = 0; imageData.data[i+2] = 0;
		C.globalCompositeOperation = 'source-over';		
		C.putImageData(imageData, 10 + collision.w, 10 + collision.h);
		C.beginPath();
		C.rect(10 + collision.x + collision.w, 10 + collision.y + collision.h, collision.w, collision.h); C.stroke();
		C.globalCompositeOperation = 'lighter';						
	}
	
	this.checkCollision = function(){
		if(COUNT++ % INTERVAL != 0)return; 
		
		C.globalCompositeOperation = 'lighter';
		
		/*DEBUG
		C.clearRect(0, 0, P.width, P.height);
		ENDEBUG*/
		
		T1.setId();
		for(var i = 0; i < collisionBox.length; i++){
			
			var collision = U.rectIntersect(collisionBox[i][0](), collisionBox[i][1]());
			
			/*DEBUG
			C.fillStyle = '#00FF00';
			collisionBounding[i][0](C);
			C.fillStyle = '#FF0000';
			collisionBounding[i][1](C);
			ENDEBUG*/
			
			if(collision !== false){
				collision.w = Math.ceil(collision.w)
				collision.h = Math.ceil(collision.h)
				
				C.translate(-collision.x, -collision.y);
				C.clearRect(collision.x, collision.y, collision.w, collision.h);
				C.fillStyle = '#00FF00';
				collisionBounding[i][0](C);
				C.fillStyle = '#FF0000';
				collisionBounding[i][1](C);
				
				var imageData = C.getImageData(0, 0, collision.w, collision.h);
				var data = imageData.data; //Access to .data is realy slow!
				
				var detected = false;
				var total_pixel_checked = 0;
				
				//Spiral search BEGIN
				var x = Math.round(collision.w/2); y = Math.round(collision.h/2);
				var step_grain = 5;
				var step = step_grain; 			
				var pixel_grain = 10;
				
				var check = function(x1, y1, x2, y2){
					if(x1 == x2){ //Vertical search
						if(y1 > y2){ start = y2; end = y1; }
						else { start = y1; end = y2}
						
						for(var k = start; k <= end && !detected; k+=pixel_grain){
							total_pixel_checked++;
							var index = (k * collision.w + x1) * 4;
							if(data[index] == 255 && data[index+1] == 255){
								detected = true;
								console.log('Collision detected after '+total_pixel_checked+'pixels');
								collisionCallback[i]();
							}
							/*DEBUG
							collisionManager.debugCollisionGrid(imageData, index, collision);
							ENDEBUG*/
						}
					}
					else{
						if(x1 > x2){ start = x2; end = x1; }
						else { start = x1; end = x2}
						
						for(var k = start; k <= end && !detected; k+=pixel_grain){
							total_pixel_checked++;
							var index = (y1 * collision.w + k) * 4;
							if(data[index] == 255 && data[index+1] == 255){
								detected = true;
								console.log('Collision detected after '+total_pixel_checked+'pixels');
								collisionCallback[i]();
							}
							/*DEBUG
							collisionManager.debugCollisionGrid(imageData, index, collision);
							ENDEBUG*/
						}
					}
				}
				
				while(!detected && step < Math.max(collision.w, collision.h)){
					//Up
					if(x > 0)
						check(x, Math.min(y, collision.h), x, Math.max(0, y - step));
					y -= step;
					
					//Right
					if(y > 0)
						check(Math.max(x, 0), y, Math.min(x + step, collision.w), y);
					x += step;
					
					//Down
					step+=step_grain;
					if(x < collision.w)
						check(x, Math.max(0, y), x, Math.min(y + step, collision.h));
					y += step;
					
					//Left
					if(y < collision.h)
						check(Math.min(x, collision.w), y, Math.max(0, x - step));
					x -= step;
					
					step+=step_grain;
				}
				C.translate(collision.x, +collision.y);
			}
		}
	}
}