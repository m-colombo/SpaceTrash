
/* Polyfill
see: http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
*/

(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

var animManager = new function(){
	var looping = [];
	var onetime = [];
	var timeline = [];
	var playing = false;
	var reqId;
	
	this.clear = function(){looping = []; onetime = []; timeline = []; playing = false; window.cancelAnimationFrame(reqId)}
	
	function animation(){
		if(!playing)return;
		reqId = window.requestAnimationFrame(animation);
		
		for(var i = 0; i < looping.length; i++)looping[i]();
		for(var i = 0; i < onetime.length; i++){
			if(!onetime[i]()){
				onetime[i] = onetime[onetime.length - 1];
				onetime.pop();
				i--;
				}
		}
		for(var i = 0; i < timeline.length; i++){
			if(timeline[i].nextEventI >= timeline[i].events.length){
				timeline[i] = timeline[timeline.length -1];
				timeline.pop();
				i--;
			}
			else{
				if(timeline[i].currentTime == timeline[i].events[timeline[i].nextEventI].time){
					timeline[i].events[timeline[i].nextEventI].callback();
					timeline[i].nextEventI++;
				}
				timeline[i].currentTime++;
			}
		}
	}
	
	this.addLoop = function(f){looping.push(f);return this;};
	this.addOneTime = function(f){onetime.push(f); return this;};
	this.addTimeline = function(t){timeline.push(t); return this;};
	
	this.start = function(){if(!playing){playing = true; animation();}};
	this.stop = function(){playing = false;};
	
	this.Timeline = function(t){
		this.events = t; //array of {time: , callback: } ordered by asc. time (= number of frames)
		this.currentTime = 0;
		this.nextEventI = 0;
		this.nextEvent = function(){return this.events[this.nextEventI];};
		}
}