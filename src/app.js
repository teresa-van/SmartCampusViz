// #region Constants, Variables, Initialization
var darkStyle = 'mapbox://styles/mapbox/dark-v10'; //'http://162.246.156.156:8080/styles/dark-matter/style.json';
var lightStyle = 'mapbox://styles/mapbox/light-v10'; //'http://162.246.156.156:8080/styles/positron/style.json';

var deckgl;

var dataView = ['paths', 'paths'];
var allPolyPoints = [{}, {}];
var drawing = false;
var syncPolygons = false;
var loaded = 0;

var compareVisible = false;
var animating = false;

var loopLength = 1800;
var animationSpeed = 30;
var loopTime = loopLength / animationSpeed;
var animation;

var start = Date.now();

var map;
var rightMap;
var leftMap;

paths[0].onChange(e => updateVisualization(0));
paths[1].onChange(e => updateVisualization(1));

restpoints[0].onChange(e => updateVisualization(0));
restpoints[1].onChange(e => updateVisualization(1));

// #endregion

$(document).ready(function() 
{
	setTimeout(function()
	{
        $('body').addClass('loaded');
    }, 3000);
});

$(function () 
{
	mapboxgl.accessToken = 'pk.eyJ1IjoidGVyZXNhLXZhbiIsImEiOiJjanF3cGV6MHgwYWw3NDhzYnU0MzhveWRpIn0.2L-9hptK5Va1-PjdKC_fVA';
	updatePaths(0);
	updatePaths(1);

	updateRestpoints(0);
	updateRestpoints(1);

	createLayers();
	initMaps();

    leftMap.on('load', function () 
    {
		addMapLayers(leftMap, [leftBuildingLabelLayer, leftGeoJsonLayer, leftPathsLayer, leftRestpointsLayer],
			['', 'leftBuildingLabelLayer', 'leftGeoJsonLayer', 'leftGeoJsonLayer'], 0);
        mapLoaded();
    });

    rightMap.on('load', function ()
    {
		addMapLayers(rightMap, [rightBuildingLabelLayer, rightGeoJsonLayer, rightPathsLayer, rightRestpointsLayer],
			['', 'rightBuildingLabelLayer', 'rightGeoJsonLayer', 'rightGeoJsonLayer'], 1);
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
			animatedPathsLayer
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

	function animate()
	{
		if (animating)
		{
			var timeStamp = (Date.now() - start) / 1000;
			var currentTime = ((timeStamp % loopTime) / loopTime) * loopLength

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

			deckgl.setProps({ layers: [animatedPathsLayer] });
		}
		animation = requestAnimationFrame(animate);
	}
}

function updateVisualization(index)
{
	if (dataView[index] === 'paths')
	{
		var layer = (index == 0) ? leftPathsLayer : rightPathsLayer;
		updatePaths(index);
		layer.setProps({ data: PATHSVISUAL[index], opacity: 0.02 * (maxPaths / PATHSVISUAL[index].length / 3) });
	}
	else
	{
		var layer = (index == 0) ? leftRestpointsLayer : rightRestpointsLayer;
		updateRestpoints(index);
		layer.setProps({ data: RESTPOINTSVISUAL[index], opacity: Math.min(1, 0.02 * (maxRestpoints / RESTPOINTSVISUAL[index].length / 3)) });
	}

	updateInfo(index);
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

function addMapLayers(_map, layers, order, index)
{
	for (var i in layers)
	{
		_map.addLayer(layers[i], order[i]);
		layers[i].deck.props.getCursor = () => drawing ? "crosshair" : "grab";
		layers[i].deck.props.pickingRadius = 5;
		layers[i].deck.props.onClick = (info) => handleHighlight(info, index);
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
}

function filterWithPolygons(remove, index)
{
	if (remove)
	{
		if (dataView[index] === 'paths') findPathsPassingThroughAllPolygons(index);
		else findRestpointsWithinAllPolygons(index);
	}
	else
	{
		if (dataView[index] === 'paths') findPathsPassingThroughPolygon(index);
		else findRestpointsWithinPolygon(index);
	}
}

function handleHighlight(info, index)
{
	if (info.object == null)
	{
		if (index == 0)
		{
			if (dataView[index] == "paths")
				leftPathsLayer.setProps({ highlightedObjectIndex: -1 });
			else
				leftRestpointsLayer.setProps({ highlightedObjectIndex: -1 });
		}
		else
		{
			if (dataView[index] == "paths")
				rightPathsLayer.setProps({ highlightedObjectIndex: -1 });
			else
				rightRestpointsLayer.setProps({ highlightedObjectIndex: -1 });
		}
		
	}
}

