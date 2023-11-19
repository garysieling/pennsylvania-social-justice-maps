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

import Legend from '../components/Legend';
import Description from '../components/Description';
import RenderingControls from '../components/RenderingControls';
import Facets from '../components/Facets';

import area from '@turf/area';
import intersections from '../data/intersections';

const position = [40.1546, -75.2216];
const zoom = 9;

const DEFAULT_BLUE = '#4E79A7';

const DEFAULT_LEGEND = {
  type: 'Categorical',
  attributes: {
    'All Values': DEFAULT_BLUE
  }
};

const pageStyles = {
  color: "#232129",
  padding: 96,
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
}

const buttonStyle = {
  backgroundColor: DEFAULT_BLUE,
  padding: 10,
  marginTop: 20
}

const filterMap = (map, fn) => {
  const newMap = {};
  Object.keys(map).forEach(
      (key) => {
          if (fn(map[key])) {
              newMap[key] = map[key];
          }
      }
  )
  return newMap;
}

const sourceData = [
  {
    name: 'County',
    key: '1',
    source: '/static/Counties.geojson'
  },
  {
    name: 'Zip',
    key: '2',
    source: '/static/zcta.geojson',
    nameAttribute: 'ZCTA5CE10'
  },
  {
    name: 'Municipality',
    key: '3',
    source: '/static/Municipalities.geojson'
  },
  {
    name: 'School District',
    source: '/static/SchoolDistricts.geojson',
    key: '4'
  },
  {
    name: 'Police Department',
    key: '5',
    source: '/static/Police.geojson'
  },
  {
    name: 'Magesterial Courts',
    key: '6',
    source: '/static/MagesterialCourts.geojson'
  },
  {
    name: 'PA Senate District',
    key: '7',
    source: '/static/Pennsylvania_State_Senate_Boundaries.geojson'
  },
  {
    name: 'PA House District',
    key: '8',
    source: '/static/Pennsylvania_State_House_Boundaries.geojson'
  },
  {
    name: 'State Police',
    key: '9',
    source: '/static/StatePolice.geojson'
  },
  {
    name: 'FM Radio',
    key: '10',
    source: '/static/radio.geojson'
  }
];

function globalExists(varName) {
  // Calling eval by another name causes evalled code to run in a
  // subscope of the global scope, rather than the local scope.
  const globalEval = eval;
  try {
    globalEval(varName);
    return true;
  } catch (e) {
    return false;
  }
}

let firstLoad = true;

let cacheBuster = 0;

