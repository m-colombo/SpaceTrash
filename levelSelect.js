function initLevelSelect(){
	U.init();

	stars = U.starsGenerator(P.width, P.height, 300);

	
	var levelsInARow = 5, margin = 20;
	var TOP = 30, SIDE = 45;
	var BLOCK_SIZE = Math.floor(((P.width - SIDE * 2)-margin*(levelsInARow+1)) / levelsInARow);
	
	var i = 0;
	for(i = 0; i < Levels.length; i++){
		(function(j){
			new Controls.Button(false, true).set({
				text: (j+1)+'',
				x: (BLOCK_SIZE + margin) * (j % levelsInARow) + margin + SIDE,
				y: (BLOCK_SIZE + margin) * (Math.floor(j / levelsInARow)) + margin + TOP,
				w: BLOCK_SIZE, h: BLOCK_SIZE
			}, true).setOnClick(function(x, y){initCommunicator(Levels[j])})
		})(i)
	}
	
	var custom = eval(window.localStorage['spaceTrashLevels']);
	if(custom){
		var offset = Math.ceil(((i-1)) / levelsInARow)* levelsInARow
		for(j = offset; j < custom.length + offset; j++){
			(function(j){
				new Controls.Button(false, true).set({
					text: custom[j - offset]+'',
					textH: 12,
					x: (BLOCK_SIZE + margin) * (j % levelsInARow) + margin + SIDE,
					y: (BLOCK_SIZE + margin) * (Math.floor(j / levelsInARow)) + margin + TOP,
					w: BLOCK_SIZE, h: BLOCK_SIZE
				}, true).setOnClick(function(x, y){
				
				var l =localStorage['spaceTrashLevel'+custom[j - offset].replace(/\s/g, '_')];
				initCommunicator(JSON.parse(l))})
			})(j)
		}
	}
	
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
	
	
	animManager.addLoop(function(){
		C.putImageData(stars, 0, 0);
		Controls.drawAll()
		}).start();
	
}