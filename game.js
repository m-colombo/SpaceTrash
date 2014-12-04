function initGame(lv, fromEditor){
	U.init();
	L = lv;
	
	var btBack = new Controls.PathButton()
		.set({x: 10, y: 15, w: 20, h: 20, 
			path: function(){
				C.beginPath();
				var s = btBack.Conf.w;
				U.Draw.polygon([[0, s/2], [s/2, 0], [s/2, s/3], [s, s/3], [s, 2*s/3], [s/2, s/3*2], [s/2, s]]);
			}})
		.setOnClick(function(){if(fromEditor)initLevelEditor(L); else initCommunicator(L)})
		
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
	
	//Init game state
	S = new Ship().set(L.ship);
	G.base = new Station().set({x: L.ship.x, y: L.ship.y});
	
	if(L.init.W2V){
		T.setW2V(L.init.W2V);
		T.setV2W(L.init.V2W);
		T.scaleFactor = L.init.zoom;
	}else{
		T.translate(L.init.offsetX, L.init.offsetY)
		T.scale(L.init.zoom);
	}
	
	//Init planet
	for(var i = 0; i < L.planets.length; i++){
		var o = new Planets().set(L.planets[i]);
		gameObjManager.add(o);
		(function(o){
		collisionManager.addCollisionListener(
					S.boundingBox,
					o.boundingBox,
					S.bounding,
					o.bounding,
					function(){
						if(o.i.destination_objective && L.objective.destination && checkTrash()){
							win();
							}
						else explode();});
		})(o)
	}

	//Init trash
	for(var i = 0; i < L.trash.length; i++){
		var t = L.trash[i];
		var i = Trash.add(t, 'trash'+i);
		(function(j){
		collisionManager.addCollisionListener(
		S.boundingBox,
		function(){return Trash.boundingBox('trash'+j)},
		S.bounding,
		function(C){Trash.bounding(C, 'trash'+j)},
		function(){	
			var val = Trash.destroy('trash'+j)+slTrash.get('value');
			slTrash.set({value: val, label: ' Trash objective '+val+'/'+L.objective.trash}); collisionManager.removeListener('trash'+j);
			if(checkTrash() && !L.objective.destination)win();
			},
		'trash'+j)
		}
		)(i)
	
	}
	
	//Init asteroid
	for(var i = 0; i < L.asteroid.length; i++){
		var a = L.asteroid[i];
		var i = Asteroid.add(a, 'aster'+i);
		(function(j){
		collisionManager.addCollisionListener(
		S.boundingBox,
		function(){return Asteroid.boundingBox('aster'+j)},
		S.bounding,
		function(C){Asteroid.bounding(C, 'aster'+j)},
		function(){	
			explode();
			},
		'aster'+j)
		}
		)(i)
	}
	
	//Init space background
	stars = C.createImageData(P.width, P.height);
	stars.data[0] = 255; stars.data[3] = 255;
	for(var i = 0; i < stars.data.length; i+=4)
		{stars.data[i] = 0; stars.data[i+1] = 0; stars.data[i+2] = 0; stars.data[i+3] = 255; }
	for(var i = 0; i < 300; i++){
		var s = Math.round(Math.random() * P.width * P.height)*4;
		stars.data[s] = 255; stars.data[s+1] = 255; stars.data[s+2] = 255; 
	}
	
	//Launch interface
	var angleCursor = new Controls.BaseControl()
		.set({d: 150 , r: 15, stroke: P.INF_detail})
		.setDraw(function(){
			var r = angleCursor.Conf.r / T.scaleFactor;
			var d = angleCursor.Conf.d + r;
			C.beginPath();
			C.fillStyle = P.INF_background;
			C.strokeStyle = angleCursor.Conf.stroke;
			C.arc(S.i.x + Math.cos(S.i.theta)*d, S.i.y + Math.sin(S.i.theta)*d, r , 0, 2*Math.PI, false);
			C.lineWidth = 1 / T.scaleFactor;
			C.fill();C.stroke();
			})
		.setCorrelate(function(x, y){
			var r = angleCursor.Conf.r / T.scaleFactor;
			var d = angleCursor.Conf.d + r;
			var p = T.pointToWorld(x, y);
			return U.circleContains(S.i.x + Math.cos(S.i.theta)*d, S.i.y + Math.sin(S.i.theta)*d, r, p[0], p[1])})
		.setOnDrag(function(x, y){
			var p = T.pointToWorld(x, y);
			S.i.theta = U.angleBetween(S.i.x, S.i.y, p[0], p[1]);
			})
		.setOnMove(function(isIn){ if(isIn)document.body.style.cursor = 'pointer'; angleCursor.set({stroke: (isIn ? P.INF_detail2 : P.INF_detail)}, true)});
	
	/*
	//Propulsor button
	var btPropCentral = new Controls.PathButton().set({x: 230, y: P.height - 90, h: 30, w: 30, 
		path: function(){C.save(); C.translate(15, 15);  C.scale(1.5, 1.5); C.translate(-15, -15); C.beginPath(); U.Draw.polygon([[15, 5], [22, 20], [8, 20]]); C.restore();},
		path_color: 'black', path_stroke: P.INF_detail})

			
		*/
	//Camera Button
		var cameraControlOff = {x: 575, y: 60};
		btLeft = new Controls.PathButton()
		.set({x: cameraControlOff.x, y: P.height - cameraControlOff.y, w: 20, h: 20, path: function(){C.beginPath();	var s = btBack.Conf.w; U.Draw.polygon([[0, s/2], [s/2, 0], [s/2, s/3], [s, s/3], [s, 2*s/3], [s/2, s/3*2], [s/2, s]]); }})
		.setOnClick(function(){T.translate(10, 0)});
		btRight = new Controls.PathButton()
		.set({x: 50+cameraControlOff.x, y: P.height - cameraControlOff.y + 20, w: 20, h: 20, path: function(){C.beginPath();C.save();C.rotate(Math.PI);var s = btBack.Conf.w; U.Draw.polygon([[0, s/2], [s/2, 0], [s/2, s/3], [s, s/3], [s, 2*s/3], [s/2, s/3*2], [s/2, s]]);C.restore(); }})
		.setOnClick(function(){T.translate(-10, 0)});
		btUp = new Controls.PathButton()
		.set({x: 35+cameraControlOff.x, y: P.height - cameraControlOff.y -15, w: 20, h: 20, path: function(){C.beginPath();C.save();C.rotate(Math.PI/2);var s = btBack.Conf.w; U.Draw.polygon([[0, s/2], [s/2, 0], [s/2, s/3], [s, s/3], [s, 2*s/3], [s/2, s/3*2], [s/2, s]]);C.restore(); }})
		.setOnClick(function(){T.translate(0, 10)});
		btDown = new Controls.PathButton()
		.set({x: 15+cameraControlOff.x, y: P.height - cameraControlOff.y + 35, w: 20, h: 20, path: function(){C.beginPath();C.save();C.rotate(-Math.PI/2);var s = btBack.Conf.w; U.Draw.polygon([[0, s/2], [s/2, 0], [s/2, s/3], [s, s/3], [s, 2*s/3], [s/2, s/3*2], [s/2, s]]);C.restore(); }})
		.setOnClick(function(){T.translate(0, -10)});
		
		btZoomIn = new Controls.PathButton()
		.set({x: 50+cameraControlOff.x, y: P.height - cameraControlOff.y - 30, w: 20, h: 20, text: '+', path: function(){C.beginPath(); var s = btBack.Conf.w; C.arc(s/2, s/2, s/2, Math.PI *2, 0); }})
		.setOnClick(function(){T.scale(1.05)});
		btZoomOut = new Controls.PathButton()
		.set({x: cameraControlOff.x - 20, y: P.height - cameraControlOff.y - 30, w: 20, h: 20, text: '-', path: function(){C.beginPath(); var s = btBack.Conf.w; C.arc(s/2, s/2, s/2, Math.PI *2, 0); }})
		.setOnClick(function(){T.scale(0.95)});
		
	//Propulsor Button
		var propControlOff = {x: 175, y: 60};
		btPropLeft = new Controls.PathButton()
			.set({x: propControlOff.x, y: P.height - propControlOff.y, w: 20, h: 20, path: function(){C.beginPath();	var s = btBack.Conf.w; U.Draw.polygon([[0, s/2], [s/2, 0], [s/2, s/3], [s, s/3], [s, 2*s/3], [s/2, s/3*2], [s/2, s]]); }})
			.setOnMouseDown(function(){ if(S.i.fuel > 0){S.i.propulsor_left = true; S.i.propulsor_theta = 0.4;}})
			.setOnMouseUp(function(){S.i.propulsor_left = false; if(!S.i.propulsor_right)S.i.propulsor_theta = 0})
			.setOnMove(function(isIn){
				if(isIn){
					btPropLeft.set({path_stroke: P.INF_detail2}, true);
					document.body.style.cursor = 'pointer'
				}
				else btPropLeft.set({path_stroke: P.INF_detail}, true);})
		btPropRight = new Controls.PathButton()
			.set({x: 50+propControlOff.x, y: P.height - propControlOff.y + 20, w: 20, h: 20, path: function(){C.beginPath();C.save();C.rotate(Math.PI);var s = btBack.Conf.w; U.Draw.polygon([[0, s/2], [s/2, 0], [s/2, s/3], [s, s/3], [s, 2*s/3], [s/2, s/3*2], [s/2, s]]);C.restore(); }})
			.setOnMouseDown(function(){S.i.propulsor_right = true; S.i.propulsor_theta = -0.4})
			.setOnMouseUp(function(){ S.i.propulsor_right = false; if(!S.i.propulsor_left)S.i.propulsor_theta = 0})
			.setOnMove(function(isIn){
				if(isIn){
					btPropRight.set({path_stroke: P.INF_detail2}, true);
					document.body.style.cursor = 'pointer'
				}
				else btPropRight.set({path_stroke: P.INF_detail}, true);})
		btPropCentral = new Controls.PathButton()
			.set({x: 35+propControlOff.x, y: P.height - propControlOff.y -15, w: 20, h: 20, path: function(){C.beginPath();C.save();C.rotate(Math.PI/2);var s = btBack.Conf.w; U.Draw.polygon([[0, s/2], [s/2, 0], [s/2, s/3], [s, s/3], [s, 2*s/3], [s/2, s/3*2], [s/2, s]]);C.restore(); }})
			.setOnMouseDown(function(){ if(S.i.fuel > 0)S.i.propulsor_central = true})
			.setOnMouseUp(function(){ S.i.propulsor_central = false})
			.setOnMove(function(isIn){
				if(isIn){
					btPropCentral.set({path_stroke: P.INF_detail2}, true);
					document.body.style.cursor = 'pointer'
				}
				else btPropCentral.set({path_stroke: P.INF_detail}, true);})
		
		var btLaunch = new Controls.Button().set({x: propControlOff.x - 10, y: P.height - propControlOff.y + 30, h: 20, text: 'Launch', textH: 12, w: 70})
			.setOnClick(function(){
				if(S.i.state == 'inBase'){
					launch();btLaunch.set({text: 'Restart'});
					}
				else{
					restartGame();
					btLaunch.set({text:'Launch'});
				}});		
	
	
	//Init controls
	var slFuel = new Controls.Slider().set({label: ' Fuel '+S.i.fuel, full_value: S.i.fuel, value: L.ship.fuel, label_height: 13, cursor_label_height: 12, x: 5, y: P.height - 110, w: 140, h: 20, cursor_label_text: ' Launch limit ', cursor_position: L.ship.fuel *2/ 3});
	var slTrash = new Controls.Slider().set({label: ' Trash Objective '+S.i.trash+'/'+L.objective.trash, full_value: L.objective.trash, value: S.i.trash, label_height: 13, x: 5, y: P.height - 60, w: 140, h: 20, show_cursor_label: false, show_cursor: false, cursor_lock: true});
	
	var swCameraLock = new Controls.Switch().set({x: 555, y: P.height - 25, label: ' Lock ', w: 70})
		.setOnChange(function(state){
			if(state){
				shipInView = T.pointToView(S.i.x, S.i.y);
				if(!U.rectContains(0, 0, P.width , P.height, shipInView[0], shipInView[1])){
					c = T.pointToWorld(P.width / 2, P.height / 2);
					T.translate(c[0] - S.i.x, c[1] - S.i.y, true);
				}
			}
		})
	
	//Keyboard controls
	kbManager.addOnKeyDown([119, 87], function(){ if(S.i.fuel > 0){S.i.propulsor_central = true; btPropCentral.set({path_stroke: P.INF_detail2}, true)}}); //W accelerate on
	kbManager.addOnKeyUp([119, 87], function(){ S.i.propulsor_central = false; btPropCentral.set({path_stroke: P.INF_detail}, true)}); //W accelerate off
	kbManager.addOnKeyDown([97, 65], function(){ if(S.i.fuel > 0){S.i.propulsor_left = true; S.i.propulsor_theta = 0.4; btPropLeft.set({path_stroke: P.INF_detail2}, true)}}); //A left accelerate on
	kbManager.addOnKeyUp([97, 65], function(){S.i.propulsor_left = false; btPropLeft.set({path_stroke: P.INF_detail}, true); if(!S.i.propulsor_right)S.i.propulsor_theta = 0}); //A left accelerate on
	kbManager.addOnKeyDown([100, 68], function(){ if(S.i.fuel > 0){S.i.propulsor_right = true; S.i.propulsor_theta = -0.4; btPropRight.set({path_stroke: P.INF_detail2}, true)}}); //D right accelerate on
	kbManager.addOnKeyUp([100, 68], function(){S.i.propulsor_right = false; btPropRight.set({path_stroke: P.INF_detail}, true); if(!S.i.propulsor_left)S.i.propulsor_theta = 0}); //D right accelerate on
	kbManager.addOnKeyPress([115, 83], function(){ if(S.i.state == 'inBase')launch(); else restartGame(); });
	kbManager.addOnKeyPress([43], function(){ T.scale(1.05); }); //+ zoomin
	kbManager.addOnKeyPress([45], function(){ T.scale(0.95); }); //- zoomout
	kbManager.addOnKeyPress([106, 74], function(){ T.translate(10, 0); });	//J left
	kbManager.addOnKeyPress([108, 76], function(){ T.translate(-10, 0);});	//L right
	kbManager.addOnKeyPress([105, 73], function(){ T.translate(0, 10); });	//I up
	kbManager.addOnKeyPress([107,75], function(){ T.translate(0, -10); });	//K down
	kbManager.addOnKeyPress([99,67], function(){ swCameraLock.toggle();});		//C Camera lock
	
	function launch(){
		S.set({state:'accelerating'}); 
		angleCursor.hide(); 
		G.initState = {};
		G.initState.shipTheta = S.i.theta;
		slFuel.set({cursor_lock: true});
	}
	
	function restartGame(){
		kbManager.resume();
		S.set(L.ship);
		S.i.theta = G.initState.shipTheta;
		S.i.state = 'inBase';
		S.mbMessage.hide();
		S.i.fuel = L.ship.fuel;
		slFuel.set({value: S.i.fuel, label: ' Fuel '+S.i.fuel, cursor_lock: false});
		slTrash.set({value: L.ship.trash, full: L.objective.trash, label: ' Trash Objective '+S.i.trash+'/'+L.objective.trash});
		angleCursor.show();
		
		Trash.resume();
		collisionManager.resume();
		
		//Camera position
		T.setId();
		if(L.init.W2V){
			T.setW2V(L.init.W2V);
			T.setV2W(L.init.V2W);
			T.scaleFactor = L.init.zoom;
		}else{
			T.translate(L.init.offsetX, L.init.offsetY)
			T.scale(L.init.zoom);
		}
	}
	
	function explode(){
		S.i.state = 'exploding'
		S.i.explode_anim = 0;
		S.mbMessage.set({title: 'Mission Failed!'});
		S.mbMessage.bt1.set({text: 'Retry'}).setOnClick(restartGame)
		if(fromEditor)S.mbMessage.bt2.set({text: 'Edit'}).setOnClick(function(){initLevelEditor(L)})
		else S.mbMessage.bt2.set({text: 'Levels'}).setOnClick(initLevelSelect)
	}
	
	function checkTrash(){
		return(slTrash.get('value') >= L.objective.trash)
	}
	
	function win(){
	if(!S.mbMessage.isVisible()){ //If visible mission already failed
		if(fromEditor){
			S.mbMessage.bt1.set({text: 'Retry'}).setOnClick(restartGame)
			S.mbMessage.bt2.set({text: 'Edit'}).setOnClick(function(){initLevelEditor(L)})
		}
		else{
			var next = Levels.indexOf(L)+1;
			
			if(next < Levels.length)
				S.mbMessage.bt1.set({text: 'Next'}).setOnClick(function(x, y){ initCommunicator(Levels[next])})
			else S.mbMessage.bt1.set({text: 'Finish!'}).setOnClick(function(x, y){ initSplash()})
			S.mbMessage.bt2.set({text: 'Levels'}).setOnClick(initLevelSelect)
		}
		
		S.mbMessage.set({title: 'Mission Complete!'});
		S.mbMessage.show();
		S.i.state = 'inBase';
		kbManager.suspend();
	  }
	}
	
	function checkPosition(){
		var r = L.level_rect;
		if(S.i.x < r.x || S.i.x > r.x + r.w || S.i.y < r.y || S.i.y > r.y + r.w){
			S.mbMessage.set({title: 'Mission Failed!'});
			S.mbMessage.bt1.set({text: 'Retry'}).setOnClick(restartGame)
			if(fromEditor)S.mbMessage.bt2.set({text: 'Edit'}).setOnClick(function(){initLevelEditor(L)})
			else S.mbMessage.bt2.set({text: 'Levels'}).setOnClick(initLevelSelect)
			S.mbMessage.show();
		}
	}
	function draw(){
		//Background
		C.save();
		C.setTransform(1, 0, 0, 1, 0, 0);
		
		C.putImageData(stars, 0, 0);
		C.restore();
		
		//Base station
		G.base.draw();
		
		//Other space object
		gameObjManager.drawAll();
		
		//Ship
		if(S.i.state != 'exploding')S.draw();
		else S.explodeAnim();
		
		gameObjManager.drawAllLightEffect();
		
		//Launch interface
		if(S.i.state == 'inBase'){
			angleCursor.draw();
		}
		
	//* UI *//
			
			T.save();
			T.setId();
			C.beginPath();
			C.rect(0, P.height - 100, 250, 102);
			C.rect(P.width - 250, P.height - 100, 250, 102);
			C.fillStyle = P.INF_background;
			C.strokeStyle = P.INF_detail;
			C.lineWidth = 2;
			C.globalAlpha = 0.7
			C.stroke();
			C.fill();
			
			C.beginPath();
			var h = 12;
			C.globalAlpha = 1;
			U.Draw.polygon([[0, P.height - 100 - h], [250 - h, P.height - 100 - h], [251.5, P.height - 100], [0, P.height - 100] ]);
			C.fillStyle = P.INF_detail;
			C.fill();
			U.Draw.string({text: 'Propulsor', x: 200 - h / 2, y: P.height -100 - h / 2, baseline: 'middle', align: 'center', h: 12});
			C.beginPath();
			C.translate(P.width - 250, 0);
			U.Draw.polygon([[h, P.height - 100 - h], [250 - h, P.height - 100 - h], [251.5, P.height - 100], [-1.5, P.height - 100] ]);
			C.fill();
			U.Draw.string({text: 'Camera', x: 50 + h / 2, y: P.height -100 - h / 2, baseline: 'middle', align: 'center', h: 12});
	
			T.restore();
			
		//Level preview
			T.save();
			T.setId();
			//Background
			var u = 15, size = 150;
			T.translate(P.width-size, P.height-size);
			U.Draw.polygon([[0, u], [u, 0], [size, 0], [size, size], [0, size]]);
			C.fillStyle = P.INF_background;
			C.lineWidth = '2';
			C.strokeStyle = P.INF_detail;
			C.stroke();
			C.fill();
			
			C.save();
			C.clip();
			U.Draw.grid({x:0, y:0, w:size, h:size, space: u/2});
			U.Draw.levelPreview(0, 0, size, size, lv, {theta: S.i.theta, x: S.i.x, y:S.i.y});
			C.restore();
			
			T.translate(-P.width+size, -P.height+size);
			T.restore();
		
		//Sliders
			T.save();
			T.setId();
			//Background
			T.translate(0, P.height-size);
			U.Draw.polygon([[0, 0], [size-u, 0], [size, u], [size, size], [0, size]]);
			C.fillStyle = P.INF_background;
			
			//Border
			U.Draw.polygon([[0, 0], [size-u, 0], [size, u], [size, size], [0, size]]);
			C.lineWidth = '2';
			C.strokeStyle = P.INF_detail;
			C.stroke();
			C.fill();
			
			T.translate(-P.width+size, -P.height+size);
			T.restore();
		
		/*
		//Propulsor
			T.save();
			T.setId();
			T.translate(btPropLeft.Conf.x, btPropCentral.Conf.y);	
			
			//Label
			C.beginPath();
			C.rect(15, 70, 60, 10);
			C.fillStyle = P.INF_detail;
			C.fill();
			U.Draw.string({text: ' Propulsor ', x: 45, y: 75, align: 'center', baseline: 'middle', h: 11});
			
			T.restore();
			
		//Zoom
			T.save();
			T.setId();
			T.translate(btZoomOut.Conf.x, btZoomOut.Conf.y - 15);

			//Label
			C.beginPath();
			C.rect(20, 55, 32, 10);
			C.fillStyle = P.INF_detail;
			C.fill();
			U.Draw.string({text: ' Zoom ', x: 36, y: 60, align: 'center', baseline: 'middle', h: 11});
			
			T.restore();
		*/
		Controls.drawAll();
		/*
		//Propulsor button line
			T.save();
			T.setId();
			T.translate(btPropLeft.Conf.x, btPropCentral.Conf.y);
			
			C.beginPath();
			C.moveTo(45, 22);
			C.lineTo(45, 70);
			C.lineWidth = 2;
			C.strokeStyle = btPropCentral.Conf.path_stroke;
			C.stroke();
			
			C.beginPath();
			C.moveTo(22, 45);
			C.lineTo(40, 45);
			C.lineTo(40, 70);
			C.lineWidth = 2;
			C.strokeStyle = btPropLeft.Conf.path_stroke;
			C.stroke();

			C.beginPath();
			C.moveTo(68, 45);
			C.lineTo(50, 45);
			C.lineTo(50, 70);
			C.lineWidth = 2;
			C.strokeStyle = btPropRight.Conf.path_stroke;
			C.stroke();
			
			T.restore();
		
		//Zoom button line
			T.save();
			T.setId();
			T.translate(btZoomOut.Conf.x, btZoomOut.Conf.y - 15);
			
			C.beginPath();
			C.moveTo(15, 40);
			C.lineTo(15, 60);
			C.lineTo(20, 60);
			C.strokeStyle = btZoomOut.Conf.path_stroke;
			C.lineWidth = 2;
			C.stroke();
			
			C.beginPath();
			C.moveTo(55, 45);
			C.lineTo(55, 60);
			C.lineTo(52, 60);
			C.strokeStyle = btZoomIn.Conf.path_stroke;
			C.lineWidth = 2;
			C.stroke();
			
			T.restore();		
			C.fill();
			*/
	}	
	
	function animFrame(){
		
		
		
		if(S.i.state == 'accelerating'){
			if(S.i.fuel > 0 && S.i.fuel > slFuel.get('cursor_position')){
				S.i.fuel--;
				S.i.speed += S.i.acceleration;
			}
			
			if(slFuel.get('cursor_position') >= slFuel.get('value'))S.i.state = 'inertial';			
		}
		slFuel.set({value: S.i.fuel, label: ' Fuel '+S.i.fuel});
		
		//Camera lock
		if((S.i.state == 'accelerating' || S.i.state == 'inertial') && swCameraLock.get('state'))
				T.translate(-S.i.speed * Math.cos(S.i.theta) * T.scaleFactor, -S.i.speed * Math.sin(S.i.theta) * T.scaleFactor);
				
		//Space object animation
		gameObjManager.nextAll();
		
		checkPosition();
		
		draw();
	}
	animManager.addLoop(animFrame).start();
	
	
}