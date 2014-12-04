/* MOUSE */
var kbManager = new function(){
	var onKeyPressCallback = [];
	var onKeyDownCallback = [];
	var onKeyUpCallback = [];
	var active = true;
	
	this.suspend = function(){ active = false}
	this.resume = function(){ active = true}
	
	this.addOnKeyPress = function(keycodes, f){
		onKeyPressCallback.push(
			function(e){
				if(keycodes.indexOf(e.keyCode) != -1 || keycodes.indexOf(e.charCode) != -1)return f();
				else return false;
				});};
	this.addOnKeyDown = function(keycodes, f){
		onKeyDownCallback.push(
			function(e){
				if(keycodes.indexOf(e.keyCode) != -1 || keycodes.indexOf(e.charCode) != -1)return f();
				else return false;
				});};
	this.addOnKeyUp = function(keycodes, f){
		onKeyUpCallback.push(
			function(e){
				if(keycodes.indexOf(e.keyCode) != -1 || keycodes.indexOf(e.charCode) != -1)return f();
				else return false;
				});};
				
	this.clear = function(){onKeyPressCallback = [];onKeyDownCallback = []; onKeyUpCallback = []; active = true;}

	
	this.onKeyPress = function(e){
		var ret = false;
		for(var i = onKeyPressCallback.length - 1 ; i >= 0 && ret == false && active; i--)ret = onKeyPressCallback[i](e);
		}
	this.onKeyUp = function(e){
		var ret = false;
		for(var i = onKeyUpCallback.length - 1 ; i >= 0 && ret == false && active; i--)ret = onKeyUpCallback[i](e);
		}
	this.onKeyDown = function(e){
		var ret = false;
		for(var i = onKeyDownCallback.length - 1 ; i >= 0 && ret == false && active; i--)ret = onKeyDownCallback[i](e);
		}
};

document.addEventListener('keypress', kbManager.onKeyPress, true);
document.addEventListener('keyup', kbManager.onKeyUp, true);
document.addEventListener('keydown', kbManager.onKeyDown, true);