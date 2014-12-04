Controls = new function(){	
	var activeControls = [];
	this.clear = function(){
		activeControls = [];
	}
	
	this.drawAll = function(){
		for(var i = 0; i < activeControls.length; i++)
			if(activeControls[i].isVisible)activeControls[i].draw();
	}

	this.BaseControl = function(notPush){
		if(!notPush)activeControls.push(this);
		this.Conf = {};
		var visible = true;
		
		this.isVisible = function(){return visible;};
		
		this.show = function(){visible = true;};
		this.hide = function(){visible = false;}
		
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
		
		this.setDraw = function(f){this.draw = function(){if(visible)f();}; return this;};
		this.setCorrelate = function(f){this.correlate = function(x, y){if(visible)return f(x, y);else return false;}; return this;}
		this.setOnClick = function(f){
			var obj = this; //Allow to reference 'this' also inside the callback function using the function's closure. Is necessary cause of how Js bound the special variable this. see: http://bitstructures.com/2007/11/javascript-method-callbacks.html				
			
			if(!this.onClick)mouseManager.addOnClick(function(x, y){if(obj.correlate(x, y) && visible){obj.onClick();return true;}else return false;});
			this.onClick = f;
			return this;
		}
		this.setOnMouseDown = function(f){
			var obj = this; //Allow to reference 'this' also inside the callback function using the function's closure. Is necessary cause of how Js bound the special variable this. see: http://bitstructures.com/2007/11/javascript-method-callbacks.html				
			
			if(!this.onDown)mouseManager.addOnDown(function(x, y){if(obj.correlate(x, y) && visible){obj.onDown(x, y);return true;}else return false;});
			this.onDown = f;
			return this;
		}
		this.setOnMouseUp = function(f){
			var obj = this; //Allow to reference 'this' also inside the callback function using the function's closure. Is necessary cause of how Js bound the special variable this. see: http://bitstructures.com/2007/11/javascript-method-callbacks.html				
			
			if(!this.onUp)mouseManager.addOnUp(function(x, y){if(obj.correlate(x, y) && visible){obj.onUp(x, y);return true;}else return false;});
			this.onUp = f;
			return this;
		}
		this.setOnMove = function(f){
			var obj = this;
			if(!this.onMove)mouseManager.addOnMove(function(x, y){if(visible)obj.onMove(obj.correlate(x, y));return false;});
			this.onMove = f;
			return this;
		}
		this.setOnDrag = function(onDrag){ //onStart and onFinish are not exposed
			var obj = this;
			if(!this.onDrag)mouseManager.addOnDrag({
				onStart: function(x, y){if(visible)return obj.correlate(x, y); else return false;},
				onDrag: function(x, y){if(visible)obj.onDrag(x, y);}, 
				onFinish: function(){}});
			this.onDrag = onDrag;
			
			return this;
		}
	}

	this.Button = function(notPush, inWorld){
		Controls.BaseControl.call(this); //Construct new BaseControl in 'this' scope, so buttons doesn't share the same object-prototype
		var bt = this;
		this.set({text: '', x: 0, y:0, w: 100, h: 30, textH: 30, strokeWidth: 1, buttonFill: 'black', strokeStyle: P.INF_detail, textFill: P.INF_detail}, false)
			.setDraw(function(){
				var B = bt.Conf;
				C.save();
				if(!inWorld)
					C.setTransform(1, 0, 0, 1, 0, 0);
				C.translate(B.x, B.y);
				C.beginPath();
				C.rect(0, 0, B.w, B.h);
				C.fillStyle = B.buttonFill;
				C.strokeStyle = B.strokeStyle;
				C.lineWidth = B.strokeWidth;
				C.stroke();
				C.fill();
				C.clip();
				U.Draw.string({text: B.text,x: B.w / 2,y: B.h / 2,h: B.textH,fillStyle: B.textFill, baseline: 'middle', align: 'center'});
				C.restore();
			})
			.setCorrelate(function(x, y){
				if(inWorld){
					var p = T.pointToWorld(x, y);
					x=p[0];
					y=p[1];
				}
			
				return U.rectContains(bt.Conf.x, bt.Conf.y, bt.Conf.w, bt.Conf.h, x, y);
				
				})
			.setOnMove(function(isIn){bt.set({strokeStyle: (isIn?P.INF_detail2:P.INF_detail)}, true); if(isIn)document.body.style.cursor = 'pointer'})
			.setOnClick(function(){alert('click');});
	}
	this.Button.prototype = new this.BaseControl();
	this.Button.prototype.constructor = this.Button;
	
	this.PathButton = function(){
		Controls.BaseControl.call(this);
		var bt = this;
		this.set({x: 0, y:0, w: 100, h: 30, text: undefined, textFill: P.INF_text, textH: 20, path_stroke: P.INF_detail, path_fill: 'black', path: undefined}, false)
			.setDraw(function(){
				var B = bt.Conf;
				T.save();
				T.setId();
				T.translate(B.x, B.y);
				
				if(B.path){
					C.fillStyle = B.path_fill;
					C.strokeStyle = B.path_stroke;
					C.lineWidth = 1.5;
					B.path(); 
					C.fill();
					C.stroke();
				}
				if(B.text){
					U.Draw.string({text: B.text, x: B.w / 2 , y: B.h / 2 - 1.5, baseline: 'middle', align: 'center', fillStyle: B.textFill, h: B.textH})
				}
	
				T.restore();
			})
			.setCorrelate(function(x, y){
				T.save(); T.setId(); T.translate(bt.Conf.x, bt.Conf.y); bt.Conf.path(); T.restore();var ret = C.isPointInPath(x, y) || C.isPointInStroke(x, y); return ret;
			})
			.setOnMove(function(isIn){bt.set({path_stroke: (isIn?P.INF_detail2:P.INF_detail)}, true); if(isIn)document.body.style.cursor = 'pointer'})
	}
	this.PathButton.prototype = new this.BaseControl();
	this.PathButton.prototype.constructor = this.PathButton;
	
	this.Label = function(){
		Controls.BaseControl.call(this);
		var ctrl = this;
		
		this.setOnChange = function(f){this.onChange = f; return this;}
		
		this.set({x: 0, y: 0, w: 100, label: 'Label', text: 'Text', text_height: 12, font: 'Calibri', background: P.INF_background, stroke: P.INF_detail}, false)
			.setDraw(function(){
				T.save();
				T.setId();
				var I = ctrl.Conf;
				T.translate(I.x, I.y);
				C.beginPath();
				C.rect(-1, -1, I.w+2, I.text_height+2 )
				C.fillStyle = I.background;
				C.strokeStyle = I.stroke;
				C.stroke();
				C.fill();
				var l = U.Draw.string({text: I.label, x: 0, y: I.text_height/2, fillStyle: P.INF_text, h: I.text_height, baseline: 'middle', align: 'left', fontFamily: I.font})
				C.beginPath();
				C.rect(l, 0, I.w - l, I.w);
				C.clip();
				U.Draw.string({text: I.text, x: I.w, y: I.text_height/2, fillStyle: P.INF_text, h: I.text_height, baseline: 'middle', align: 'right', fontFamily: I.font})
				T.restore();
				})
			.setCorrelate(function(x, y){ return U.rectContains(ctrl.Conf.x, ctrl.Conf.y, ctrl.Conf.w, ctrl.Conf.text_height, x, y) })
			.setOnMove(function(isIn){ if(isIn)document.body.style.cursor = 'pointer'; ctrl.set({stroke: (isIn ? P.INF_detail2 : P.INF_detail)}, true)})
			.setOnClick(function(x, y){ var t = prompt(ctrl.Conf.label, ctrl.Conf.text); if(t){ctrl.Conf.text = t; ctrl.onChange(ctrl.Conf.text)}})
		}
	this.Label.prototype = new this.BaseControl();
	this.Label.prototype.constructor = this.Label;
	
	this.Switch = function(){
		Controls.BaseControl.call(this);
		var ctrl = this;
		var changeCallback = function(){};
		this.setOnChange = function(f){ changeCallback = f; return this}
		this.toggle  = function(){
			ctrl.set({state: !ctrl.Conf.state}, true); changeCallback(ctrl.Conf.state);
		}
		
		this.set({x:40, y:40, w: 120, size: 20, state: false, label: ' Switch ', label_height: 12, label_font: 'Calibri', stroke: P.INF_detail}, false)
			.setDraw(function(){
				T.save();
				T.setId();
				var Conf = ctrl.Conf;
				T.translate(Conf.x, Conf.y);
				C.beginPath();
				C.arc(Conf.size / 2,Conf.size / 2, Conf.size/2 , 0, Math.PI * 2, false); 
				C.fillStyle = 'black'; C.fill();
				C.strokeStyle = Conf.stroke;; C.lineWidth = 1; C.stroke();
				if(Conf.state){
					C.beginPath();
					C.arc(Conf.size / 2,Conf.size / 2, Conf.size*3/8  , 0, Math.PI * 2, false); 
					C.fillStyle = P.INF_detail2; C.fill();
				}
				
				//Label
				C.textBaseline = 'middle';
				C.textAlign = 'left';
				C.font = Conf.label_height+"px "+Conf.label_font;
				var label_length = C.measureText(Conf.label).width;	
				C.beginPath();
				T.translate(Conf.size, Conf.size / 2);
				C.moveTo(0, 0); C.lineTo(Conf.w, 0); C.strokeStyle = P.INF_detail; C.stroke();
				C.rect(Conf.w - label_length, -Conf.label_height / 2 , label_length, Conf.label_height);
				C.fillStyle = P.INF_detail;
				C.fill();
				
				C.fillStyle = 'black';
				C.fillText(Conf.label, Conf.w - label_length, 0);
				
				T.restore();
				})
			.setCorrelate(function(x, y){return U.distance(ctrl.Conf.x + ctrl.Conf.size / 2, ctrl.Conf.y + ctrl.Conf.size / 2, x, y) <= ctrl.Conf.size / 2;})
			.setOnMove(function(isIn){ if(isIn)document.body.style.cursor = 'pointer'; ctrl.set({stroke: (isIn ? P.INF_detail2 : P.INF_detail)}, true)})
			.setOnClick(function(){ this.toggle();} );
	}
	this.Switch.prototype = new this.BaseControl();
	this.Switch.prototype.constructor = this.Switch;
	
	this.Slider = function(){
		Controls.BaseControl.call(this);
		var sl = this;
		this.set({x:0, y:0, w:150, h: 20, 
					segment_number: 10, segment_interspace: 3, side_margin: 3, full_value: 100, value: 100, background: 'black',
					cursor_position: 0, cursor_size: 4, cursor_fill: P.INF_detail, show_cursor: true,
					cursor_lock: false, cursor_label: 'CLabel', show_cursor_label: true, cursor_label_color: P.INF_detail, cursor_label_height: 10, cursor_label_font: 'Calibri',
					label: 'Label', show_label: true, label_height: 10, label_font: 'Calibri'
					}, false)
			.setDraw(function(){
				var Conf = sl.Conf;
				T.save();
				T.setId();
				T.translate(Conf.x, Conf.y);
				
				//Background
				C.beginPath();
				C.rect(0, 0, Conf.w, Conf.h);
				C.save();
				C.clip();
				C.fillStyle = Conf.background;
				C.fill();
				
				
				//Level
				C.beginPath();
				C.rect(0, Conf.side_margin, Conf.w * (Conf.value / Conf.full_value), Conf.h - 2 * Conf.side_margin);
				C.fillStyle = P.INF_detail2;
				C.fill();
				
				//Grid effect
				C.beginPath();
				for(var i = 1; i < Conf.segment_number; i++){
					C.rect((i-1) * Conf.segment_interspace + i * (( Conf.w - Conf.segment_interspace * (Conf.segment_number -1)) / Conf.segment_number),
						Conf.side_margin, Conf.segment_interspace, Conf.h - 2*Conf.side_margin);
				}
				C.fillStyle = Conf.background;
				C.fill();
				
				//Cursor
				if(Conf.show_cursor){
					if(Conf.cursor_position < 0)Conf.cursor_position = 0;
					if(Conf.cursor_position > Conf.full_value)Conf.cursor_position = Conf.full_value;
					
					C.fillStyle = Conf.cursor_fill;
					T.save();
					T.translate(Conf.w * (Conf.cursor_position / Conf.full_value), 0);
					U.Draw.polygon([[0, 2*Conf.cursor_size], [-Conf.cursor_size,0], [Conf.cursor_size, 0]]);
					C.fill();
					T.translate(0, Conf.h);
					U.Draw.polygon([[0, - 2*Conf.cursor_size], [-Conf.cursor_size,0], [Conf.cursor_size, 0]]);
					C.fill();
					T.restore();
				}
				//Cursor Label
				C.restore();
				if(Conf.show_cursor_label){
					T.translate(0, -Conf.cursor_label_height - 3);
					C.beginPath();
					C.rect(-1, 0, Conf.w+2, Conf.cursor_label_height + 4);
					C.fillStyle = P.INF_background;
					C.fill();
					
					C.textBaseline = 'top';
					C.textAlign = 'left';
					C.font = Conf.cursor_label_height+"px "+Conf.cursor_label_font;
					var label_length = C.measureText(Conf.cursor_label_text).width;						
					
					U.Draw.polygon([[0, 0], [label_length, 0], [label_length, Conf.cursor_label_height ], [0, Conf.cursor_label_height ]]);	
					C.fillStyle = P.INF_detail;
					C.fill();
					
					C.beginPath();
					C.moveTo(label_length / 2, Conf.cursor_label_height - 1);
					C.lineTo(Conf.w * (Conf.cursor_position / Conf.full_value), Conf.cursor_label_height - 1);
					C.lineTo(Conf.w * (Conf.cursor_position / Conf.full_value), Conf.cursor_label_height + Conf.cursor_size);
					C.strokeStyle = P.INF_detail;
					C.lineWidth = 1;
					C.stroke();
					
					C.fillStyle = 'black';
					C.fillText(Conf.cursor_label_text, 0, 0)
					T.translate(0, +Conf.cursor_label_height + 3);
				}
				
				//Label
				if(Conf.show_label){
					T.translate(0, Conf.h);
					
					C.textBaseline = 'top';
					C.textAlign = 'left';
					C.font = Conf.label_height+"px "+Conf.label_font;
					var label_length = C.measureText(Conf.label).width;						
					
					var u = Conf.label_height / 2;
					U.Draw.polygon([[0, 0], [label_length + u, 0], [label_length, Conf.label_height], [0, Conf.label_height]]);
					C.fillStyle = 'black';
					C.fill();
					C.fillStyle = P.INF_text;
					C.fillText(Conf.label, 0, 0);
				}
				
			T.restore();
			})
			.setCorrelate(function(x, y){return U.rectContains(sl.Conf.x, sl.Conf.y, sl.Conf.w, sl.Conf.h, x, y);})
			.setOnMove(function(isIn){if(isIn && !sl.get('cursor_lock'))document.body.style.cursor = 'pointer';})
			.setOnDrag(function(){if(sl.get('cursor_lock'))return; sl.set({cursor_position: (mouseManager.getMousePos().x-sl.Conf.x) / sl.Conf.w * sl.Conf.full_value }, true);})
			.setOnClick(function(){if(sl.get('cursor_lock'))return; sl.set({cursor_position: (mouseManager.getMousePos().x-sl.Conf.x) / sl.Conf.w * sl.Conf.full_value }, true)})
	}
	this.Slider.prototype = new this.BaseControl();
	this.Slider.prototype.constructor = this.Slider;
	
	this.MessageBox = function(){
		Controls.BaseControl.call(this);
		var mb = this.Conf;
		var visible = true;
		
		this.set({title: 'Mission Failed!', title_h: 10, title_font: 'title', box_height: 100}, false)
			.setDraw(function(){
				if(!visible)return;
				T.save();
				T.setId();
				C.font = mb.title_h+'px  '+mb.title_font;
				var title_width = C.measureText(mb.title).width;
				var box_width = Math.max(P.width / 2, title_width);
				
				C.translate(P.width / 2 - box_width / 2, P.height / 2 - mb.box_height / 2);
				
				C.beginPath();
				C.rect(0, 0, box_width, mb.box_height);
				C.fillStyle = P.INF_background;
				C.strokeStyle = P.INF_detail;
				C.lineWidth = 3;
				C.stroke();
				C.globalAlpha = 0.8
				C.fill();
				
				U.Draw.string({text: mb.title, fillStyle: P.INF_text, fontFamily: mb.title_font, align: 'center', x: box_width / 2});
				
				T.restore();
			});
		this.bt1 = new Controls.Button().set({text: 'Retry', x: P.width / 2 - 130, y: P.height / 2});
		this.bt2 = new Controls.Button().set({text: 'Levels', x: P.width / 2 + 30, y: P.height / 2});
		
		this.show = function(){visible = true; this.bt1.show(); this.bt2.show();}
		this.hide = function(){visible = false; this.bt1.hide(); this.bt2.hide();}
		this.isVisible = function(){return visible}
		
	}
	this.MessageBox.prototype = new this.BaseControl();
	this.MessageBox.prototype.constructor = this.MessageBox;
}