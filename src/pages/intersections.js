import * as React from "react";

import { 
  MapContainer, 
  TileLayer,
  GeoJSON
} from "react-leaflet";

import {  
  Grid, 
  Button
} from "theme-ui";

import { cloneDeep } from "lodash";

import { 
  schemeTableau10 as tileRenderColorScheme,
} from 'd3-scale-chromatic';

import * as COLOR_SCHEMES from 'd3-scale-chromatic';

import CopyLink from '../components/CopyLink';
import Legend from '../components/Legend';
import Description from '../components/Description';
import RenderingControls from '../components/RenderingControls';
import Facets from '../components/Facets';
import intersections from '../data/intersections';


import {
  position,
  zoom,
  DEFAULT_BLUE,
  DEFAULT_LEGEND,
  pageStyles,
  buttonStyle,
  globalExists,
  filterMap,
  sourceData,
  recomputeColoration
} from '../shared/app';


let firstLoad = true;

let cacheBuster = 0;


const IndexPage = () => {
  console.time("render");

  const [facets, updateFacets] = React.useState({});
  const [intersectionFacets, updateIntersectionFacets] = React.useState({});
  const [coloration, setColorStrategy] = React.useState({});
  const [legend, setLegend] = React.useState({});
  const [description, setDescription] = React.useState('');
  const [selectedIntersections, setIntersections] = React.useState({});

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

  let urlFacetData = {};
  if (globalExists('window')) {
    if (window.location.href.indexOf('?') > 0) {
      const jsonFromUrl = window.location.href.split('?')[1];
      try {
        urlFacetData = JSON.parse(decodeURI(jsonFromUrl));
      } catch (e) {
        console.log(e);
      }
    }
  }

  React.useEffect(
    () => {
      if (firstLoad) {
        firstLoad = false;
        const initialFacetData = {};
        Promise.all(
          sourceData.map(
            (facet) => 
              fetch(facet.source)
                .then(res => res.text())
                .then(jsonText => {
                  console.time("process " + facet.name);
                  const geojson = JSON.parse(jsonText);

                  let facetLayerVisible = 
                    urlFacetData.hasOwnProperty(facet.key + '');

                  initialFacetData[facet.name] = Object.assign(
                    facet, {
                      'visible': facetLayerVisible,
                      'showMore': false,
                      'geojson': geojson,
                      'values': {}
                    }
                  );

                  geojson.features.map(
                    feature => {
                      const facetValue = feature.properties._name;

                      let tileRenderColor = DEFAULT_BLUE;

                      let selected = false;
                      if (urlFacetData.hasOwnProperty(facet.key + '')) {
                        selected = urlFacetData[facet.key + ''].includes(facetValue);
                      }

                      initialFacetData[facet.name].values[facetValue] = {
                        selected: selected,
                        tileRenderColor: tileRenderColor
                      }
                    }
                  )

                  console.timeEnd("process " + facet.name);
                })
          )
        ).then(
          responses => {
            updateFacets(initialFacetData);
            updateIntersectionFacets(initialFacetData);
          }
        );
      }
    }
  );

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

  const facetIntersectionClicker = (e) => {
    console.time("facetIntersectionClicker");
    const facetName = e.target.dataset.facetname;

    const newIntersectionFacets = Object.assign({}, intersectionFacets);
    Object.keys(newIntersectionFacets[facetName].values)
      .map(
        key => {
          newIntersectionFacets[facetName].values[key].selected = e.target.checked;
        }
      );

    newIntersectionFacets[facetName].visible = e.target.checked;

    updateIntersectionFacets(newIntersectionFacets);
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

  
  const intersectionItemClicker = (e) => {
    const facetName = e.target.dataset.facetname;
    const facetValue = e.target.dataset.facetvalue;

    const newIntersectionFacets = Object.assign({}, intersectionFacets);
    newIntersectionFacets[facetName].values[facetValue].selected = e.target.checked;

    if (e.target.checked) {
      newIntersectionFacets[facetName].visible = true;
    }

    updateIntersectionFacets(newIntersectionFacets);
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
                  let tooltipContents = '<b>' + layer.name + '</b>: ' + clickedItemName + '<br />';
                 
                  if (layer.attributesToDisplay) {
                    layer.attributesToDisplay.map(
                      (attr) => {
                        const attributesForSelected = (layer.attributes || {})[clickedItemName];
                        if (!attributesForSelected) {
                          return '';
                        }

                        let attributeValue = attributesForSelected[attr];

                        if (layer.attributeNumericAttributes.indexOf(attr) > 0) {
                          attributeValue = attributeValue.toLocaleString('en-US')
                        }

                        tooltipContents += '<b>' + attr + '</b>: ' + attributeValue + '<br />';
                      }
                    );
                  }

                  const interactsWith = intersections[layer.name + ':'+ clickedItemName];

                  if (interactsWith) {
                    const intersectKeys = {};
                    interactsWith.map(
                      (key) => key.split(":")
                    ).map(
                      ([key, value]) => {
                        if (!intersectKeys.hasOwnProperty(key)) {
                          intersectKeys[key] = [];
                        }

                        intersectKeys[key].push(value);
                        intersectKeys[key].sort();
                      }
                    );

                    setIntersections(intersectKeys);
                  }

                  return tooltipContents;
                }, popupOptions);
            }}
            style={
              (reference) => {
                const facetName = layer.name;
                const facetValue = reference.properties._name;

                const colorFromFacet = facets[facetName].values[facetValue].tileRenderColor;
                const defaultColor = DEFAULT_BLUE;
                
                return {
                  color: colorFromFacet || defaultColor
                };
              }
            }
            data={filteredGeojson} />
        );
      }
    );

  const result = (
    <Grid
      gap={2} 
      columns={[3, '0.8fr .5fr 3fr']}>
      <aside>
        <Facets title={'Facets'}
          layers={layers} 
          facets={facets}
          facetClicker={facetClicker}
          facetItemClicker={facetItemClicker}
        />
      </aside>
      <aside>
      <Facets title={'Intersects'}
          layers={layers} 
          facets={intersectionFacets}
          facetClicker={facetIntersectionClicker}
          facetItemClicker={intersectionItemClicker}
          filters={selectedIntersections}
        />
      </aside>     
      <main style={pageStyles}>
        <Grid
          gap={2} 
          columns={[2, '1fr 1fr']}>
            <div>
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