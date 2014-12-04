function initCommunicator(Level, msg){
	U.init();
	
	if(!msg)msg = Level.brief.desc;
	var u = 20; //Drawing unit
	var W = P.width - 2 * u;
	var H = P.height - 2 * u;
	var C1Width = Math.floor((P.width - 2 * u) * 0.3) - u; //Column1 width
	var C2Width = Math.floor((P.width - 2 * u) * 0.7) - u; //Column2 width
	var color ={
		windowBg:  	'#171923',
		grid:		'#04b2cd'
	}
	
	function writeInfo(line, text){
		C.save();
		C.setTransform(1, 0, 0, 1, 0, 0); 
		C.translate(2.5*u, C1Width + 4*u + 60 + line * 20);
		C.beginPath();
		C.rect(0, 0, C1Width - u, 15);
		C.fillStyle = color.windowBg;
		//C.fill();
		U.Draw.string({text: text, x: 0, y: 0, fillStyle: P.INF_text, h: 15});
		C.restore();
	}
	var infoInterval = 40;
	
	btBack = new Controls.PathButton()
		.set({x: 10, y: 15, w: 20, h: 20, 
			path: function(){
				C.beginPath();
				var s = btBack.Conf.w;
				U.Draw.polygon([[0, s/2], [s/2, 0], [s/2, s/3], [s, s/3], [s, 2*s/3], [s/2, s/3*2], [s/2, s]]);
			}})
		.setOnClick(initLevelSelect);
		
	btSound = new Controls.PathButton()
		.set({x: 40, y: 15, w: 20, h: 20, path_stroke: P.INF_detail,
			path: function(){
				C.beginPath();
				var s = btBack.Conf.w;
				C.arc(s/4, 2*s/3, s/6, Math.PI*2, 0);
				C.moveTo(s/4 + s/6, 2*s/3); C.lineTo(s/4 + s/6, 0); C.rect(s/4 + s/6, 0, s/4, s/8);
			}})
		.setOnClick(function(){if(audioPlayer.paused)audioPlayer.play(); else audioPlayer.pause();})
		.setOnMove(function(isIn){btSound.set({path_stroke: (isIn? P.INF_detail2 : (audioPlayer.paused ? P.INF_text : P.INF_detail))}, true); if(isIn)document.body.style.cursor = 'pointer'})
/* Drawing Communication interface 
	points cw*/
	function draw(){
	//Background
		T.setId();
		
		stars = U.starsGenerator(P.width, P.height, 300);
		C.putImageData(stars, 0, 0)
		
		T.translate(u, u);
		
	//Window	
		//Level name box
		T.translate(C1Width + 2*u, u);
		C.beginPath();
		C.rect(0, 0, C2Width - u, 3 * u);
		C.fillStyle = color.windowBg;
		C.strokeStyle = color.grid;
		C.lineWidth = 2;
		C.stroke();
		C.globalAlpha = 0.7;
		C.fill();
		C.globalAlpha = 1;
		
		//Content
		C.translate(0, 4*u);
		U.Draw.polygon([[0, 0], [C2Width - u, 0], [C2Width - u, H - 7 * u], [C2Width - 2*u, H- 6*u], [0, H - 6 * u]]);
		C.strokeStyle = color.grid;
		C.lineWidth = 2;
		C.stroke();
		C.globalAlpha = 0.7;
		C.fillStyle = color.windowBg;
		C.fill();
		C.globalAlpha = 1
		
		
	//Level preview
		T.setId();
		T.translate(2*u, 2*u);
		
		//Background
		U.Draw.polygon([[0, u], [u, 0], [C1Width, 0], [C1Width, C1Width], [0, C1Width]]);
		C.lineWidth = '2';
		C.strokeStyle = color.grid;
		C.stroke();
		C.fillStyle = color.windowBg;
		C.globalAlpha = 0.7;
		C.fill();
		C.globalAlpha = 1;
		
		C.save();
		C.clip();
		U.Draw.grid({x:0, y:0, w:C1Width, h:C1Width, space: u/2});
		U.Draw.levelPreview(0, 0, C1Width, C1Width, Level);
		C.restore();
		
	//Connection info
		T.setId();
		T.translate(2*u, 3*u + C1Width);
		U.Draw.polygon([[0, 0], [C1Width, 0], 	[C1Width, H - C1Width - 3*u],  [0, H - C1Width - 3*u] ]);
		C.strokeStyle = color.grid;
		C.lineWidth = 2;
		C.stroke();
		C.globalAlpha = 0.7;
		C.fillStyle = color.windowBg;
		C.fill();
		C.globalAlpha = 1;
	
	//TEXTS
		T.setId();
		T.save();
		T.translate(C1Width + 3*u, 2*u);
		C.beginPath();
		C.rect(0, 0, C2Width - u, 3 * u);
		C.clip();
		U.Draw.string({text: Level.brief.title,x: C1Width + 2*u + C2Width / 2,y: 3.5*u,h: 40, fillStyle: P.INF_text, align: 'center', baseline: 'middle', fontFamily: 'title'}, true);
		T.restore();
		
	btBack.draw();
	btSound.draw();
	}
	draw();
	
	//ANIMATION: infoBox
	var signalShift = 0;
	var nCurve = 7;
	var curveSPeriod = (C1Width - 20) / nCurve;
	var curveControlHeight = 30;
	
	function noSignal(restore){
		C.save();
		C.setTransform(1, 0, 0, 1, 0, 0);
		C.translate(2*u, 3*u + C1Width);
		
		//Background
		C.beginPath();
		C.rect(10, 10, C1Width -20, 60);
		C.fillStyle = color.windowBg;
		C.fill();
		C.strokeStyle = color.grid;
		C.lineWidth = 1;
		C.stroke();
		C.clip();
		
		//Lines
		C.beginPath();
		C.lineWidth = 0.5;
		C.strokeStyle = 'blue';
		for(var j = 0; j <60; j+=4){
			C.moveTo(10, j+10);
			C.lineTo(C1Width - 10, j+10);
		}
		C.stroke();
		
		/*X
		C.beginPath();
		C.strokeStyle = '#03103d';
		C.lineWidth = 2;
		C.moveTo(10, 40);
		C.lineTo(C1Width -10, 40);
		C.stroke();
		*/
		if(restore)C.restore();
	}
	noSignal(true);
	
	function animSignal(){
		noSignal(false);
		//Signal
		C.beginPath();
		C.strokeStyle = color.grid;
		for(var j = 0; j * curveSPeriod - signalShift < C1Width; j++){
			C.moveTo( -signalShift + j * curveSPeriod, 40);
			C.quadraticCurveTo(-signalShift + (j + 0.5) * curveSPeriod, ( j % 2 == 0 ? 40 - curveControlHeight : 40 + curveControlHeight), -signalShift + (j+1) * curveSPeriod, 40);
			C.stroke();
		}
		
		signalShift = (signalShift+1.5) % (curveSPeriod * 2);
		C.restore();
	}
	
	
	//ANIMATION: mission description
	var textPos = 0;
	var textX = 0; textY = 0;
	
	function animDescription(){
		/*TODO 	-to many rows ?
				-don't break words
		*/
		if(textPos == msg.length){
			//end TIMELINE
			animManager.addTimeline(new animManager.Timeline([
				{time: 0, callback: function(){writeInfo(3, 'Closing connection')}},
				{time: infoInterval, callback: function(){writeInfo(3, '                                        .')}},
				{time: infoInterval*2, callback: function(){writeInfo(3, '                                          .')}},
				{time: infoInterval*3, callback: function(){writeInfo(3, '                                            .')}},
				{time: infoInterval*4, callback: function(){writeInfo(4, 'Connection closed')}},
				{time: infoInterval*4+i, callback: function(){noSignal(true); animManager.stop();}}
			]));
			return false;
		}
		
		C.save();
		C.setTransform(1, 0, 0, 1, C1Width + 4 * u + textX, 7 * u + textY);
		textX +=U.Draw.string({text: msg.charAt(textPos++),x: 0,y: 0,h: 15, fillStyle: color.grid, align: 'left'});
		if(textX > C2Width - 3 * u || msg.charAt(textPos) == '\n'){
			if(msg.charAt(textPos) == '\n')textPos++
			textX = 0; textY += u;}
		
		C.restore();
		
		return true;
	}
	

	// start TIMELINE 
	animManager.addTimeline(new animManager.Timeline([
		{time: 0, callback: function(){writeInfo(0, 'Connecting')}},
		{time: infoInterval, callback: function(){writeInfo(0, '                        .')}},
		{time: infoInterval*2, callback: function(){writeInfo(0, '                          .')}},
		{time: infoInterval*3, callback: function(){writeInfo(0, '                            .')}},
		{time: infoInterval*4, callback: function(){writeInfo(1, 'Connection estabilished')}},
		{time: infoInterval*4+1, callback: function(){animManager.addLoop(animSignal)}},
		{time: infoInterval*5, callback: function(){writeInfo(2, 'Retrieving data')}},
		{time: infoInterval*5+1, callback: function(){animManager.addOneTime(animDescription);}}	
	])).start();
		
	
//BUTTONS
	
	C.setTransform(1, 0, 0, 1, 0, 0);
	//Start mission
	var missionBt = new Controls.Button().set({text: 'Start mission', buttonFill: 'black',textH: u, w: C1Width - u, x: 2.5 * u,y: P.height - 4 * u }, true)
		.setOnClick(function(){animManager.stop();initGame(Level);});

	
}