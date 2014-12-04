var Ship = function(){
	var This = this;
	var scale = 1, bottomHeight = 7*scale, bottomWidth = 30*scale, bodyHeight = 90*scale, headHeight = 19*scale;			
	
	this.mbMessage = new Controls.MessageBox(); this.mbMessage.hide();
	this.visible = true;
	
	
	//boundingBox
	var maxW = bottomWidth * 1.8, //TODO guarda la bombatura del body!
		maxH = (bottomHeight + bodyHeight + headHeight);  
	
	this.getLength = function(){return maxH};
	
	this.i = { 
		x : 0, y : 0,
		theta : 0,
		speed : 1, acceleration : 0.1,acceleration_theta: 0.02, fuel: 100,
		mass: 1,
		state: 'inBase', // inBase || accelerating || inertial || exploding || blackHole,
		propulsor: false, propulsor_central: false, propulsor_right: false, propulsor_left: false,
		propulsor_anim: 0, explode_anim: 0,
		propulsor_theta: 0
		};
	
	this.set = function(obj, reDraw){
		for(var key in obj)this.i[key] = obj[key];
		if(reDraw)this.draw();
		return this;
	}
	
	this.nextFrame = function(){
		var i = this.i;
		i.propulsor_anim += 0.3;
		i.propulsor = (i.propulsor_central || i.propulsor_right || i.propulsor_left)
		
		if(i.state == 'inertial' || i.state == 'accelerating'){
			if(i.propulsor)this.accelerate();
			gameObjManager.gravityEffect(S);						
			
			//Ship position
			S.i.x += S.i.speed * Math.cos(S.i.theta);
			S.i.y += S.i.speed * Math.sin(S.i.theta);
			
			//Collision
			collisionManager.checkCollision();
		}
	}
	
	this.accelerate = function(){
		var i = this.i;
		if(i.fuel > 0){
			
			
			if(i.propulsor_theta > 0 )i.theta -= i.acceleration_theta
			else if(i.propulsor_theta < 0 )i.theta += i.acceleration_theta
			else i.speed += i.acceleration
			
			i.theta = i.theta % (Math.PI*2)
			if(i.theta < 0) i.theta += Math.PI*2
			i.fuel--;
		}else {i.propulsor_central = false; i.propulsor_right = false; i.propulsor_left = false;}
	}
	
	this.correlate = function(x, y){
		var p = T.pointToWorld(x, y);
		
		T.save();
		T.setId();
		C.translate(S.i.x , S.i.y);
		C.rotate(S.i.theta)
		
		C.beginPath();
		C.moveTo(0, -bottomWidth / 2);
		C.lineTo(bottomHeight, -bottomWidth / 2);
		C.quadraticCurveTo(bottomHeight + bodyHeight / 2, -bodyHeight / 2, bottomHeight + bodyHeight, -bottomWidth /2);
		C.lineTo(bottomHeight + bodyHeight + headHeight, 0);
		C.lineTo(bottomHeight + bodyHeight, +bottomWidth / 2);
		C.quadraticCurveTo(bottomHeight + bodyHeight / 2, bodyHeight / 2, bottomHeight, bottomWidth /2);
		C.lineTo(0, bottomWidth / 2);
		
		T.restore();
		
		return C.isPointInPath(p[0], p[1]) || C.isPointInStroke(p[0], p[1])
	}
	
	this.boundingBox = function(){
		ret = {};

		This.i.theta = This.i.theta % (Math.PI * 2) + (This.i.theta < 0 ? + 2*Math.PI : 0);
		var t = This.i.theta;
		
		if(t >= Math.PI / 2 && t < Math.PI * 3 / 2){
			 ret.x = This.i.x + Math.abs(Math.sin(t)) * maxW / 2;
			 ret.w = -maxH * Math.abs(Math.cos(This.i.theta)) - maxW * Math.abs(Math.sin(This.i.theta));
			 }
		else {
			ret.x = This.i.x - Math.abs(Math.sin(t)) * maxW / 2;
			ret.w = maxH * +Math.abs(Math.cos(This.i.theta)) + maxW * Math.abs(Math.sin(This.i.theta));
		}
		
		if(t > Math.PI){
			ret.y = This.i.y + Math.abs(Math.cos(This.i.theta)) * maxW / 2;
			ret.h = maxH * -Math.abs(Math.sin(This.i.theta)) - maxW * Math.abs(Math.cos(This.i.theta));
		}else{
			ret.y = This.i.y - Math.abs(Math.cos(This.i.theta)) * maxW / 2;
			ret.h = maxH * Math.abs(Math.sin(This.i.theta)) + maxW * Math.abs(Math.cos(This.i.theta));
		}
		
		return ret;
	}
	
	this.bounding = function(C){
		C.translate(S.i.x , S.i.y);
		C.rotate(S.i.theta)
		
	//Silouhette
		C.beginPath();
		C.moveTo(0, -bottomWidth / 2);
		C.lineTo(bottomHeight, -bottomWidth / 2);
		C.quadraticCurveTo(bottomHeight + bodyHeight / 2, -bodyHeight / 2, bottomHeight + bodyHeight, -bottomWidth /2);
		C.lineTo(bottomHeight + bodyHeight + headHeight, 0);
		C.lineTo(bottomHeight + bodyHeight, +bottomWidth / 2);
		C.quadraticCurveTo(bottomHeight + bodyHeight / 2, bodyHeight / 2, bottomHeight, bottomWidth /2);
		C.lineTo(0, bottomWidth / 2);
		C.closePath();
		C.fill();
		
		C.rotate(-S.i.theta)
		C.translate(-S.i.x , -S.i.y);
		
	}
	
	this.draw = function(){			
		if(!this.visible)return;

		T.translate(S.i.x, S.i.y, true);
		C.rotate(S.i.theta)
	
	//Propulsor light
		if(this.i.state == 'accelerating' || this.i.propulsor){
			C.save();
			C.scale(scale, scale);
			
			C.fillStyle = 'white';
			C.strokeStyle = P.INF_detail;
			C.lineWidth = 1;
			C.rotate(S.i.propulsor_theta);
			C.save();
			
			var d = Math.cos(this.i.propulsor_anim) *2
			C.beginPath();
			C.moveTo(-5, -10);
			C.quadraticCurveTo(-7, -15, -23-d, -7+d)
			C.quadraticCurveTo(-10, -5, -23+d, 0)
			C.quadraticCurveTo(-10, 5, -23-d, 7-d)
			C.quadraticCurveTo(-7, 15, -5, 10)
			C.stroke();
			C.fill();
			C.restore();
			
			var d = Math.sin(this.i.propulsor_anim) *3
			C.beginPath();
			C.moveTo(0,-10);
			C.quadraticCurveTo(-10, -20, -20, -10+d)
			C.quadraticCurveTo(-12, -14, -10, -8)
			C.quadraticCurveTo(-10, -5, -20+d, 0)
			C.quadraticCurveTo(-10, 5, -10, 8)
			C.quadraticCurveTo(-12, 14, -20, 10-d)
			C.quadraticCurveTo(-10, 20, 0, 10)
			C.closePath();
			C.fill();
			C.stroke();
			
			C.restore();
		}
	//Silouhette
		C.fillStyle = '#898989';
		C.strokeStyle = 'black';
		C.lineWidth=4;
		
		C.beginPath();
		C.moveTo(0, -bottomWidth / 2);
		C.lineTo(bottomHeight, -bottomWidth / 2);
		C.quadraticCurveTo(bottomHeight + bodyHeight / 2, -bodyHeight / 2, bottomHeight + bodyHeight, -bottomWidth /2);
		C.lineTo(bottomHeight + bodyHeight + headHeight, 0);
		C.lineTo(bottomHeight + bodyHeight, +bottomWidth / 2);
		C.quadraticCurveTo(bottomHeight + bodyHeight / 2, bodyHeight / 2, bottomHeight, bottomWidth /2);
		C.lineTo(0, bottomWidth / 2);
		C.closePath();
		C.stroke();
		C.fill();
		
	//Bottom detail
		C.beginPath();
		C.lineWidth=2;
		C.strokeStyle = '#4c4c4c';
		C.moveTo(0, bottomWidth / 6);
		C.lineTo(bottomHeight, bottomWidth / 6);
		C.moveTo(0, -bottomWidth / 6);
		C.lineTo(bottomHeight, -bottomWidth / 6);
		C.stroke();
		C.beginPath();
		C.lineWidth=1;
		C.moveTo(bottomHeight, bottomWidth/2);
		C.lineTo(bottomHeight, -bottomWidth/2);
		C.stroke();
		
	//Body detail
		//Window
		C.beginPath();
		C.arc(bottomHeight+bodyHeight / 4 * 3, 0, bottomWidth / 3, 0, 2*Math.PI, false);
		C.fillStyle='#8dbbff';
		C.lineWidth = 3;
		C.stroke();
		C.fill();
		
	//Head detail
		C.beginPath();
		C.lineWidth=1;
		C.strokeStyle = '#4c4c4c';
		C.moveTo(bottomHeight+bodyHeight, bottomWidth / 2);
		C.lineTo(bottomHeight+bodyHeight, -bottomWidth / 2);
		C.stroke();
		
		C.rotate(-S.i.theta);
		T.translate(-S.i.x, -S.i.y, true);
	}
	
	this.explodeAnim = function(){
		var f = S.i.explode_anim;
		var i = S.i;
		if(S.i.state != 'exploding')return false;
		C.save();

		var l1 = 15, l2 = 23, l3 = (l1+l2)*2;
		
		if( f < l1){	
		
			S.draw();
			C.fillStyle = 'white';
			C.globalAlpha = f / l1
			S.bounding(C);
			C.fill();
		
			C.translate(i.x + (bottomHeight + bodyHeight + headHeight) / 3 * Math.cos(S.i.theta), i.y + (bottomHeight + bodyHeight + headHeight) / 3 * Math.sin(S.i.theta));
			C.beginPath();
			C.arc(0, 0, f*2, 0, Math.PI*2);
			C.fillStyle = 'white';
			C.strokeStyle = P.INF_detail;
			C.lineWidth = f / 3
			C.stroke();
			C.fill();
			
			C.beginPath();
			C.moveTo(0, -f);
			C.quadraticCurveTo(0, f/15, -f*f, 0)
			C.quadraticCurveTo(0, -f/15, 0, f)
			C.quadraticCurveTo(0, f/15, +f*f, 0)
			C.quadraticCurveTo(0, -f/15, 0, -f)
			C.lineWidth = f / 10;
			C.stroke();
			C.fill();
			
			C.beginPath();C.arc(0, 0, f*2, 0, Math.PI*2);C.fill();
			
			i.explode_anim += 1;
		}
		else if(f < l2 + l1){
			
			C.fillStyle = 'white';
			S.bounding(C);
			C.fill();			
		
			C.translate(i.x + (bottomHeight + bodyHeight + headHeight) / 3 * Math.cos(S.i.theta), i.y + (bottomHeight + bodyHeight + headHeight) / 3 * Math.sin(S.i.theta));
			C.beginPath();
			C.arc(0, 0, f*2, 0, Math.PI*2);
			C.fillStyle = 'white';
			C.strokeStyle = P.INF_detail;
			C.lineWidth = f / 3
			C.stroke();
			C.fill();
			C.globalAlpha = 1 - f / (l1+l2)
			C.beginPath();
			C.moveTo(0, -f);
			C.quadraticCurveTo(0, f/15, -f*f, 0)
			C.quadraticCurveTo(0, -f/15, 0, f)
			C.quadraticCurveTo(0, f/15, +f*f, 0)
			C.quadraticCurveTo(0, -f/15, 0, -f)
			C.lineWidth = f / 10;
			C.stroke();
			C.fill();
			C.globalAlpha = 1;
			C.beginPath();C.arc(0, 0, f*2, 0, Math.PI*2);C.fill();
			
			i.explode_anim += 1;
		}
		else if(f < l1+l2+l3){
			S.mbMessage.show();
			C.globalAlpha = 1 - (f-l1-l2) / (l3);
			C.translate(i.x + (bottomHeight + bodyHeight + headHeight) / 3 * Math.cos(S.i.theta), i.y + (bottomHeight + bodyHeight + headHeight) / 3 * Math.sin(S.i.theta));
			C.beginPath();
			C.arc(0, 0, (l1+l2)*2-(f-l1-l2), 0, Math.PI*2);
			C.fillStyle = 'white';
			C.strokeStyle = P.INF_detail;
			C.lineWidth = l2 / 3
			C.stroke();
			C.fill();
			i.explode_anim += 0.5;
		}
		
		C.restore();
		if(f < l1+l2+l3)return true;
		else {
			
			return false;
		}
	}
}