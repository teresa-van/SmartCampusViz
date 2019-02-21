import React, {Component} from 'react';
import {render} from 'react-dom';
import MapGL, {Navigation} from 'react-map-gl';
import DeckGL, {LineLayer, ScatterplotLayer, GeoJsonLayer} from 'deck.gl';

const GEOJSON =
  '/home/teresa/Documents/SmartCampusViz/react/Campus_buildings_updated3.geojson'; //eslint-disable-line

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
        ]}>
        <MapGL mapStyle="http://localhost:8081/styles/positron/style.json"/>
      </DeckGL>
    );
  }
}

/* global document */
render(<Root />, document.body.appendChild(document.createElement('div')));
