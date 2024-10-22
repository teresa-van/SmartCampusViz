const { MapboxLayer, PathLayer, ScatterplotLayer, TextLayer, TripsLayer } = deck;

const initialViewState =
{
	longitude: -114.1300,
	latitude: 51.0782,
	zoom: 15.75,
	pitch: 0,
	bearing: 0
};

var view = initialViewState;

var buildingLabelData = [];
createBuildingLabelData();

var leftPathsLayer, rightPathsLayer;
var leftRestpointsLayer, rightRestpointsLayer;
var leftGeoJsonLayer, rightGeoJsonLayer;
var leftBuildingLabelLayer, rightBuildingLabelLayer;

var animatedPathsLayer;

function createLayers()
{
	animatedPathsLayer = new TripsLayer
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
		currentTime: 0,
		visible: false
	});

	leftPathsLayer = new MapboxLayer
	({
		id: 'leftPathsLayer',
		type: PathLayer,
		data: PATHSVISUAL[0],
		getPath: p => p.path,
		getColor: p => p.azimuthColor,
		opacity: Math.min(1, 0.02 * (maxPaths / PATHSVISUAL[0].length / 3)),
		getWidth: 2,
		widthUnits: 'meters',
		widthMinPixels: 0.1,
		widthMaxPixels: 2,
		rounded: true,
		pickable: true,
		autoHighlight: true,
		highlightColor: [255, 255, 255],
		highlightedObjectIndex: null,
		onClick: ({ object }) =>
		{
			leftPathsLayer.setProps({ highlightedObjectIndex: PATHSVISUAL[0].indexOf(object)});
		},
		onHover: () =>
		{
			if (leftPathsLayer.props.highlightedObjectIndex == -1)
				leftPathsLayer.setProps({ highlightedObjectIndex: null });
		}
	});

	rightPathsLayer = new MapboxLayer
	({
		id: 'rightPathsLayer',
		type: PathLayer,
		data: PATHSVISUAL[1],
		getPath: p => p.path,
		getColor: p => p.azimuthColor,
		opacity: Math.min(1, 0.02 * (maxPaths / PATHSVISUAL[1].length / 3)),
		getWidth: 2,
		widthUnits: 'meters',
		widthMinPixels: 0.1,
		widthMaxPixels: 2,
		rounded: true,
		pickable: true,
		autoHighlight: true,
		highlightColor: [255, 255, 255],
		highlightedObjectIndex: null,
		onClick: ({ object }) =>
		{
			rightPathsLayer.setProps({ highlightedObjectIndex: PATHSVISUAL[1].indexOf(object)});
		},
		onHover: () =>
		{
			if (rightPathsLayer.props.highlightedObjectIndex == -1)
				rightPathsLayer.setProps({ highlightedObjectIndex: null });
		}
	});

	leftRestpointsLayer = new MapboxLayer
	({
		id: 'leftRestpointsLayer',
		type: ScatterplotLayer,
		data: RESTPOINTSVISUAL[0],
		getPosition: p => p.point,
		getFillColor: p => p.color,
		opacity: Math.min(1, 0.02 * (maxRestpoints / RESTPOINTSVISUAL[0].length / 3)),
		getRadius: p => p.pointSize,
		radiusScale: 1 / (view.zoom ** 2),
		radiusMinPixels: 2,
		radiusMaxPixels: 30,//p => console.log(p.pointSize),
		pickable: true,
		visible: false,
		autoHighlight: true,
		highlightColor: [255, 255, 255],
		highlightedObjectIndex: null,
		onClick: ({ object }) =>
		{
			leftRestpointsLayer.setProps({ highlightedObjectIndex: RESTPOINTSVISUAL[1].indexOf(object)});
		},
		onHover: () =>
		{
			if (leftRestpointsLayer.props.highlightedObjectIndex == -1)
				leftRestpointsLayer.setProps({ highlightedObjectIndex: null });
		}
	});

	rightRestpointsLayer = new MapboxLayer
	({
		id: 'rightRestpointsLayer',
		type: ScatterplotLayer,
		data: RESTPOINTSVISUAL[1],
		getPosition: p => p.point,
		getFillColor: p => p.color,
		opacity: Math.min(1, 0.02 * (maxRestpoints / RESTPOINTSVISUAL[1].length / 3)),
		getRadius: p => p.pointSize,
		radiusScale: 1 / (view.zoom ** 2),
		radiusMinPixels: 2,
		radiusMaxPixels: 30,//p => console.log(p.pointSize),
		pickable: true,
		visible: false,
		autoHighlight: true,
		highlightColor: [255, 255, 255],
		highlightedObjectIndex: null,
		onClick: ({ object }) =>
		{
			rightRestpointsLayer.setProps({ highlightedObjectIndex: RESTPOINTSVISUAL[1].indexOf(object)});
		},
		onHover: () =>
		{
			if (rightRestpointsLayer.props.highlightedObjectIndex == -1)
				rightRestpointsLayer.setProps({ highlightedObjectIndex: null });
		}
	});

	leftGeoJsonLayer = new MapboxLayer
	({
		id: 'leftGeoJsonLayer',
		type: GeoJsonLayer,
		data: GEOJSON,
		stroked: true,
		filled: true,
		getLineColor: [125, 125, 125],
		getFillColor: [175, 175, 175, 100],
		opacity: 0.25,
		lineWidthMinPixels: 2,
		pickable: false,
		fp64: true,
	});

	rightGeoJsonLayer = new MapboxLayer
	({
		id: 'rightGeoJsonLayer',
		type: GeoJsonLayer,
		data: GEOJSON,
		stroked: true,
		filled: true,
		getLineColor: [125, 125, 125],
		getFillColor: [175, 175, 175, 100],
		opacity: 0.25,
		lineWidthMinPixels: 2,
		pickable: false,
		fp64: true,
		// onHover: ({object, x, y}) => {
		// 	map.getCanvas().style.cursor = 'crosshair';
		// }
		// onClick: ({ object, x, y }) =>
		// {
		// 	try
		// 	{
		// 		const tooltip = object.properties.Building_n;
		// 		console.log(tooltip);
		// 	}
		// 	catch (error) { };
		// 	/* Update tooltip
		// 		http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
		// 	*/
		// }
	});

	leftBuildingLabelLayer = new MapboxLayer
	({
		id: 'leftBuildingLabelLayer',
		type: TextLayer,
		data: buildingLabelData,
		pickable: true,
		getPosition: d => d.position,
		getColor: [200, 200, 200],
		getText: d => d.id,
		getSize: 22,
		fp64: true,
		sizeScale: 1,
		sizeUnits: 'meters',
		fontFamily : 'Roboto, sans-serif',
	});

	rightBuildingLabelLayer = new MapboxLayer
	({
		id: 'rightBuildingLabelLayer',
		type: TextLayer,
		data: buildingLabelData,
		pickable: true,
		getPosition: d => d.position,
		getColor: [200, 200, 200],
		getText: d => d.id,
		getSize: 22,
		fp64: true,
		sizeScale: 1,
		sizeUnits: 'meters',
		fontFamily : 'Roboto, sans-serif',
	});

}

function createBuildingLabelData()
{
	var geojsonData;

	loadJSON(function (response)
	{
		geojsonData = JSON.parse(response);
	}, GEOJSON);

	var geojsonDataFiltered = {};
	for (let i = 1; i < geojsonData.features.length; i++)
	{
		var id = geojsonData.features[i].properties.Building_n;
		if (!Object.keys(geojsonDataFiltered).includes(id))
			geojsonDataFiltered[id] = geojsonData.features[i].geometry.coordinates[0];
		else
			geojsonDataFiltered[id].concat(geojsonData.features[i].geometry.coordinates[0]);
	}

	var i = 0;
	for (var b in geojsonDataFiltered)
	{
		var id = b;
		var position = calculateCentroid(geojsonDataFiltered[b]);
		buildingLabelData[i++] = {position: position, id: id, name: ""};
	}
}