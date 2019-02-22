import {Deck} from '@deck.gl/core';
import {GeoJsonLayer} from '@deck.gl/layers';
import mapboxgl from 'mapbox-gl';

// // Outlines of US States. Source: Natural Earth http://www.naturalearthdata.com/ via geojson.xyz
const GEOJSON =
    'Campus_buildings_updated3.geojson';
  // 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson'; //eslint-disable-line
  // 'https://raw.githubusercontent.com/teresa-van/SmartCampusViz/master/pure/Campus_buildings_updated3.geojson';

console.log(GEOJSON);

const INITIAL_VIEW_STATE =
{
  latitude: 51.078,
  longitude: -114.132,
  zoom: 15.25,
  bearing: 0,
  pitch: 0
};

// Set your mapbox token here
// mapboxgl.accessToken = "pk.eyJ1IjoidGVyZXNhLXZhbiIsImEiOiJjanF3cGV6MHgwYWw3NDhzYnU0MzhveWRpIn0.2L-9hptK5Va1-PjdKC_fVA" // eslint-disable-line

const map = new mapboxgl.Map
({
  container: 'map',
  style: 'http://localhost:8081/styles/positron/style.json',
  // Note: deck.gl will be in charge of interaction and event handling
  interactive: false,
  center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
  zoom: INITIAL_VIEW_STATE.zoom,
  bearing: INITIAL_VIEW_STATE.bearing,
  pitch: INITIAL_VIEW_STATE.pitch
});

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
    new GeoJsonLayer
    ({
      data: GEOJSON,
      stroked: true,
      filled: true,
      lineWidthMinPixels: 2,
      opacity: 0.4,
      getLineColor: [255, 100, 100],
      getFillColor: [255, 160, 0, 180]
    })
  ]
});
