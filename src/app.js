/*
	Main application:
	Loads and configures left and right maps
	Contains animation function
	Updates visualization upon updating data (from filtering)
	Controls polygon drawing
*/

// #region Constants, Variables, Initialization
var deckgl;

// Styles
var darkStyle = 'mapbox://styles/mapbox/dark-v10';
var lightStyle = 'mapbox://styles/mapbox/light-v10';

// Maps
var map;
var rightMap;
var leftMap;
var loaded = 0;

// Data
var dataView = ['paths', 'paths'];
var allPolyPoints = [{}, {}];

// States
var drawing = false;
var syncPolygons = false;
var compareVisible = false;
var animating = false;

// Animation
var animation;
var loopLength = 1800;
var animationSpeed = 30;
var loopTime = loopLength / animationSpeed;
var start = Date.now();

// Events
paths[0].onChange(e => updateVisualization(0));
paths[1].onChange(e => updateVisualization(1));

restpoints[0].onChange(e => updateVisualization(0));
restpoints[1].onChange(e => updateVisualization(1));

// #endregion

/*
	Hide loader and show visualization after loading is complete
*/
$(document).ready(function () {
	setTimeout(function () {
		$('body').addClass('loaded');
	}, 3000);
});

/*
	Main function
	Creates and configures maps and data, as well as deck
*/
$(function () {
	mapboxgl.accessToken = 'pk.eyJ1IjoidGVyZXNhLXZhbiIsImEiOiJjanF3cGV6MHgwYWw3NDhzYnU0MzhveWRpIn0.2L-9hptK5Va1-PjdKC_fVA';

	// Configure data
	// Paths
	updatePaths(0);
	updatePaths(1);
	// Staypoints
	updateRestpoints(0);
	updateRestpoints(1);

	// Create maps and layers
	createLayers();
	initMaps();

	leftMap.on('load', function () {
		addMapLayers(leftMap, [leftBuildingLabelLayer, leftGeoJsonLayer, leftPathsLayer, leftRestpointsLayer],
			['', 'leftBuildingLabelLayer', 'leftGeoJsonLayer', 'leftGeoJsonLayer'], 0);
		mapLoaded();
	});

	rightMap.on('load', function () {
		addMapLayers(rightMap, [rightBuildingLabelLayer, rightGeoJsonLayer, rightPathsLayer, rightRestpointsLayer],
			['', 'rightBuildingLabelLayer', 'rightGeoJsonLayer', 'rightGeoJsonLayer'], 1);
		mapLoaded();
	});

	// Create deck
	deckgl = new Deck
		({
			canvas: 'rightDeck',
			width: '100%',
			height: '100%',
			initialViewState: initialViewState,
			controller: false,
			layers: [
				animatedPathsLayer
			]
		});

	// Configure deck view to be in-sync with right map
	rightMap.on('render', function () {
		var view =
		{
			bearing: rightMap.getBearing(),
			longitude: rightMap.getCenter().lng,
			latitude: rightMap.getCenter().lat,
			pitch: rightMap.getPitch(),
			zoom: rightMap.getZoom()
		};

		deckgl.setProps({ viewState: view });
	});
});


/*
	Initialize maps with compare
*/
function initMaps() {
	leftMap = createMap('leftMap', darkStyle);
	rightMap = createMap('rightMap', darkStyle);

	map = new mapboxgl.Compare(leftMap, rightMap, {});
	map._setPosition(0);
}


/*
	Called after maps have been loaded
	Configure maps with navigation controls, draw and scale controls
	Starts animation function for paths
*/
function mapLoaded() {
	loaded++;

	if (loaded < 2)
		return;

	// Configure maps
	addNavigationControls();
	addDrawControls();
	addScaleControls();

	animate();

	// Animation function for animating paths
	function animate() {
		if (animating) {
			// Get current time prop
			var timeStamp = (Date.now() - start) / 1000;
			var currentTime = ((timeStamp % loopTime) / loopTime) * loopLength

			// Create new animated paths layer with new current time prop
			var animatedPathsLayer = new TripsLayer
				({
					id: 'animatedPathsLayer',
					// type: TripsLayer,
					data: ANIMATEPATHS,
					getPath: p => p.path,
					getColor: p => p.azimuthColor,
					opacity: Math.min(1, 0.08 * (maxPaths / ANIMATEPATHS.length) / 2),
					widthMinPixels: 2,
					rounded: true,
					trailLength: 480,
					currentTime: currentTime,
					visible: animating
				})

			// Update deck with new layer
			deckgl.setProps({ layers: [animatedPathsLayer] });
		}
		animation = requestAnimationFrame(animate);
	}
}


/*
	Update the cursor depending on drawing state
*/
function updateCursor(e) {
	drawing = !drawing;
}


