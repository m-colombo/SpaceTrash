function initLevelEditor(lv){
	U.init();
	stars = U.starsGenerator(P.width, P.height, 300);
	
	L = (lv ? lv : U.setObjWithDefault({}, EmptyLevel))
	var EC = new EditorControls(L);
	var saveName = (lv ? L.brief.title : undefined)
	
	function draw(){
		C.putImageData(stars, 0, 0);	
		EC.drawAll();	
		
		//TOP interface
		T.save();
		T.setId();
		C.beginPath();
		C.rect(0, 0, P.width, 50);
		C.fillStyle = P.INF_background;
		C.strokeStyle = P.INF_detail;
		C.stroke();
		C.globalAlpha = 0.7
		C.fill();
		T.restore();
		
		Controls.drawAll();
		
	}
	
	//TOP Button
	var btNewPlanet = new Controls.Button().set({text: 'New Planet', x: 70, y: 15, textH: 15, h: 20, w: 90}).setOnClick(function(){var p = T.pointToWorld(P.width / 2, P.height / 2);addPlanet({x: p[0], y: p[1]})});
	var btNewTrash = new Controls.Button().set({text: 'New Trash', x: 170, y: 15, textH: 15, h: 20, w: 90}).setOnClick(function(){var p = T.pointToWorld(P.width / 2, P.height / 2);addTrash({x: p[0], y: p[1]})});
	var btNewAsteroid = new Controls.Button().set({text: 'New Asteroid', x: 270, y: 15, textH: 15, h: 20, w: 90}).setOnClick(function(){var p = T.pointToWorld(P.width / 2, P.height / 2);addAsteroid({x: p[0], y: p[1]})});

	var btSave = new Controls.Button().set({text: 'Save', x: P.width - 220, y: 15, textH: 15, h: 20, w: 90}).setOnClick(function(){
		serialize()
		var title = L.brief.title
		saveName = title;
		var safe_title = L.brief.title.replace(/\s/g, '_');
		
		if(!window.localStorage.spaceTrashLevels)window.localStorage.spaceTrashLevels = "[]";
		var levels_array = JSON.parse(window.localStorage.spaceTrashLevels)
		if(!levels_array)window.localStorage.spaceTrashLevels = "['"+title+"']";
		else if(levels_array.indexOf(title) == -1){
			levels_array.push(title)
			window.localStorage.spaceTrashLevels = JSON.stringify(levels_array)
			}
		window.localStorage['spaceTrashLevel'+safe_title] = JSON.stringify(L);
		});
	var btDelete = new Controls.Button().set({text: 'Delete', x: P.width - 120, y: 15, textH: 15, h: 20, w: 90}).setOnClick(function(){
		if(saveName){
			var title = saveName
			var safe_title = saveName.replace(/\s/g, '_');
			
			var levels_array = (window.localStorage.spaceTrashLevels ? JSON.parse(window.localStorage.spaceTrashLevels) : undefined)
			if(levels_array && levels_array.indexOf(title) != -1){
				levels_array[levels_array.indexOf(title)] = levels_array[levels_array.length -1]; levels_array.pop();
				window.localStorage.spaceTrashLevels = JSON.stringify(levels_array)
				delete window.localStorage['spaceTrashLevel'+safe_title];
				}
			}
		initEditor();
	});
	var btPlay = new Controls.Button().set({text: 'Play', x: P.width - 	320, y: 15, textH: 15, h: 20, w: 90}).setOnClick(function(){serialize(); initGame(L, true)});
	var btBack = new Controls.PathButton()
		.set({x: 10, y: 15, w: 20, h: 20, 
			path: function(){
				C.beginPath();
				var s = btBack.Conf.w;
				U.Draw.polygon([[0, s/2], [s/2, 0], [s/2, s/3], [s, s/3], [s, 2*s/3], [s/2, s/3*2], [s/2, s]]);
			}})
		.setOnClick(initEditor);
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
	
	//Camera button
	kbManager.addOnKeyPress([43], function(){ T.scale(1.05); }); //+ zoomin
	kbManager.addOnKeyPress([45], function(){ T.scale(0.95); }); //- zoomout
	kbManager.addOnKeyPress([106, 74], function(){ T.translate(10, 0); });	//J left
	kbManager.addOnKeyPress([108, 76], function(){ T.translate(-10, 0);});	//L right
	kbManager.addOnKeyPress([105, 73], function(){ T.translate(0, 10); });	//I up
	kbManager.addOnKeyPress([107,75], function(){ T.translate(0, -10); });	//K down
	
	function addShip(conf){
		S = new Ship().set(conf);
		var b = new Station().set({x: S.i.x, y: S.i.y});
		var c = new EC.Control()
			.setDraw(function(){b.draw(); S.draw()})
			.setCorrelate(function(x, y){return b.correlate(x, y) || S.correlate(x, y)})
			.setOnMouseDown(function(x, y){ var mouse = T.pointToWorld(x, y); c.mouseDelta = [S.i.x - mouse[0], S.i.y - mouse[1]];})
			.setOnDrag(function(x, y){  var mouse = T.pointToWorld(x, y);
										b.set({x: Math.ceil(mouse[0] + c.mouseDelta[0]), y: Math.ceil(mouse[1] +c.mouseDelta[1])}); 
										S.set({x: Math.ceil(mouse[0] + c.mouseDelta[0]), y: Math.ceil(mouse[1] +c.mouseDelta[1])}); 
										})
		c.Interface = new EC.ObjectInterface();
		c.Interface.setDraw(function(){
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
		})
		
		var fuel_label = new Controls.Label(true)
			.set({label: ' Initial Fuel: ', text: S.i.fuel, w: 148, x: 10, y: P.height - 31})
			.setOnChange(function(){S.i.fuel = parseInt(fuel_label.Conf.text)})
		c.Interface.addControl(fuel_label);
		
		var trash_label = new Controls.Label(true)
			.set({label: ' Initial trash: ', text: S.i.trash, w: 148, x: 168, y: P.height - 31})
			.setOnChange(function(){S.i.trash = parseInt(trash_label.Conf.text)})
		c.Interface.addControl(trash_label);

		var acceleration_label = new Controls.Label(true)
			.set({label: ' Front acceleration: ', text: S.i.acceleration, w: 148, x: 326, y: P.height - 31})
			.setOnChange(function(){S.i.acceleration = parseFloat(acceleration_label.Conf.text)})
		c.Interface.addControl(acceleration_label);

		var angle_label = new Controls.Label(true)
			.set({label: ' Side acceleration: ', text: S.i.acceleration_theta, w: 148, x: 484, y: P.height - 31})
			.setOnChange(function(){S.i.acceleration_theta = parseFloat(angle_label.Conf.text)})
		c.Interface.addControl(angle_label);
		
		var speed_label = new Controls.Label(true)
			.set({label: ' Initial speed: ', text: S.i.speed, w: 148, x: 642, y: P.height - 31})
			.setOnChange(function(){S.i.speed = parseFloat(speed_label.Conf.text)})
		c.Interface.addControl(speed_label);
		
		var ship_theta = new Controls.BaseControl(true)
			.set({active: false})
			.setDraw(function(){
				T.save()

				C.beginPath();
				
				C.arc(S.i.x + Math.cos(S.i.theta)* (S.getLength() + 20 / T.scaleFactor), S.i.y + Math.sin(S.i.theta)* (S.getLength() + 20 / T.scaleFactor), 10/T.scaleFactor, Math.PI*2, 0);
				C.lineWidth = 2 / T.scaleFactor;
				C.strokeStyle = (ship_theta.Conf.active ? P.INF_detail2 : P.INF_detail);
				C.stroke();
				C.fillStyle = P.INF_background;
				C.fill();
				T.restore();
			})
			.setCorrelate(function(x, y){
				var point = T.pointToWorld(x, y); 
				return U.distance(point[0], point[1], S.i.x + Math.cos(S.i.theta)* (S.getLength() + 20 / T.scaleFactor), S.i.y + Math.sin(S.i.theta)* (S.getLength() + 20 / T.scaleFactor)) <= 10 / T.scaleFactor
			})
			.setOnMove(function(isIn){ship_theta.set({active: isIn}); if(isIn)document.body.style.cursor = 'pointer';})
			.setOnDrag(function(x, y){
				var point = T.pointToWorld(x, y); 
				var angle = U.angleBetween(S.i.x , S.i.y , point[0], point[1]);
				S.i.theta = angle;
				})
		c.Interface.addControl(ship_theta);

	}
	addShip(L.ship);
	
	function addPlanet(conf){
		var p = new Planets().set(conf);
		var c = new EC.Control(p.i)
			.setDraw(function(){p.draw(); p.drawLightEffect();
			if(p.i.orbit_active){
				C.save();
				C.beginPath()
				C.arc(p.i.x, p.i.y, p.i.orbit_r, 0, Math.PI*2);
				C.strokeStyle = p.i.color
				C.lineWidth = 2 / T.scaleFactor;
				C.stroke();
				C.restore();
			}
			})
			.setCorrelate(p.correlate)
			.setOnMove(function(isIn){})
			.setOnMouseDown(function(x, y){ var mouse = T.pointToWorld(x, y);c.mouseDelta = [p.i.x - mouse[0], p.i.y - mouse[1]];})
			.setOnDrag(function(x, y){  var mouse = T.pointToWorld(x, y); p.set({x: Math.round(mouse[0] + c.mouseDelta[0]), y: Math.round(mouse[1] +c.mouseDelta[1])});})
		c.type = 'planet';
		c.Interface = new EC.ObjectInterface();
		c.Interface.setDraw(function(){
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
		})
		
		//BOTTOM INTERFACE
		var orbit_toggle = new Controls.Switch(true)
			.set({label: ' Orbit ', w: 100, x: 20, y: P.height - 35, state: p.i.orbit_active})
			.setOnChange(function(state){p.set({orbit_active: state})})
		c.Interface.addControl(orbit_toggle);

		var destination_toggle = new Controls.Switch(true)
			.set({label: ' Is a destination ', w: 100, x: 170, y: P.height - 35, state: p.i.destination_objective})
			.setOnChange(function(state){p.set({destination_objective: state})})
		c.Interface.addControl(destination_toggle);
		
		var mass_label = new Controls.Label(true)
			.set({label: ' Mass: ', text: p.i.mass, w: 100, x: 350, y: P.height - 31})
			.setOnChange(function(){p.i.mass = parseInt(mass_label.Conf.text)})
		c.Interface.addControl(mass_label);
		
		var color_label = new Controls.Label(true)
			.set({label: ' Color: ', text: p.i.color , w: 100, x: 480, y: P.height - 31})
			.setOnChange(function(){p.i.color = color_label.Conf.text})
		c.Interface.addControl(color_label);
		
		var orbitSpeed_label = new Controls.Label(true)
			.set({label: ' Orbit rad/s: ', text: p.i.orbit_speed , w: 100, x: 600, y: P.height - 31})
			.setOnChange(function(){p.i.orbit_speed = parseFloat(orbitSpeed_label.Conf.text)})
		c.Interface.addControl(orbitSpeed_label);
		
		//ON OBJECT INTERFACE
		var planet_radius = new Controls.BaseControl(true)
			.set({active: false})
			.setDraw(function(){
				T.save()
				T.translate(p.center().x, p.center().y, true);
				C.beginPath();
				C.moveTo(0, 0); C.lineTo(p.i.r - 10/T.scaleFactor, 0);
				C.arc(p.i.r, 0, 10/T.scaleFactor, Math.PI*2, 0);
				C.lineWidth = 2 / T.scaleFactor;
				C.strokeStyle = (planet_radius.Conf.active ? P.INF_detail2 : P.INF_detail);
				C.stroke();
				C.fillStyle = P.INF_background;
				C.fill();
				T.restore();
			})
			.setCorrelate(function(x, y){
				var point = T.pointToWorld(x, y); 
				return U.distance(point[0], point[1], p.center().x + p.i.r, p.center().y) <= 10 / T.scaleFactor
			})
			.setOnMove(function(isIn){planet_radius.set({active: isIn}); if(isIn)document.body.style.cursor = 'pointer';})
			.setOnDrag(function(x, y){
				var point = T.pointToWorld(x, y); 
				p.set({r: Math.ceil(U.distance(point[0], point[1], p.center().x, p.center().y))})
				})
		c.Interface.addControl(planet_radius);

		var orbit = new Controls.BaseControl(true)
			.set({active: false})
			.setDraw(function(){
				if(!p.i.orbit_active)return;
				T.save()
				T.translate(p.i.x, p.i.y, true);
				C.beginPath();
				C.rotate(p.i.orbit_theta);
				C.moveTo(0, 0); C.lineTo(-p.i.orbit_r, 0);
				C.arc(-p.i.orbit_r, 0, 10/T.scaleFactor, Math.PI*2, 0);
				C.lineWidth = 2 / T.scaleFactor;
				C.strokeStyle = (orbit.Conf.active ? P.INF_detail2 : P.INF_detail);
				C.stroke();
				C.fillStyle = P.INF_background;
				C.fill();
				T.restore();
			})
			.setCorrelate(function(x, y){
				if(!p.i.orbit_active)return false;
				var point = T.pointToWorld(x, y); 				
				return U.distance(point[0], point[1], p.i.x + Math.cos(p.i.orbit_theta)*(-p.i.orbit_r), p.i.y + Math.sin(p.i.orbit_theta)*(-p.i.orbit_r)) <= 10 / T.scaleFactor
			})
			.setOnMove(function(isIn){orbit.set({active: isIn}); if(isIn)document.body.style.cursor = 'pointer';})
			.setOnDrag(function(x, y){
				var point = T.pointToWorld(x, y); 
				p.i.orbit_theta= U.angleBetween(p.i.x,p.i.y, point[0], point[1]) + Math.PI;
				p.i.orbit_r= Math.ceil(U.distance(point[0], point[1], p.i.x, p.i.y));
				})
		c.Interface.addControl(orbit);
		
		var delete_button = new Controls.BaseControl(true)
			.set({active: false})
			.setDraw(function(){
				T.save()
				T.translate(p.center().x + p.i.r, p.center().y - p.i.r, true);
	
				C.lineWidth = 2 / T.scaleFactor;
				C.strokeStyle = (delete_button.Conf.active ? P.INF_detail2 : P.INF_detail);
	
				C.beginPath();			
				C.moveTo(0,0); C.lineTo(-p.i.r, p.i.r);C.stroke();
				
				C.beginPath();
				C.arc(0, 0, 10/T.scaleFactor, Math.PI*2, 0);
				C.stroke();
				C.fillStyle = P.INF_background;
				C.fill();
				
				C.beginPath();
				C.rotate(Math.PI / 4)
				C.moveTo(5 / T.scaleFactor, 0);
				C.lineTo(-5 / T.scaleFactor, 0);
				C.moveTo(0, 5 / T.scaleFactor);
				C.lineTo(0, -5 / T.scaleFactor);	
				C.stroke();
				
				T.restore();
			})
			.setCorrelate(function(x, y){
				var point = T.pointToWorld(x, y); 
				return U.distance(point[0], point[1], p.center().x + p.i.r, p.center().y - p.i.r) <= 10 / T.scaleFactor
			})
			.setOnMove(function(isIn){delete_button.set({active: isIn}); if(isIn)document.body.style.cursor = 'pointer';})
			.setOnClick(function(x, y){c.Interface.hide(); EC.Level.onTop(); EC.remove(c)})
		c.Interface.addControl(delete_button);
	}
	
	var trash_id = 0;
	function addTrash(conf){
		var i = Trash.add(conf, trash_id++);
		var t = Trash.get(trash_id-1);
		var c = new EC.Control(t)
			.setDraw(function(){
				t = Trash.get(t.id);
				if(t.orbit_active){
					C.save();
					C.beginPath()
					C.arc(t.x, t.y, t.orbit_r, 0, Math.PI*2);
					C.strokeStyle = 'grey'
					C.lineWidth = 2 / T.scaleFactor;
					C.stroke();
					C.restore();
				}
				Trash.drawOne(t.id);
				})
			.setCorrelate(function(x, y){return Trash.correlate(x, y, t.id)})
			.setOnMove(function(isIn){})
			.setOnMouseDown(function(x, y){ var mouse = T.pointToWorld(x, y);c.mouseDelta = [t.x - mouse[0], t.y - mouse[1]];})
			.setOnDrag(function(x, y){  var mouse = T.pointToWorld(x, y); Trash.set(t.id, {x : Math.ceil(mouse[0] + c.mouseDelta[0]), y: Math.ceil(mouse[1] +c.mouseDelta[1])});})
		c.type = 'trash';
		c.Interface = new EC.ObjectInterface(t);
		c.Interface.setDraw(function(){
			T.save();
			T.setId();
			C.beginPath();
			C.fillStyle = P.INF_background;
			C.strokeStyle = P.INF_detail
			C.rect(0, P.height - 50, P.width, 50);
			C.globalAlpha = 0.7
			C.stroke();
			C.fill();
			T.restore();
		})
		
		
		//BOTTOM INTERFACE
		var orbit_toggle = new Controls.Switch(true)
			.set({label: ' Orbit ', w: 50, x: 20, y: P.height - 35, state: t.orbit_active})
			.setOnChange(function(state){Trash.set(t.id, {orbit_active: state})})
		c.Interface.addControl(orbit_toggle);
		
		var rotate_toggle = new Controls.Switch(true)
			.set({label: ' Rotate ', w: 50, x: 110, y: P.height - 35, state: t.rotate_active})
			.setOnChange(function(state){Trash.set(t.id, {rotate_active: state})})
		c.Interface.addControl(rotate_toggle);
		
		var rotate_label = new Controls.Label(true)
			.set({label: ' Rotate rad/s: ', text: t.rotate_speed, w: 100, x: 220, y: P.height - 31})
			.setOnChange(function(val){Trash.set(t.id, {rotate_speed: parseFloat(val)});})
		c.Interface.addControl(rotate_label);

		var orbit_label = new Controls.Label(true)
			.set({label: ' Orbit rad/s: ', text: t.orbit_speed, w: 100, x: 340, y: P.height - 31})
			.setOnChange(function(val){Trash.set(t.id, {orbit_speed: parseFloat(val)});})
		c.Interface.addControl(orbit_label);
		
		var trash_label = new Controls.Label(true)
			.set({label: ' Trash: ', text: t.trashness, w: 50, x: 460, y: P.height - 31})
			.setOnChange(function(val){Trash.set(t.id, {trashness: parseInt(val)});})
		c.Interface.addControl(trash_label);

		var variance_label = new Controls.Label(true)
			.set({label: ' Shape var: ', text: t.controlVar, w: 80, x: 530, y: P.height - 31})
			.setOnChange(function(val){
				Trash.set(t.id, {controlVar: parseInt(val)});
				var pts = [];
				var size = t.size; 
				pts.push({x: Math.random() * size / 2 , y: Math.random() * size / 2});		
				pts.push({x: Math.random() * size / 2 + size/2, y: Math.random() * size / 2 });
				pts.push({x: Math.random() * size / 2 + size/2, y: Math.random() * size / 2 + size / 2});
				pts.push({x: Math.random() * size / 2 , y: Math.random() * size / 2 + size / 2});
		
				Trash.set(t.id, {beziers: U.blobGenerator(pts, t.controlVar)});
				
				})
		c.Interface.addControl(variance_label);

		var size_label = new Controls.Label(true)
			.set({label: ' Size: ', text: t.size, w: 50, x: 630, y: P.height - 31})
			.setOnChange(function(val){
				Trash.set(t.id, {size: parseInt(val)});
				var pts = [];
				var size = t.size; 
				pts.push({x: Math.random() * size / 2 , y: Math.random() * size / 2});		
				pts.push({x: Math.random() * size / 2 + size/2, y: Math.random() * size / 2 });
				pts.push({x: Math.random() * size / 2 + size/2, y: Math.random() * size / 2 + size / 2});
				pts.push({x: Math.random() * size / 2 , y: Math.random() * size / 2 + size / 2});
		
				Trash.set(t.id, {beziers: U.blobGenerator(pts, t.controlVar)});
				
				})
		c.Interface.addControl(size_label);
		
		var regen_button = new Controls.Button(true)
			.set({text: 'Regenerate', x: 700, y: P.height - 31 -1, h: 14, textH: 12, w: 80, buttonFill: P.INF_background, textFill: P.INF_text})
			.setOnClick(function(x, y){
				var pts = [];
				var size = t.size; 
				pts.push({x: Math.random() * size / 2 , y: Math.random() * size / 2});		
				pts.push({x: Math.random() * size / 2 + size/2, y: Math.random() * size / 2 });
				pts.push({x: Math.random() * size / 2 + size/2, y: Math.random() * size / 2 + size / 2});
				pts.push({x: Math.random() * size / 2 , y: Math.random() * size / 2 + size / 2});
		
				Trash.set(t.id, {beziers: U.blobGenerator(pts, t.controlVar)});
			})
		c.Interface.addControl(regen_button);
		
		//ON OBJECT INTERFACE
		var orbit = new Controls.BaseControl(true)
			.set({active: false})
			.setDraw(function(){
				if(!t.orbit_active)return;
				T.save()
				T.translate(t.x, t.y, true);
				C.beginPath();
				C.rotate(t.orbit_theta);
				C.moveTo(0, 0); C.lineTo(-t.orbit_r, 0);
				C.arc(-t.orbit_r, 0, 10/T.scaleFactor, Math.PI*2, 0);
				C.lineWidth = 2 / T.scaleFactor;
				C.strokeStyle = (orbit.Conf.active ? P.INF_detail2 : P.INF_detail);
				C.stroke();
				C.fillStyle = P.INF_background;
				C.fill();
				T.restore();
			})
			.setCorrelate(function(x, y){
				if(!t.orbit_active)return false;
				var point = T.pointToWorld(x, y); 				
				return U.distance(point[0], point[1], t.x + Math.cos(t.orbit_theta)*(-t.orbit_r), t.y + Math.sin(t.orbit_theta)*(-t.orbit_r)) <= 10 / T.scaleFactor
			})
			.setOnMove(function(isIn){orbit.set({active: isIn}); if(isIn)document.body.style.cursor = 'pointer';})
			.setOnDrag(function(x, y){
				var point = T.pointToWorld(x, y); 
				Trash.set(t.id, {orbit_theta: U.angleBetween(t.x,t.y, point[0], point[1]) + Math.PI, orbit_r: Math.ceil(U.distance(point[0], point[1], t.x, t.y))});
				})
		c.Interface.addControl(orbit);
		
		var delete_button = new Controls.BaseControl(true)
			.set({active: false})
			.setDraw(function(){
				var center = Trash.getCenterOf(t.id);
				T.save()
				T.translate(center.x + t.size / 2, center.y - t.size / 2, true);
	
				C.lineWidth = 2 / T.scaleFactor;
				C.strokeStyle = (delete_button.Conf.active ? P.INF_detail2 : P.INF_detail);
	
				C.beginPath();			
				C.moveTo(0,0); C.lineTo(-t.size / 2, t.size / 2);C.stroke();
				
				C.beginPath();
				C.arc(0, 0, 10/T.scaleFactor, Math.PI*2, 0);
				C.stroke();
				C.fillStyle = P.INF_background;
				C.fill();
				
				C.beginPath();
				C.rotate(Math.PI / 4)
				C.moveTo(5 / T.scaleFactor, 0);
				C.lineTo(-5 / T.scaleFactor, 0);
				C.moveTo(0, 5 / T.scaleFactor);
				C.lineTo(0, -5 / T.scaleFactor);	
				C.stroke();
				
				T.restore();
			})
			.setCorrelate(function(x, y){
				var center = Trash.getCenterOf(t.id);
				var point = T.pointToWorld(x, y); 
				return U.distance(point[0], point[1], center.x + t.size / 2, center.y - t.size / 2) <= 10 / T.scaleFactor
			})
			.setOnMove(function(isIn){delete_button.set({active: isIn}); if(isIn)document.body.style.cursor = 'pointer';})
			.setOnClick(function(x, y){c.Interface.hide(); EC.Level.onTop(); Trash.destroy(t.id); EC.remove(c)})
		c.Interface.addControl(delete_button);
		
	}
		
	var asteroid_id = 0;
	function addAsteroid(conf){
		var i = Asteroid.add(conf, asteroid_id++);
		var t = Asteroid.get(asteroid_id-1);
		var c = new EC.Control(t)
			.setDraw(function(){
				t = Asteroid.get(t.id);
				if(t.orbit_active){
					C.save();
					C.beginPath()
					C.arc(t.x, t.y, t.orbit_r, 0, Math.PI*2);
					C.strokeStyle = '#451f00'
					C.lineWidth = 2 / T.scaleFactor;
					C.stroke();
					C.restore();
				}
				Asteroid.drawOne(t.id);
				})
			.setCorrelate(function(x, y){return Asteroid.correlate(x, y, t.id)})
			.setOnMove(function(isIn){})
			.setOnMouseDown(function(x, y){ var mouse = T.pointToWorld(x, y);c.mouseDelta = [t.x - mouse[0], t.y - mouse[1]];})
			.setOnDrag(function(x, y){  var mouse = T.pointToWorld(x, y); Asteroid.set(t.id, {x : Math.ceil(mouse[0] + c.mouseDelta[0]), y: Math.ceil(mouse[1] +c.mouseDelta[1])});})
		c.type = 'asteroid';
		c.Interface = new EC.ObjectInterface(t);
		c.Interface.setDraw(function(){
			T.save();
			T.setId();
			C.beginPath();
			C.fillStyle = P.INF_background;
			C.strokeStyle = P.INF_detail
			C.rect(0, P.height - 50, P.width, 50);
			C.globalAlpha = 0.7
			C.stroke();
			C.fill();
			T.restore();
		})
		
		//BOTTOM INTERFACE
		var orbit_toggle = new Controls.Switch(true)
			.set({label: ' Orbit ', w: 50, x: 20, y: P.height - 35, state: t.orbit_active})
			.setOnChange(function(state){Asteroid.set(t.id, {orbit_active: state})})
		c.Interface.addControl(orbit_toggle);
		
		var rotate_toggle = new Controls.Switch(true)
			.set({label: ' Rotate ', w: 50, x: 110, y: P.height - 35, state: t.rotate_active})
			.setOnChange(function(state){Asteroid.set(t.id, {rotate_active: state})})
		c.Interface.addControl(rotate_toggle);
		
		var rotate_label = new Controls.Label(true)
			.set({label: ' Rotate rad/s: ', text: t.rotate_speed, w: 100, x: 220, y: P.height - 31})
			.setOnChange(function(val){Asteroid.set(t.id, {rotate_speed: parseFloat(val)});})
		c.Interface.addControl(rotate_label);

		var orbit_label = new Controls.Label(true)
			.set({label: ' Orbit rad/s: ', text: t.orbit_speed, w: 100, x: 340, y: P.height - 31})
			.setOnChange(function(val){Asteroid.set(t.id, {orbit_speed: parseFloat(val)});})
		c.Interface.addControl(orbit_label);

		var variance_label = new Controls.Label(true)
			.set({label: ' Shape var: ', text: t.controlVar, w: 100, x: 460, y: P.height - 31})
			.setOnChange(function(val){
				Asteroid.set(t.id, {controlVar: parseInt(val)});
				var pts = [];
				var size = t.size; 
				pts.push({x: Math.random() * size / 2 , y: Math.random() * size / 2});		
				pts.push({x: Math.random() * size / 2 + size/2, y: Math.random() * size / 2 });
				pts.push({x: Math.random() * size / 2 + size/2, y: Math.random() * size / 2 + size / 2});
				pts.push({x: Math.random() * size / 2 , y: Math.random() * size / 2 + size / 2});
		
				Asteroid.set(t.id, {beziers: U.blobGenerator(pts, t.controlVar)});
				
				})
		c.Interface.addControl(variance_label);

		var size_label = new Controls.Label(true)
			.set({label: ' Size: ', text: t.size, w: 100, x: 580, y: P.height - 31})
			.setOnChange(function(val){
				Asteroid.set(t.id, {size: parseInt(val)});
				var pts = [];
				var size = t.size; 
				pts.push({x: Math.random() * size / 2 , y: Math.random() * size / 2});		
				pts.push({x: Math.random() * size / 2 + size/2, y: Math.random() * size / 2 });
				pts.push({x: Math.random() * size / 2 + size/2, y: Math.random() * size / 2 + size / 2});
				pts.push({x: Math.random() * size / 2 , y: Math.random() * size / 2 + size / 2});
		
				Asteroid.set(t.id, {beziers: U.blobGenerator(pts, t.controlVar)});
				})
		c.Interface.addControl(size_label);
		
		var regen_button = new Controls.Button(true)
			.set({text: 'Regenerate', x: 700, y: P.height - 31 -1, h: 14, textH: 12, w: 80, buttonFill: P.INF_background, textFill: P.INF_text})
			.setOnClick(function(x, y){
				var pts = [];
				var size = t.size; 
				pts.push({x: Math.random() * size / 2 , y: Math.random() * size / 2});		
				pts.push({x: Math.random() * size / 2 + size/2, y: Math.random() * size / 2 });
				pts.push({x: Math.random() * size / 2 + size/2, y: Math.random() * size / 2 + size / 2});
				pts.push({x: Math.random() * size / 2 , y: Math.random() * size / 2 + size / 2});
		
				Asteroid.set(t.id, {beziers: U.blobGenerator(pts, t.controlVar)});
			})
		c.Interface.addControl(regen_button);
		
		//ON OBJECT INTERFACE
		var orbit = new Controls.BaseControl(true)
			.set({active: false})
			.setDraw(function(){
				if(!t.orbit_active)return;
				T.save()
				T.translate(t.x, t.y, true);
				C.beginPath();
				C.rotate(t.orbit_theta);
				C.moveTo(0, 0); C.lineTo(-t.orbit_r, 0);
				C.arc(-t.orbit_r, 0, 10/T.scaleFactor, Math.PI*2, 0);
				C.lineWidth = 2 / T.scaleFactor;
				C.strokeStyle = (orbit.Conf.active ? P.INF_detail2 : P.INF_detail);
				C.stroke();
				C.fillStyle = P.INF_background;
				C.fill();
				T.restore();
			})
			.setCorrelate(function(x, y){
				if(!t.orbit_active)return false;
				var point = T.pointToWorld(x, y); 				
				return U.distance(point[0], point[1], t.x + Math.cos(t.orbit_theta)*(-t.orbit_r), t.y + Math.sin(t.orbit_theta)*(-t.orbit_r)) <= 10 / T.scaleFactor
			})
			.setOnMove(function(isIn){orbit.set({active: isIn}); if(isIn)document.body.style.cursor = 'pointer';})
			.setOnDrag(function(x, y){
				var point = T.pointToWorld(x, y); 
				Asteroid.set(t.id, {orbit_theta: U.angleBetween(t.x,t.y, point[0], point[1]) + Math.PI, orbit_r: Math.ceil(U.distance(point[0], point[1], t.x, t.y))});
				})
		c.Interface.addControl(orbit);
	
		var delete_button = new Controls.BaseControl(true)
			.set({active: false})
			.setDraw(function(){
				var center = Asteroid.getCenterOf(t.id);
				T.save()
				T.translate(center.x + t.size / 2, center.y - t.size / 2, true);
	
				C.lineWidth = 2 / T.scaleFactor;
				C.strokeStyle = (delete_button.Conf.active ? P.INF_detail2 : P.INF_detail);
	
				C.beginPath();			
				C.moveTo(0,0); C.lineTo(-t.size / 2, t.size / 2);C.stroke();
				
				C.beginPath();
				C.arc(0, 0, 10/T.scaleFactor, Math.PI*2, 0);
				C.stroke();
				C.fillStyle = P.INF_background;
				C.fill();
				
				C.beginPath();
				C.rotate(Math.PI / 4)
				C.moveTo(5 / T.scaleFactor, 0);
				C.lineTo(-5 / T.scaleFactor, 0);
				C.moveTo(0, 5 / T.scaleFactor);
				C.lineTo(0, -5 / T.scaleFactor);	
				C.stroke();
				
				T.restore();
			})
			.setCorrelate(function(x, y){
				var center = Asteroid.getCenterOf(t.id);
				var point = T.pointToWorld(x, y); 
				return U.distance(point[0], point[1], center.x + t.size / 2, center.y - t.size / 2) <= 10 / T.scaleFactor
			})
			.setOnMove(function(isIn){delete_button.set({active: isIn}); if(isIn)document.body.style.cursor = 'pointer';})
			.setOnClick(function(x, y){c.Interface.hide(); EC.Level.onTop(); Asteroid.destroy(t.id); EC.remove(c)})
		c.Interface.addControl(delete_button);
	}

	function serialize(){
		L.ship = S.i;
		var objs = EC.serialize();
		L.planets = objs.planet;
		L.trash = objs.trash;
		L.asteroid = objs.asteroid;
		
		//levelRect && destination
		L.objective.destination = false
		var xMin = S.i.x, xMax = S.i.x, yMin = S.i.y, yMax = S.i.y;
		for(var i = 0; i < L.planets.length; i++){
			var p = L.planets[i]
			xMin = Math.min(xMin, p.x - p.r - p.orbit_r);
			xMax = Math.max(xMax, p.x + p.r + p.orbit_r);
			yMin = Math.min(yMin, p.y - p.r - p.orbit_r);
			yMax = Math.max(yMax, p.y + p.r + p.orbit_r);
			if(p.destination_objective)L.objective.destination = true;
		}
		for(var i = 0; i < L.trash.length; i++){
			var t = L.trash[i]
			xMin = Math.min(xMin, t.x - t.orbit_r);
			xMax = Math.max(xMax, t.x + t.size + t.orbit_r);
			yMin = Math.min(yMin, t.y - t.orbit_r);
			yMax = Math.max(yMax, t.y + t.size + t.orbit_r);
		}
		for(var i = 0; i < L.asteroid.length; i++){
			var t = L.asteroid[i]
			xMin = Math.min(xMin, t.x - t.orbit_r);
			xMax = Math.max(xMax, t.x + t.size + t.orbit_r);
			yMin = Math.min(yMin, t.y - t.orbit_r);
			yMax = Math.max(yMax, t.y + t.size + t.orbit_r);
		}
		L.level_rect = {x: Math.ceil(xMin) - 200, y: Math.ceil(yMin) - 200, w: Math.ceil(xMax) - Math.ceil(xMin) + 400, h: Math.ceil(yMax - yMin) + 400}
		
		L.init.W2V = T.getW2V();
		L.init.V2W = T.getV2W();
		L.init.offsetX = 0
		L.init.offsetY = 0
		
		L.init.zoom = T.scaleFactor;
	
	}
	
	//Init
	for(var i = 0; i < L.planets.length; i++)addPlanet(L.planets[i]);
	for(var i = 0; i < L.trash.length; i++)addTrash(L.trash[i]);
	for(var i = 0; i < L.asteroid.length; i++)addAsteroid(L.asteroid[i]);
	
	if(L.init.W2V){
		T.setW2V(L.init.W2V);
		T.setV2W(L.init.V2W);
		T.scaleFactor = L.init.zoom;
	}else{
		T.translate(L.init.offsetX, L.init.offsetY)
		T.scale(L.init.zoom);
	}		

		animManager.addLoop(draw).start();
}