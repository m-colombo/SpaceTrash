/* MOUSE */
var mouseManager = new function(){
	var onClickCallBack = [],
		onMoveCallBack = [],
		onDragCallBack = [], //{onStart, onDrag, onFinish: funtion(){}}
		onDownCallBack = [],
		onUpCallBack = [];
		
	var mousePos = {x:0, y:0},
		downOn = {x: 0, y: 0},
		isDown = false,
		dragging = -1;
	
	this.getMousePos = function(){return mousePos};
	
	this.addOnClick = function(f){onClickCallBack.push(f);};
	this.addOnMove  = function(f){onMoveCallBack.push(f);};
	this.addOnDrag = function(f){onDragCallBack.push(f);};
	this.addOnUp = function(f){onUpCallBack.push(f);};
	this.addOnDown = function(f){onDownCallBack.push(f);};
	
	this.clear = function(){onClickCallBack = []; onMoveCallBack = []; onDragCallBack = []; onUpCallBack = []; onDownCallBack = [];}
	
	this.onDown = function(){isDown = true; downOn.x = mousePos.x; downOn.y = mousePos.y; setTimeout(mouseManager.autoClick, 200);
		var ret = false;
		for(var i = onDownCallBack.length - 1 ; i >= 0 && ret == false; i--)ret = onDownCallBack[i](downOn.x, downOn.y);
	};
	
	this.onUp = function(){ 
		isDown = false;
		if(dragging >= 0)onDragFinish();
		else {
			var ret = false;
			for(var i = onUpCallBack.length - 1 ; i >= 0 && ret == false; i--)ret = onUpCallBack[i](downOn.x, downOn.y);
			mouseManager.onClick();
		}
		};
	
	this.autoClick = function(){
		if(isDown && dragging == -1){		
			setTimeout(mouseManager.autoClick, 30);
			mouseManager.onClick();
		}
	}
	
	this.onClick = function(){
		var ret = false;
		for(var i = onClickCallBack.length - 1 ; i >= 0 && ret == false; i--)ret = onClickCallBack[i](downOn.x, downOn.y);
		}
		
	this.onMove = function(e){
		document.body.style.cursor = 'default';
		//Taking mouse position cause native onClick doesn't provide
		var bBox = canvas.getBoundingClientRect();
		mousePos.x = e.clientX - bBox.left;
		mousePos.y = e.clientY - bBox.top;
		if(isDown && dragging == -1 && (mousePos.x != downOn.x || mousePos.y != downOn.y))onDragStart();
		if(dragging >= 0)onDrag();
		else
			for(var i = onMoveCallBack.length - 1, ret = false ; i >= 0 && ret == false; i--)ret = onMoveCallBack[i](mousePos.x, mousePos.y);
			
		}
	
	function onDragStart(){
		var ret = false;
		var i;
		for(i = onDragCallBack.length - 1; i >= 0 && ret == false; i--)
			ret = onDragCallBack[i].onStart(mousePos.x, mousePos.y);
			
		if(ret)dragging = i+1;
	};

	function onDragFinish(){onDragCallBack[dragging].onFinish();dragging = -1;}; 
	function onDrag(){onDragCallBack[dragging].onDrag(mousePos.x, mousePos.y);}
};

//canvas.addEventListener('click', mouseManager.onClick, false);
canvas.addEventListener('mousemove', mouseManager.onMove, false);
canvas.addEventListener('mousedown', mouseManager.onDown, false);
canvas.addEventListener('mouseup', mouseManager.onUp, false);
