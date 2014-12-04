function initSplash(){
	U.init();
	
	stars = U.starsGenerator(P.width, P.height, 300);
	C.putImageData(stars, 0, 0)
	
	btSound = new Controls.PathButton()
		.set({x: 10,y: 15, w: 20, h: 20, 
			path: function(){
				C.beginPath();
				var s = btSound.Conf.w;
				C.arc(s/4, 2*s/3, s/6, Math.PI*2, 0);
				C.moveTo(s/4 + s/6, 2*s/3); C.lineTo(s/4 + s/6, 0); C.rect(s/4 + s/6, 0, s/4, s/8	);
				
			}})
		.setOnClick(function(){if(audioPlayer.paused)audioPlayer.play(); else audioPlayer.pause();})
		.setOnMove(function(isIn){btSound.set({path_stroke: (isIn? P.INF_detail2 : (audioPlayer.paused ? P.INF_text : P.INF_detail))}, true); if(isIn)document.body.style.cursor = 'pointer'})
	
	
	var playBt = new Controls.Button()
		.set({text: 'Play', x: P.width / 2 - 150 , y: P.height - 100}, true)
		.setOnClick(function(){initLevelSelect();})
		
		
	var editorBt = new Controls.Button()
		.set({text: 'Editor', x: P.width / 2 + 50, y: P.height - 100}, true)
		.setOnClick(function(){initEditor();})

	S = new Ship().set({x: 300, y:300, state: 'accelerating', speed: 0});
	
	var offset = 0;
	animManager.addLoop(function(){
		C.putImageData(stars, -offset, 0);
		C.putImageData(stars, P.width - offset, 0);
		S.draw();
		S.nextFrame();
		Controls.drawAll();
		U.Draw.string({text: 'Space Trash', fontFamily: 'title', stroke: P.INF_detail, fillStyle: P.INF_background, h: 80, x: P.width / 2, y: 30,align: 'center'});
	
		offset= (1+offset) % P.width;
	}).start();
}