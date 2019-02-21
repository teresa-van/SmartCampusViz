import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL, {Navigation} from 'react-map-gl';
import DeckGL, {LineLayer, ScatterplotLayer, GeoJsonLayer} from 'deck.gl';

const GEOJSON = "./Campus_buildings_updated3.geojson";
  // 'https://api.myjson.com/bins/rztu6'; //eslint-disable-line
  // 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_1_states_provinces_shp.geojson'; //eslint-disable-line

const INITIAL_VIEW_STATE = {
  latitude: 51.078,
  longitude: -114.132,
  zoom: 15.25,
  bearing: 0,
  pitch: 0
};

class Root extends Component {
  render() {
    return (
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        width="100%"
        height="100%"
        layers={[
          new GeoJsonLayer({
            data: GEOJSON,
            stroked: true,
            filled: true,
            lineWidthMinPixels: 2,
            getLineColor: () => [255, 255, 255],
            getFillColor: () => [200, 200, 200]
          })
        ]}
        >
        <MapGL mapStyle="http://localhost:8081/styles/positron/style.json"/>
      </DeckGL>
    );
  }
}

/* global document */
render(<Root />, document.body.appendChild(document.createElement('div')));