/*
	Updates the visualization by resetting the data property for paths or restpoints depending on the state
*/
function updateVisualization(index) {
	// Update path visualization
	if (dataView[index] === 'paths') {
		var layer = (index == 0) ? leftPathsLayer : rightPathsLayer;
		updatePaths(index);
		layer.setProps({ data: PATHSVISUAL[index], opacity: 0.02 * (maxPaths / PATHSVISUAL[index].length / 3) });
	}
	// Update restpoints visualization
	else {
		var layer = (index == 0) ? leftRestpointsLayer : rightRestpointsLayer;
		updateRestpoints(index);
		layer.setProps({ data: RESTPOINTSVISUAL[index], opacity: Math.min(1, 0.02 * (maxRestpoints / RESTPOINTSVISUAL[index].length / 3)) });
	}

	// Update information panel with new values
	updateInfo(index);
}


/*
	Creates and returns a map
*/
function createMap(container, style) {
	return new mapboxgl.Map
		({
			container: container,
			style: style,
			center: [initialViewState.longitude, initialViewState.latitude],
			zoom: initialViewState.zoom,
			bearing: initialViewState.bearing,
			pitch: initialViewState.pitch,
			antialias: true,
		});
}


/*
	Adds specified layers to specified map at the specified index
*/
function addMapLayers(_map, layers, order, index) {
	for (var i in layers) {
		_map.addLayer(layers[i], order[i]);
		layers[i].deck.props.getCursor = () => drawing ? "crosshair" : "grab";
		layers[i].deck.props.pickingRadius = 5;
		layers[i].deck.props.onClick = (info) => handleHighlight(info, index);
	}
}


/*
	Adds navigation controls to the right (main) map
*/
function addNavigationControls() {
	rightMap.addControl(new mapboxgl.NavigationControl());
}


/*
	Adds scale controls to the right (main) map
*/
function addScaleControls() {
	var scale = new mapboxgl.ScaleControl({
		maxWidth: 200,
		unit: 'metric'
	});

	rightMap.addControl(scale, 'bottom-right');
}


/*
	Adds draw controls to the both maps
*/
function addDrawControls() {
	// Create draw control for left map
	leftDraw = new MapboxDraw({
		displayControlsDefault: false,
		controls: {
			polygon: true,
			trash: true
		},
		userProperties: true,
		styles: polyStyle
	});

	// Create draw control to right map
	rightDraw = new MapboxDraw({
		displayControlsDefault: false,
		controls: {
			polygon: true,
			trash: true
		},
		userProperties: true,
		styles: polyStyle
	});

	// Add controls
	rightMap.addControl(rightDraw);
	leftMap.addControl(leftDraw, "top-left");

	// Add listeners
	rightMap.on('draw.create', updateAreaR);
	rightMap.on('draw.delete', updateAreaR);
	rightMap.on('draw.update', updateAreaR);
	rightMap.on('draw.modechange', updateCursor);

	leftMap.on('draw.create', updateAreaL);
	leftMap.on('draw.delete', updateAreaL);
	leftMap.on('draw.update', updateAreaL);
	leftMap.on('draw.modechange', updateCursor);

	// Updates area for left map
	function updateAreaL(e) {
		updateArea(e, 0);
	}

	// Updates area for right map
	function updateAreaR(e) {
		updateArea(e, 1);
	}

	// Updates area
	function updateArea(e, index) {
		var id = e.features[0].id;
		if (e.type == 'draw.delete') {
			delete allPolyPoints[index][id];
			filterWithPolygons(true, index);
		}
		else {
			allPolyPoints[index][id] = [e.features[0].geometry.coordinates[0]];
			filterWithPolygons((e.type == 'draw.update'), index);
		}
	}
}


/*
	Calls filter function for filtering points inside drawn polygons
*/
function filterWithPolygons(remove, index) {
	if (remove) {
		if (dataView[index] === 'paths') findPathsPassingThroughAllPolygons(index);
		else findRestpointsWithinAllPolygons(index);
	}
	else {
		if (dataView[index] === 'paths') findPathsPassingThroughPolygon(index);
		else findRestpointsWithinPolygon(index);
	}
}


/*
	Handles highlighting on hover and click, and resetting to on hover when no points are clicked
*/
function handleHighlight(info, index) {
	if (info.object == null) {
		if (index == 0) {
			if (dataView[index] == "paths")
				leftPathsLayer.setProps({ highlightedObjectIndex: -1 });
			else
				leftRestpointsLayer.setProps({ highlightedObjectIndex: -1 });
		}
		else {
			if (dataView[index] == "paths")
				rightPathsLayer.setProps({ highlightedObjectIndex: -1 });
			else
				rightRestpointsLayer.setProps({ highlightedObjectIndex: -1 });
		}

	}
}

