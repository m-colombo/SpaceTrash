/* 
		|a|c|e|
Matrix: |b|d|f|		=	[a, b, c, d, e, f]
		|0|0|1| 
*/


var TCostructor = function(canvas){
	this.scaleFactor = 1;
	this.W2V = [1, 0, 0, 1, 0, 0];
	this.V2W = [1, 0, 0, 1, 0, 0];
	var W2V = this.W2V;
	var V2W = this.V2W;
	var C = canvas;
	var saveStack = [];
	
	this.getW2V = function(){return W2V }
	this.getV2W = function(){return V2W }
	this.setW2V = function(m){W2V = m}
	this.setV2W = function(m){V2W = m}
	
	this.set = function(m){C.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);};
	this.setId = function(){W2V = [1, 0, 0, 1, 0, 0]; V2W=[1, 0, 0, 1, 0, 0]; this.set(W2V); 
	this.scaleFactor = 1;
	};
	
	this.save = function(){ C.save(); saveStack.push({W2V: W2V, V2W: V2W, scale: this.scaleFactor}); }
	this.restore = function(){C.restore(); var last = saveStack.pop(); W2V = last.W2V; V2W = last.V2W; this.scaleFactor = last.scale; this.set(W2V);}
	
	this.clear = function(){
		this.scaleFactor = 1;
		this.saveStack = [];
		this.setId();
	}
	
	this.matrixMul = function(m1, m2){
		m1 = this.toNormalMtx(m1);
		m2 = this.toNormalMtx(m2);
		
		var mRet = [];
		for(var i = 0; i <= 2; i++)
			for(var j = 0; j <= 2; j++)mRet[j * 3 + i] = m1[j*3]*m2[i] + m1[j*3 + 1]*m2[i + 3] + m1[j*3 + 2]*m2[i + 6];
			
		return this.toCanvasMtx(mRet);
	}
	
	this.toCanvasMtx = function(m){return [m[0], m[3], m[1], m[4], m[2], m[5]];}
	
	this.toNormalMtx = function(m){return [m[0], m[2], m[4], m[1], m[3], m[5], 0, 0, 1];}
	
	this.pointToView= function(x, y){return [x*W2V[0] + y*W2V[2] + W2V[4],  x*W2V[1] + y*W2V[3] + W2V[5]];}
	this.pointToWorld = function(x, y){return [x*V2W[0] + y*V2W[2] + V2W[4],  x*V2W[1] + y*V2W[3] + V2W[5]];}
	
	this.translate = function(dx, dy, scaling){
		if(scaling){
			dx *= this.scaleFactor;
			dy *= this.scaleFactor;
		}
		W2V = this.matrixMul([1, 0, 0, 1, dx, dy], W2V);
		V2W = this.matrixMul(V2W, [1, 0, 0, 1, -dx, -dy]);
		this.set(W2V);
	}

	this.scale = function(s){
		if((this.scaleFactor < 5 && s > 1)||(this.scaleFactor > 0.1 && s < 1)){
			this.translate(-P.width / 2, -P.height / 2);
			this.scaleFactor *= s;
			W2V = this.matrixMul([s, 0, 0, s, 0, 0], W2V);
			this.set(W2V);
			V2W = this.matrixMul(V2W, [1/s, 0, 0, 1/s, 0, 0]);
			this.translate(P.width / 2, P.height / 2);
		}
	}
}

var T = new TCostructor(C);
	