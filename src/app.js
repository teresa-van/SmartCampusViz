// #region Constants, Variables, Initialization
var darkStyle = 'mapbox://styles/mapbox/dark-v10'; //'http://162.246.156.156:8080/styles/dark-matter/style.json';
var lightStyle = 'mapbox://styles/mapbox/light-v10'; //'http://162.246.156.156:8080/styles/positron/style.json';

var deckgl;

var dataView = 'paths';
var allPolyPoints = [{}, {}];
var drawing = false;
var syncPolygons = false;
var loaded = 0;

var map;
var rightMap;
var leftMap;

var startTime = 0;
var loopLength = 2000;
var animationSpeed = 20;
var loopTime = loopLength / animationSpeed;
var currentTime = 0;
var animation;

paths[0].onChange(e => updateVisualization(0));
paths[1].onChange(e => updateVisualization(1));

staypoints[0].onChange(e => updateVisualization(0));
staypoints[1].onChange(e => updateVisualization(1));

// #endregion

$(function () 
{
	mapboxgl.accessToken = 'pk.eyJ1IjoidGVyZXNhLXZhbiIsImEiOiJjanF3cGV6MHgwYWw3NDhzYnU0MzhveWRpIn0.2L-9hptK5Va1-PjdKC_fVA';
	updatePaths(0);
	updatePaths(1);

	updateStaypoints(0);
	updateStaypoints(1);

	createLayers();
	initMaps();

    leftMap.on('load', function () 
    {
		addMapLayers(leftMap, [leftGeoJsonLayer, leftPathsLayer, leftStaypointsLayer, leftBuildingLabelLayer]);
        mapLoaded();
    });

    rightMap.on('load', function ()
    {
		addMapLayers(rightMap, [rightGeoJsonLayer, rightStaypointsLayer, rightBuildingLabelLayer]);
        mapLoaded();
	});

	deckgl = new Deck
	({
		canvas: 'rightDeck',
		width: '100%',
		height: '100%',
		initialViewState: initialViewState,
		controller: false,
		layers: [ 
			rightPathsLayer,
		]
	});

	rightMap.on('render', function()
	{
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

function initMaps()
{
	leftMap = createMap('leftMap', darkStyle);
	rightMap = createMap('rightMap', darkStyle);

	map = new mapboxgl.Compare(leftMap, rightMap, {});
	map._setPosition(0);
}

function mapLoaded()
{
    loaded++;

    if (loaded < 2)
        return;

    addNavigationControls();
    addDrawControls();
	addScaleControls();
	
	animate();

	startTime = Date.now();

	function animate()
	{
		var timeStamp = (Date.now() - startTime) / 1000;
		currentTime = ((timeStamp % loopTime) / loopTime) * loopLength;
		// console.log(currentTime);

		// var leftLayer = new TripsLayer
		// ({
		// 	id: 'leftPathsLayer',
		// 	// type: TripsLayer,
		// 	data: PATHSVISUAL[0],
		// 	getPath: p => p.path,
		// 	getColor: p => p.azimuthColor,
		// 	opacity: 0.02 * (maxPaths / PATHSVISUAL[0].length / 6),
		// 	widthMinPixels: 2,
		// 	rounded: true,
		// 	trailLength: 100,
		// 	currentTime: currentTime
		// })

		var rightLayer = new TripsLayer
		({
			id: 'rightPathsLayer',
			// type: TripsLayer,
			data: PATHSVISUAL[1],
			getPath: p => p.path,
			getColor: p => p.azimuthColor,
			opacity: 0.02 * (maxPaths / PATHSVISUAL[1].length),
			widthMinPixels: 2,
			rounded: true,
			trailLength: 100,
			currentTime: currentTime
		})

		deckgl.setProps({ layers: [rightLayer] });

		// rightPathsLayer.setProps({ currentTime: currentTime });

		animation = requestAnimationFrame(animate);
	}
}

function updateVisualization(index)
{
	if (dataView === 'paths')
	{
		var layer = (index == 0) ? leftPathsLayer : rightPathsLayer;
		updatePaths(index);
		// layer.setProps({ data: PATHSVISUAL[index], opacity: 0.02 * (maxPaths / PATHSVISUAL[index].length / 6) });
	}
	else
	{
		var layer = (index == 0) ? leftStaypointsLayer : rightStaypointsLayer;
		updateStaypoints(index);
		layer.setProps({ data: STAYPOINTSVISUAL[index], opacity: Math.min(1, 0.02 * (maxStaypoints / STAYPOINTSVISUAL[index].length / 3)) });
	}

	// renderAll();
}

function updateCursor(e)
{
	drawing = !drawing;
}

function createMap(container, style)
{
	return new mapboxgl.Map
	({
		container: container,
		style: style, // Using our own map server as opposed to Mapbox's server
		// interactive: true,
		center: [initialViewState.longitude, initialViewState.latitude],
		zoom: initialViewState.zoom,
		bearing: initialViewState.bearing,
		pitch: initialViewState.pitch,
		antialias: true,
	});
}

function addMapLayers(_map, layers)
{
	for (var i in layers)
	{
		_map.addLayer(layers[i]);
		layers[i].deck.props.getCursor = () => drawing ? "crosshair" : "grab";
	}
}

function addNavigationControls()
{
	rightMap.addControl(new mapboxgl.NavigationControl());
}

function addScaleControls()
{
	var scale = new mapboxgl.ScaleControl({
		maxWidth: 200,
		unit: 'metric'
	});

	rightMap.addControl(scale, 'bottom-right');
}

function addDrawControls()
{
	leftDraw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
            polygon: true,
            trash: true
		},
		userProperties: true,
		styles: polyStyle
    });

    rightDraw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
            polygon: true,
            trash: true
		},
		userProperties: true,
		styles: polyStyle
    });

    rightMap.addControl(rightDraw);
    leftMap.addControl(leftDraw, "top-left");

    rightMap.on('draw.create', updateAreaR);
    rightMap.on('draw.delete', updateAreaR);
    rightMap.on('draw.update', updateAreaR);
	rightMap.on('draw.modechange', updateCursor);

    leftMap.on('draw.create', updateAreaL);
    leftMap.on('draw.delete', updateAreaL);
    leftMap.on('draw.update', updateAreaL);
	leftMap.on('draw.modechange', updateCursor);

    function updateAreaL(e)
    {
        updateArea(e, 0);
    }

    function updateAreaR(e)
    {
        updateArea(e, 1);
	}

	function updateArea(e, index) 
	{
		var id = e.features[0].id;
		if (e.type == 'draw.delete') 
		{
			delete allPolyPoints[index][id];
			filterWithPolygons(true, index);
		}
		else
		{
			allPolyPoints[index][id] = [e.features[0].geometry.coordinates[0]];
			filterWithPolygons((e.type == 'draw.update'), index);
		}
	}

	// $("#toggleSyncButton").click(TogglePolygonSync);

    // function TogglePolygonSync()
    // {
    //     rightDraw.deleteAll();
    //     leftDraw.deleteAll();
    //     syncPolygons = !syncPolygons;
    // }

    $("#toggleCompareButton").click(toggleCompare);

    var compareVisible = false;

    function toggleCompare()
    {
        setCompare(!compareVisible);
    }

    function setCompare(visible)
    {
        $("#leftContainer").css({ "visibility": (visible ? "visible" : "hidden"), "opacity": (visible ? "1" : "0") });
        map._setPosition(visible ? $(document).width() / 2 : 0);
        compareVisible = visible;
    }
}

function filterWithPolygons(remove, index)
{
	if (remove)
	{
		if (dataView === 'paths') findPathsPassingThroughAllPolygons(index);
		else findStaypointsWithinAllPolygons(index);
	}
	else
	{
		if (dataView === 'paths') findPathsPassingThroughPolygon(index);
		else findStaypointsWithinPolygon(index);
	}
}

