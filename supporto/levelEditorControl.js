var EditorControls = function(L){
	
	var A = [];
	var EC = this;
	
	
	this.serialize = function(){
		var planet = [], trash = [], asteroid = [];
		for(var i = 0; i < A.length; i++){
			switch(A[i].type){
				case 'planet': planet.push(A[i].getObj()); break;
				case 'trash': trash.push(A[i].getObj()); break;
				case 'asteroid': asteroid.push(A[i].getObj()); break;
			}
		}
		return {planet: planet, trash: trash, asteroid: asteroid}
	}
	
	function onTop(o){ 		
		A[A.length - 1].Interface.hide();
		A.push(A.splice(A.indexOf(o), 1)[0])
		o.Interface.show();
		}
	
	this.correlate = function(x, y){
		if(y < 50 || y > P.height - 50)return undefined;
		var find = false, i = A.length -1
		while(!find && i >= 0)find = A[i--].correlate(x, y)
		if(find)return A[i+1]; 
		else return undefined
	}
	
	this.remove = function(o){
		A.splice(A.indexOf(o), 1)
	}
	
	mouseManager.addOnClick(function(x, y){
		var o = EC.correlate(x, y); 
		if(o)o.onClick(x, y)
		else if(y > 50 && y < P.height - 50)onTop(EC.Level)
		}
		);
	mouseManager.addOnDown(function(x, y){var o = EC.correlate(x, y); if(o)o.onDown(x, y)});
	mouseManager.addOnUp(function(x, y){var o = EC.correlate(x, y); if(o)o.onUp(x, y)});
	mouseManager.addOnMove(function(x, y){var o = EC.correlate(x, y); for(var i = 0; i < A.length; i++)A[i].onMove(A[i] == o)});
	
	var dragging = undefined;
	mouseManager.addOnDrag({
				onStart: function(x, y){dragging = EC.correlate(x,y); return dragging;},
				onDrag: function(x, y){dragging.onDrag(x, y); }, 
				onFinish: function(){dragging = undefined;}});
	
	this.drawAll = function(){for(var i = 0; i < A.length; i++)A[i].draw(); A[i - 1].Interface.draw();}
	
	this.Control = function(obj){
		if(A.length > 0  && A[A.length -1].Interface)A[A.length-1].Interface.hide();
		A.push(this);
		
		var visible = true;
		this.Conf = {};
		var THIS = this;
		var obj = obj;
		this.getObj = function(){ return obj};
		
		this.set = function(obj, reDraw, forceRedraw){
			var changed = false;
			for(var key in obj){
				changed = changed || this.Conf[key] != obj[key];
				this.Conf[key] = obj[key];
			}
			if((reDraw && changed) || forceRedraw)this.draw();
			return this;
		}
		this.get = function(key){ return this.Conf[key]; }
		
		this.onClick = function(x, y){onTop(THIS);};
		this.onDrag = function(x, y){onTop(THIS);};
		this.onMove = function(isIn){if(isIn)document.body.style.cursor = 'pointer';};
		this.onUp = function(){};
		this.onDown = function(){};
		
		this.setDraw = function(f){this.draw = function(){if(visible)f();}; return this;};
		this.setCorrelate = function(f){this.correlate = f; return this;}
		this.setOnClick = function(f){ this.onClick = function(x, y){ f(); onTop(THIS); }; return this }
		this.setOnMouseDown = function(f){ this.onDown = f;	return this; }
		this.setOnMouseUp = function(f){ this.onUp = f; return this; }
		this.setOnMove = function(f){ this.onMove = function(isIn){if(isIn)document.body.style.cursor = 'pointer'; f(isIn);}; return this;	}
		this.setOnDrag = function(onDrag){ this.onDrag = function(x, y){onTop(THIS); onDrag(x, y)}; return this; }
	}
	
	this.ObjectInterface = function(){
		this.visible = true;
		
		var THIS = this;
		var controls = [];
		
		this.hide = function(){ for(var i = 0; i < controls.length; i++)controls[i].hide(); this.visible = false;}
		this.show = function(){ for(var i = 0; i < controls.length; i++)controls[i].show(); this.visible = true;}
		
		this.draw = function(){if(!THIS.visible)return; for(var i = 0; i < controls.length; controls[i++].draw());}
		this.setDraw = function(f){
			this.draw = function(){
				if(!THIS.visible)return;
				f();
				for(var i = 0; i < controls.length; controls[i++].draw());
			}
		}
		
		this.addControl = function(c){if(!THIS.visible)c.hide(); else c.show(); controls.push(c);}
	}

	this.Level =  new EC.Control()
			.setDraw(function(){})
			.setCorrelate(function(){return false;})
			.setOnMouseDown(function(x, y){})
			.setOnDrag(function(x, y){})
	var level = this.Level
			
		this.Level.Interface = new EC.ObjectInterface();
		this.Level.Interface.setDraw(function(){
			T.save();
			T.setId();
			C.beginPath();
			C.fillStyle = P.INF_background;
			C.strokeStyle = P.INF_detail
			C.rect(0, P.height - 50, P.width, 50);
			C.stroke();
			C.globalAlpha = 0.7
			C.fill();
			T.restore();
		});
	this.Level.onTop = function(){onTop(level)};	
		//Mission title, desc, Objective trash
				
		var title_label = new Controls.Label(true)
			.set({label: ' Mission name: ', text: L.brief.title, w: 200, x: 10, y: P.height - 31})
			.setOnChange(function(val){L.brief.title = val})
		this.Level.Interface.addControl(title_label);
		
		var desc_label = new Controls.Label(true)
			.set({label: ' Description: ', text: L.brief.desc, w: 360, x: 220, y: P.height - 31})
			.setOnChange(function(val){L.brief.desc = val})
		this.Level.Interface.addControl(desc_label);

		var trash_label = new Controls.Label(true)
			.set({label: ' Trash objective: ', text: L.objective.trash, w: 200, x: 590, y: P.height - 31})
			.setOnChange(function(val){L.objective.trash = val})
		this.Level.Interface.addControl(trash_label);
	}