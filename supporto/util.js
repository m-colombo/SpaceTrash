// "NAMESPACE"
var U = new function(){
	
	this.init = function(){
		mouseManager.clear();
		kbManager.clear();
		collisionManager.clear();
		animManager.clear();
		Controls.clear();
		gameObjManager.clear();
		Trash.clear();
		Asteroid.clear();
		T.clear();
		C.globalAlpha = 1;
		C.fillStyle = P.background_color;
		C.fillRect(0, 0, P.width, P.height);
		document.body.style.cursor = 'default';
	}

	this.setObjWithDefault = function(obj, def){
		ret = {};
		for(var key in def)ret[key] = def[key];
		for(var key in obj)ret[key] = obj[key];
		return ret;
		}
	
	this.vectorSum = function(a1, m1, a2, m2){
		v1 = [Math.cos(a1) * m1, Math.sin(a1) * m1];
		v2 = [Math.cos(a2) * m2, Math.sin(a2) * m2];
		
		v3 = [v1[0] + v2[0], v1[1] + v2[1]];
		m3 = U.distance(0, 0, v3[0], v3[1]);
		a3 = U.angleBetween(0, 0, v3[0], v3[1]);
		
		return [a3, m3];
	}
	
	this.distance = function(x1, y1, x2, y2){return Math.sqrt( Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2))};
	
	this.angleBetween = function(x1, y1, x2, y2){
		var a = Math.acos((x2 - x1)  / U.distance(x2, y2, x1, y1));
		if(y1 > y2) a = 2*Math.PI - a;
		return a % (2*Math.PI) + (a < 0 ? 2*Math.PI : 0);;
		};
		
	
	this.circleContains = function(cx, cy, r, x, y){return (r > U.distance(cx, cy, x, y))};
	
	this.rectContains = function(x, y, w, h, x1, y1){return ( x1 >= x && x1 <= x+w && y1 >= y && y1 <= y+h)};
	
	//Return, if exists, the rectangle created by the intersection
	//rect obj = {x:, y:, w:, h:}
	this.rectIntersect = function(r1,r2){
		var ret = {x: false, y: false};

		if(r1.h < 0){r1.y += r1.h; r1.h *= -1;}
		if(r1.w < 0){r1.x += r1.w; r1.w *= -1;}
		if(r2.h < 0){r2.y += r2.h; r2.h *= -1;}
		if(r2.w < 0){r2.x += r2.w; r2.w *= -1;}
		
		if((r1.x <= r2.x && r2.x <= r1.x+r1.w) || (r2.x <= r1.x && r1.x <= r2.x+r2.w)){
			ret.x = Math.max(r1.x, r2.x);
			ret.w = Math.min(r1.x+r1.w, r2.x+r2.w) - ret.x;
		}
		
		if((r1.y <= r2.y && r2.y <= r1.y+r1.h) || (r2.y <= r1.y && r1.y <= r2.y+r2.h)){
			ret.y = Math.max(r1.y, r2.y);
			ret.h = Math.min(r1.y+r1.h, r2.y+r2.h) - ret.y;
		}
		
		if(ret.x !== false && ret.y !== false)return ret;
		else return false;
		}
	
	//Return array of bezier's param
	this.blobGenerator = function(pts, controlVar){
		var ret = [];
		var dx1 = Math.random() * controlVar, dy1 = Math.random() * controlVar;
		var dx, dy;
		var c2 = {x: dx1 + pts[0].x,y: dy1 +pts[0].y}
		
		for(var j = 1; j < pts.length; j++){
			var i = j % pts.length;
			var prev = ((i-1) + pts.length) % pts.length;
			c1 = { x: pts[prev].x - (c2.x - pts[prev].x ), y: pts[prev].y - (c2.y - pts[prev].y )};
			dx = (pts[i].x > pts[(i+1)%pts.length].x ? 1 : -1)*Math.random() * controlVar;
			dy = (pts[i].y > pts[(i+1)%pts.length].y ? 1 : -1)*Math.random() * controlVar;			
			c2 = {x:  dx + pts[i].x,y:  dy + pts[i].y };

			ret.push({p1: pts[prev], c1: c1, c2: c2, p2: pts[i] })
		}
		var last = pts.length -1;
		ret.push({p1: pts[last], c1: { x: pts[last].x - dx, y: pts[last].y - dy},
					c2: { x: pts[0].x + dx1 , y: pts[0].y +dy1}, p2: pts[0]})
		return ret;
	}
	
	this.starsGenerator = function(width, height, n){
		var stars = C.createImageData(P.width, P.height);
		stars.data[0] = 255; stars.data[3] = 255;
		for(var i = 0; i < stars.data.length; i+=4)
			{stars.data[i] = 0; stars.data[i+1] = 0; stars.data[i+2] = 0; stars.data[i+3] = 255; }
		for(var i = 0; i < n; i++){
			var s = Math.round(Math.random() * P.width * P.height)*4;
			stars.data[s] = 255; stars.data[s+1] = 255; stars.data[s+2] = 255; 
		}
		return stars;
	}
	
	this.Draw = new function(){
				/*
		this.fireBall = function(cx, cy, r, n, length){
			var da = Math.PI * 2 / n;
			var distance = Math.PI * 2 * r / n;
			
			C.save();
			C.translate(cx, cy);
			
			C.beginPath();
			C.moveTo(r, 0);
			for(var i = 0; i < n; i++){
				C.rotate(da)
				//C.lineTo(Math.cos(da)*(r+length), Math.sin(da)*r)
//				C.quadraticCurveTo(r,Math.sin(da)*(r+length), Math.cos(da)*(r+length), Math.sin(da)*(r+length))
				C.quadraticCurveTo(r,0, r+length, 0)
				C.rotate(da)
				//C.quadraticCurveTo(r,Math.sin(da)*(r+length), Math.cos(da)*(r), Math.sin(da)*r)
				C.quadraticCurveTo(Math.cos(-da)*(r+length),Math.sin(-da)*(r+length), r, 0)
				//C.lineTo(Math.cos(da)*(r), Math.sin(da)*r)
				
				
			}
			C.restore();
		}
		*/
		this.polygon = function(points){
			C.beginPath();
			C.moveTo(points[0][0], points[0][1]);
			for(var i = 1; i < points.length; i++)C.lineTo(points[i][0], points[i][1]);
			C.closePath();

		}
	
		this.string = function(obj, absolute){
			var conf = {text: 'String', x: 0, y: 0, h: 30, fillStyle: 'black', baseline: 'top', stroke:null, align: 'left', fontFamily: 'Calibri', alpha: 1};
			for(var key in obj)conf[key] = obj[key];
			C.save();
			if(absolute)C.setTransform(1, 0, 0, 1, 0, 0);
			C.globalAlpha = conf.alpha;
			C.textAlign = conf.align;
			C.textBaseline = conf.baseline;
			C.font = conf.h+"px "+conf.fontFamily;
			C.fillStyle = conf.fillStyle;
			C.fillText(conf.text, conf.x, conf.y)
			if(conf.stroke){
				C.strokeStyle = conf.stroke;
				C.strokeText(conf.text, conf.x, conf.y);
			}
			var l = C.measureText(conf.text).width;
			C.restore();
			return l;
		}
		
		this.grid = function(obj){
			var conf = {x: 0, y: 0, h: 100, w: 100, lineWidth: 0.5, color: P.INF_detail, space: 10};
			for(var key in obj)conf[key] = obj[key];
			C.save();
			C.translate(conf.x, conf.y);
			C.beginPath();
			C.lineWidth = conf.lineWidth;	
			C.strokeStyle = conf.color;
			
			for(var i = 0; i < conf.h; i+=conf.space){
				C.moveTo(0, i);
				C.lineTo(conf.w, i);
			}
			for(var i = 0; i < conf.w; i+=conf.space){
				C.moveTo(i, 0);
				C.lineTo(i, conf.h);
			}
			C.stroke();
			C.restore();
		}
		
		this.levelPreview = function(x, y, w, h, level, Ship){
			T.save();
			T.translate(x, y);
			
			var scale = Math.max(w, h) / Math.max(level.level_rect.w, level.level_rect.h);
			C.scale(scale, scale);
			C.translate(-level.level_rect.x, -level.level_rect.y);
			var r = level.level_rect;
			if(r.w > r.h)C.translate(0, (r.w-r.h) / 2);
			else C.translate((r.h -r.w) / 2, 0);
			
			//Ship
			var S = (Ship ? Ship : level.ship);
			
			C.translate(S.x, S.y);
			C.rotate(S.theta)
			var size = 7 / scale;
			U.Draw.polygon([[0, -size], [0, +size], [+2*size, 0]]);
			C.fillStyle = P.INF_detail;
			C.fill();
			C.rotate(-S.theta)
			C.translate(-S.x, -S.y);			
			
			//Planet
			for(var j = 0; j < level.planets.length; j++){
				var i = (gameObjManager.get(j) ? gameObjManager.get(j).i : U.setObjWithDefault(level.planets[j], DefaultPlanet));
				C.strokeStyle = i.color;
				C.fillStyle = i.color;
				if(i.orbit_active){
					C.save();
					
					C.beginPath();
					C.arc(i.x, i.y , i.orbit_r, Math.PI * 2, 0);
					C.lineWidth = 1 / scale;
					C.stroke();
					
					C.translate(i.x + Math.cos(i.orbit_theta)*i.orbit_r, i.y + Math.sin(i.orbit_theta)*i.orbit_r);
					C.beginPath();
					C.arc(0, 0, i.r, Math.PI * 2, 0);
					C.fill();
					if(i.destination_objective && level.objective.destination){
						C.lineWidth = 1 / scale;
						C.strokeStyle = 'red';
						
						C.beginPath();
						C.arc(0, 0, i.r/3*2, Math.PI * 2, 0);
						C.stroke();
						
						C.beginPath();
						C.moveTo(i.r/2, 0);
						C.lineTo(-i.r/2, 0);
						C.moveTo(0, i.r/2);
						C.lineTo(0, -i.r/2)
						C.stroke()
						
						C.beginPath();
						C.arc(0, 0, i.r/4, Math.PI * 2, 0);
						C.fill();
					}
					C.restore();
				}else{
					C.save();
					C.translate(i.x, i.y);
					C.beginPath();
					C.arc(0, 0, i.r, Math.PI * 2, 0);
					C.fill();
					if(i.destination_objective && level.objective.destination){
						C.lineWidth = 1 / scale;
						C.strokeStyle = 'red';
						
						C.beginPath();
						C.arc(0, 0, i.r/3*2, Math.PI * 2, 0);
						C.stroke();
						
						C.beginPath();
						C.moveTo(i.r/2, 0);
						C.lineTo(-i.r/2, 0);
						C.moveTo(0, i.r/2);
						C.lineTo(0, -i.r/2)
						C.stroke()
						
						C.beginPath();
						C.arc(0, 0, i.r/4, Math.PI * 2, 0);
						C.fill();
					}
					C.restore();
				}
			}
	
			T.restore();
		}
	
	}
}