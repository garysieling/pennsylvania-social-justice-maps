import * as React from "react";

import { loadPatterns, nextPattern, layerStyle } from "../shared/patterns";

import { 
  MapContainer, 
  TileLayer,
  GeoJSON
} from "react-leaflet";

import {  
  Grid
} from "theme-ui";

import * as COLOR_SCHEMES from 'd3-scale-chromatic';

import {Legend, recomputeColoration} from '../components/Legend';import Description from '../components/Description';
import RenderingControls from '../components/RenderingControls';
import Facets from '../components/Facets';
import CopyLink from '../components/CopyLink';
import SheetPicker from '../components/SheetPicker';

import {
  position,
  zoom,
  pageStyles,
  loadBaseLayer
} from '../shared/app';


let cacheBuster = 0;


const IndexPage = () => {
  console.time("render");

  const [facets, updateFacets] = React.useState({});
  const [coloration, setColorStrategy] = React.useState({});
  const [legend, setLegend] = React.useState({});
  const [description, setDescription] = React.useState('');

  function setColoration({facet, attribute, rangeColorScheme}) {
    console.time("setColoration");
    const colorFn = COLOR_SCHEMES[rangeColorScheme] || COLOR_SCHEMES.interpolatePlasma;

    const colorationResults = recomputeColoration({facet, attribute}, colorFn, facets);

    updateFacets(colorationResults.facets);
    setColorStrategy({
      facet: facet, 
      attribute: attribute
    });

    setLegend(colorationResults.legend);
    console.timeEnd("setColoration");
  }

  React.useEffect(
    () => loadBaseLayer(updateFacets)
  );

  loadPatterns();

  const facetClicker = (e) => {
    console.time("facetClicker");
    const facetName = e.target.dataset.facetname;

    //const newFacets = cloneDeep(facets);
    const newFacets = Object.assign({}, facets);
    Object.keys(newFacets[facetName].values)
      .map(
        key => {
          newFacets[facetName].values[key].selected = e.target.checked;
        }
      );

    newFacets[facetName].visible = e.target.checked;

    if (coloration.facet && coloration.attribute) {
      setColoration(coloration);
    }
    
    updateFacets(newFacets);
    console.timeEnd("facetClicker");
  } 

  const facetItemClicker = (e) => {
    console.time("facetItemClicker");
    const facetName = e.target.dataset.facetname;
    const facetValue = e.target.dataset.facetvalue;

    //const newFacets = cloneDeep(facets);
    const newFacets = Object.assign({}, facets);
    newFacets[facetName].values[facetValue].selected = e.target.checked;

    if (e.target.checked) {
      newFacets[facetName].visible = true;
    }

    if (coloration.facet && coloration.attribute) {
      setColoration(coloration);
    }

    updateFacets(newFacets);
    console.timeEnd("facetItemClicker");
  }

  const layers = Object.keys(facets)
    .map(
      (key) => facets[key]
    ).filter(
      (facet) => !!facet.geojson
    ).sort(
      (facetA, facetB) => 
        facetA.geojson.features.length - 
        facetB.geojson.features.length
    );

  const facetLayers = 
    layers.filter(
      (layer) => layer.visible
    ).map(
      (layer) => {
        const filteredGeojson = Object.assign({}, layer.geojson);

        filteredGeojson.features = filteredGeojson.features.filter(
          (feature) => {
            const facetValue = feature.properties._name;

            return facets[layer.name].values[facetValue].selected;
          }
        );
    
        return (
          <GeoJSON
            key={layer.name + (cacheBuster++)}
            onEachFeature={(feature, leafletLayer) => {
                const popupOptions = {
                    minWidth: 100,
                    maxWidth: 250,
                    className: "popup-classname"
                };
      
                leafletLayer.bindPopup(()=>{
                  const clickedItemName = feature.properties._name;
                  let tooltipContents = '<b>' + layer.name + '</b>: ' + clickedItemName + '<br />'
                     + '<b>Area: </b>' + feature.properties._areaInMiles + ' square miles<br />';
                 
                  if (layer.attributesToDisplay) {
                    layer.attributesToDisplay.map(
                      (attr) => {
                        const attributesForSelected = feature.properties;
                        if (!attributesForSelected) {
                          return '';
                        }

                        let attributeValue = attributesForSelected[attr];

                        tooltipContents += '<b>' + attr + '</b>: ' + attributeValue + '<br />';
                      }
                    );
                  }

                  return tooltipContents;
                }, popupOptions);
            }}
            style={layerStyle}
            data={filteredGeojson} />
        );
      }
    );

  const result = (
    <Grid
      gap={2} 
      columns={[2, '0.5fr 5fr']}>
      <aside>
        <Facets title={'Facets'}
          layers={layers} 
          facets={facets}
          facetClicker={facetClicker}
          facetItemClicker={facetItemClicker}
        />
      </aside>    
      <main style={pageStyles}>
        <Grid
          gap={2} 
          columns={[2, '1fr 1fr']}>
            <div>
              <SheetPicker />
              <RenderingControls 
                layers={layers} 
                facets={facets} 
                setColoration={setColoration}
              />
            </div>
            <div>
              <Description description={description} />
              <Legend data={legend} />
            </div>
        </Grid>
          <MapContainer style={{ height: '600px' }} center={position} zoom={zoom} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            { facetLayers }
          </MapContainer>
          <CopyLink facets={facets} coloration={coloration} />
      </main>
    </Grid>
  );

  console.timeEnd("render");
  
  return result;
}

export default IndexPage;