import {Deck} from '@deck.gl/core';
import
{
	GeoJsonLayer,
	PathLayer,
	ScatterplotLayer
} from '@deck.gl/layers';
import mapboxgl from 'mapbox-gl';
import * as data from './data';

const INITIAL_VIEW_STATE =
{
	latitude: 51.078,
	longitude: -114.132,
	zoom: 15.25,
	bearing: 0,
	pitch: 0
};

const LIGHT_SETTINGS =
{
	lightsPosition: [-122.45, 37.66, 8000, -122.0, 38.0, 8000],
	ambientRatio: 0.3,
	diffuseRatio: 0.6,
	specularRatio: 0.4,
	lightsStrength: [1, 0.0, 0.8, 0.0],
	numberOfLights: 2
};

var view = INITIAL_VIEW_STATE;

// Create base map
const map = new mapboxgl.Map
({
	container: 'map',
	style: 'http://162.246.156.156:8080/styles/dark-matter/style.json', // Using our own map server as opposed to Mapbox's server
	// Note: deck.gl will be in charge of interaction and event handling
	interactive: false,
	center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
	zoom: INITIAL_VIEW_STATE.zoom,
	bearing: INITIAL_VIEW_STATE.bearing,
	pitch: INITIAL_VIEW_STATE.pitch,
});

// Create buildings from campus shape files
const buildings = new GeoJsonLayer
({
	id: 'geojsonLayer',
	data: data.GEOJSON,
	stroked: true,
	filled: true,
	getLineColor: [100, 100, 100],
	getFillColor: [150, 150, 150, 100],
	opacity: 0.25,
	lineWidthMinPixels: 2,
	pickable: true,
	fp64: true,
	lightSettings: LIGHT_SETTINGS,
	onClick: ({object, x, y}) =>
	{
		try
		{
			const tooltip = object.properties.Building_n;
			console.log(tooltip);
		}
		catch(error) { };
		/* Update tooltip
			http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
		*/
	}
});

const staypoints = new ScatterplotLayer
({
	id: 'scatterplotLayer',
	data: data.STAYPOINTSVISUAL,
    getPosition: p => p.point,
    getFillColor: [255, 250, 0],
    opacity: 0.01,
    getRadius: 0.5,
    radiusScale: 2 ** (30 - view.zoom),
    radiusMinPixels: 0.1,
    radiusMaxPixels: 2,
	pickable: false,
    lightSettings: LIGHT_SETTINGS
	
});

// Create paths
const paths = new PathLayer
({
    id: 'pathLayer',
    data: data.PATHSVISUAL,
    getPath: p => p.path,
    getColor: p => p.azimuthColor,
    opacity: 0.01 * Math.sqrt(data.maxPaths / data.PATHSVISUAL.length, 2),
	getWidth: 2,
	widthScale: 2 ** (15 - view.zoom),
	widthMinPixels: 0.1,
	widthMaxPixels: 2,
	rounded: true,
    pickable: false,
	lightSettings: LIGHT_SETTINGS
});

// Create and render deck
export const deck = new Deck
({
	canvas: 'deck-canvas',
	width: '100%',
	height: '100%',
	initialViewState: INITIAL_VIEW_STATE,
	controller: true,
	onViewStateChange: ({viewState}) => 
	{
		map.jumpTo
		({
			center: [viewState.longitude, viewState.latitude],
			zoom: viewState.zoom,
			bearing: viewState.bearing,
			pitch: viewState.pitch
		});
		view = viewState;
	},
	layers:
	[
		buildings,
		paths,
		// staypoints
	]
});
