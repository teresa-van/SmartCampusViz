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

const map = new mapboxgl.Map
({
  container: 'map',
  style: 'http://localhost:8081/styles/dark-matter/style.json',
  // Note: deck.gl will be in charge of interaction and event handling
  interactive: false,
  center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
  zoom: INITIAL_VIEW_STATE.zoom,
  bearing: INITIAL_VIEW_STATE.bearing,
  pitch: INITIAL_VIEW_STATE.pitch
});

const buildings = new GeoJsonLayer
({
    id: 'geojsonLayer',
    data: data.GEOJSON,
    stroked: true,
    filled: true,
    getLineColor: [150, 150, 150],
    getFillColor: [200, 200, 200, 180],
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
        catch(error){};
      /* Update tooltip
         http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
      */
    }
});

// const points = new ScatterplotLayer
// ({


// });

const paths = new PathLayer
({
    id: 'pathLayer',
    data: data.PATHS,
    opacity: 0.01,
    getPath: f => f.path,
    getColor: f => f.color,
    getWidth: 1,
    getDashArray: [20, 0],
    widthMinPixels: 1,
    pickable: true,
    lightSettings: LIGHT_SETTINGS,
  }
);

export const deck = new Deck
({
  canvas: 'deck-canvas',
  width: '100%',
  height: '100%',
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  onViewStateChange: ({viewState}) => {
    map.jumpTo({
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      bearing: viewState.bearing,
      pitch: viewState.pitch
    });
  },
  layers:
  [
      buildings,
      paths
  ]
});