function recomputeColoration({facet, attribute}, colorFn, facets) {  
  let legend = null;

  if (!facet || !attribute) {
    legend = cloneDeep(DEFAULT_LEGEND);

    // clear all colors - todo - not working
    Object.keys(facets,
      (facetKey) => {
        Object.keys(facets[facetKey].values).map(
          (value) => {
            facets[facetKey].values[value].tileRenderColor = DEFAULT_BLUE;
          }
        );
      });
  } else {
    legend = {};
    legend.attribute = attribute;
    legend.attributes = {};
    legend.type = facets[facet].attributeCategoryTypes[attribute];
    legend.colorFn = colorFn;

    if (legend.type === 'Categorical') {
      const colorScheme = tileRenderColorScheme;
      const maxColor = colorScheme.length;

      Object.keys(facets[facet].values).map(
        (facetValue) => {
          const record = facets[facet].values[facetValue];

          if (!facets[facet] ||  !facets[facet].attributes) {
            debugger;
          }

          let attrs = {}; 
          if (facets[facet] &&
              facets[facet].attributes) {
            attrs = facets[facet].attributes || {};
          }
          const categoricalValue = attrs[attribute] || '';
          legend.attributes[categoricalValue] = {
            count: 0
          };
          
        });

      Object.keys(legend.attributes).sort(
        (a, b) => {
          if (a === b) {
            return 0;
          }

          if (a === '') {
            return 1;
          }

          if (b === '') {
            return -1;
          }

          if (a > b) {
            return 1;
          } else {
            return -1;
          }
        }
      ).map(
        (key, colorIndex) => {
          const color = colorScheme[colorIndex % maxColor];

          legend.attributes[key].color = color;
        });

      Object.keys(facets[facet].values).map(
        (facetValue) => {
          const record = facets[facet].values[facetValue];

          let attrs = {};

          if (facets[facet] && facets[facet].attributes) {
            attrs = (facets[facet].attributes[facetValue] || {});
          }

          const categoricalValue = attrs[attribute] || '';

          if (categoricalValue === '') {
            console.log('Missing value', facetValue, facets[facet].attributes)
          }

          record.tileRenderColor = legend.attributes[categoricalValue].color;
          legend.attributes[categoricalValue].count++;
        });
    } else if (
      legend.type === 'Ordered' ||
      legend.type === 'Diverging') {
      legend.min = null;
      legend.max = null;
      legend.attributeNumericFormatter = facets[facet].attributeNumericFormatters[facet];

      Object.keys(facets[facet].values).filter(
        (facetValue) => {
          return facets[facet].values[facetValue].selected; 
        }
      ).map(
        (facetValue) => {
          if (!facets[facet] || !facets[facet].attributes) {
            debugger;
          }

          const value = (facets[facet].attributes[facetValue] || {})[attribute];
          if (value !== null && value !== undefined) {
            if (legend.min == null) {
              legend.min = value;
            }

            if (legend.max == null) {
              legend.max = value;
            }

            if (value > legend.max) { 
              legend.max = value;
            }

            if (value < legend.min) {
              legend.min = value;
            }
          }
        });

      legend.colorFn = colorFn;

      legend.rangeMin = legend.min;
      legend.rangeMax = legend.max;

      if (legend.min < 0 && legend.max > 0) {
        legend.rangeMax = Math.max(Math.abs(legend.min), legend.max);
        legend.rangeMin = -1 * legend.rangeMax;
      } else {
        legend.rangeMin = 0;
      }

      const range = legend.rangeMax - legend.rangeMin;

      Object.keys(facets[facet].values).map(
        (facetValue) => {
          const record = facets[facet].values[facetValue];

          const value = (facets[facet].attributes[facetValue] || {})[attribute];
          record.tileRenderColor = legend.colorFn(1.0 * value / range)
        });
    }
  }

  return  {
    facets,
    legend
  };
}


const IndexPage = () => {
  console.time("render");

  const [facets, updateFacets] = React.useState({});
  const [intersectionFacets, updateIntersectionFacets] = React.useState({});
  const [coloration, setColorStrategy] = React.useState({});
  const [legend, setLegend] = React.useState({});
  const [description, setDescription] = React.useState('');
  const [selectedIntersections, setIntersections] = React.useState({});

  function copyLink() {
    const changes = {
      facets: facets,
      coloration: coloration
    }

    const result = {};
    Object.keys(changes.facets).map( 
      (key) => changes.facets[key]
    ).filter( 
      ({visible}) => visible
    ).map(
      (record) => {
        return { 
          key: record.key, 
          values: Object.keys(filterMap(
            record.values, 
            ({selected}) => selected 
          ))
        }
      }
    ).filter( 
      ({values}) => Object.keys(values).length > 0
    ).forEach(
      ({key, values}) => {
        result[key] = values;
      }
    )

    if (globalExists('window')) {
      let baseUrl = window.location.href;
      if (baseUrl.indexOf('?') > 0) {
        baseUrl = baseUrl.split('?')[0];
      }

      navigator.clipboard.writeText(baseUrl + '?' + JSON.stringify(result));
    }

    return result;
  }

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
          <Button 
            mr={2}
            style={buttonStyle}
            onClick={copyLink}>
              Copy link to this page
          </Button>
      </main>
    </Grid>
  );

  console.timeEnd("render");
  
  return result;
}

export default IndexPage;