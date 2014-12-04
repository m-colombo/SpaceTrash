function initEditor(){
	U.init();
	stars = U.starsGenerator(P.width, P.height, 300);
	
	var levelsInARow = 5, margin = 20, TOP = 30, SIDE = 45
	var BLOCK_SIZE = Math.floor(((P.width - SIDE * 2)-margin*(levelsInARow+1)) / levelsInARow);
	

	var buttons = [];
	
	//Load from localStorage custom levels
	var levels = eval(window.localStorage['spaceTrashLevels']);
	if(levels){
		for(var i = 1; i < levels.length+1; i++){
		(function(i){
			new Controls.Button(false, true).set({
			text: levels[i-1],
			textH: 12,
			x: (BLOCK_SIZE + margin) * (i % levelsInARow) + margin + SIDE,
			y: (BLOCK_SIZE + margin) * (Math.floor(i / levelsInARow)) + TOP + margin,
			w: BLOCK_SIZE, h: BLOCK_SIZE
			}, true).setOnClick(function(x, y){
			initLevelEditor(JSON.parse(localStorage['spaceTrashLevel'+levels[i-1].replace(/\s/g, '_')]))})
		})(i)
		}
	}
	
	btNew = new Controls.Button(false, true).set({
			text: 'NEW',
			textH: 20,
			x:  margin + SIDE,
			y:  TOP + margin,
			w: BLOCK_SIZE, h: BLOCK_SIZE
			}, true).setOnClick(function(x, y){initLevelEditor()})
	
	btBack = new Controls.PathButton()
		.set({x: 10, y: 15, w: 20, h: 20, 
			path: function(){
				C.beginPath();
				var s = btBack.Conf.w;
				U.Draw.polygon([[0, s/2], [s/2, 0], [s/2, s/3], [s, s/3], [s, 2*s/3], [s/2, s/3*2], [s/2, s]]);
			}})
		.setOnClick(initSplash);
		
	btSound = new Controls.PathButton()
		.set({x: 40, y: 15, w: 20, h: 20, 
			path: function(){
				C.beginPath();
				var s = btBack.Conf.w;
				C.arc(s/4, 2*s/3, s/6, Math.PI*2, 0);
				C.moveTo(s/4 + s/6, 2*s/3); C.lineTo(s/4 + s/6, 0); C.rect(s/4 + s/6, 0, s/4, s/8	);
				
			}})
		.setOnClick(function(){if(audioPlayer.paused)audioPlayer.play(); else audioPlayer.pause();})
		.setOnMove(function(isIn){btSound.set({path_stroke: (isIn? P.INF_detail2 : (audioPlayer.paused ? P.INF_text : P.INF_detail))}, true); if(isIn)document.body.style.cursor = 'pointer'})
	
	btUp = new Controls.PathButton()
		.set({x: P.width - 15, y: 10, w: 20, h: 20, 
			path: function(){
				C.beginPath();
				var s = btBack.Conf.w;
				C.save(); C.rotate(Math.PI / 2);
				U.Draw.polygon([[0, s/2], [s/2, 0], [s/2, s/3], [s, s/3], [s, 2*s/3], [s/2, s/3*2], [s/2, s]]);
				C.restore();
			}})
		.setOnClick(function(){T.translate(0, 10)});
	
	btDown = new Controls.PathButton()
		.set({x: P.width - 35, y: 55, w: 20, h: 20, 
			path: function(){
				C.beginPath();
				var s = btBack.Conf.w;
				C.save(); C.rotate(-Math.PI / 2);
				U.Draw.polygon([[0, s/2], [s/2, 0], [s/2, s/3], [s, s/3], [s, 2*s/3], [s/2, s/3*2], [s/2, s]]);
				C.restore();
			}})
		.setOnClick(function(){T.translate(0, -10)});
	
	function draw(){
		C.putImageData(stars, 0, 0)
		Controls.drawAll();
	}
	
	animManager.addLoop(draw).start();
}	