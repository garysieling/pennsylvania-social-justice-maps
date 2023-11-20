
import { cloneDeep } from "lodash";

import { 
  schemeTableau10 as tileRenderColorScheme,
} from 'd3-scale-chromatic';

const sourceData = [
  {
    name: 'County',
    key: '1',
    source: '/static/Counties.geojson'
  },
  {
    name: 'Zip',
    key: '2',
    source: '/static/zcta.geojson'
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
    source: '/static/Pennsylvania_State_Senate_Boundaries.geojson',
    attributesToDisplay: [
      'Party',
      'District'
    ],   
    attributeCategoryTypes: {
      'Party': 'Categorical'
    }
  },
  {
    name: 'PA House District',
    key: '8',
    source: '/static/Pennsylvania_State_House_Boundaries.geojson',
    attributesToDisplay: [
      'Party',
      'District'
    ]
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


function recomputeColoration({facet, attribute}, colorFn, facets) {  
  let legend = null;

  if (!facet || !attribute) {
    legend = cloneDeep(DEFAULT_LEGEND);

    // clear all colors - todo - not working
    facets[facet].geojson.features.map(
      (feature) => {
        feature.properties.tileRenderColor = DEFAULT_BLUE;
      })
  } else {
    legend = {};
    legend.attribute = attribute;
    legend.attributes = {};
    legend.type = facets[facet].attributeCategoryTypes[attribute];
    legend.colorFn = colorFn;

    if (legend.type === 'Categorical') {
      const colorScheme = tileRenderColorScheme;
      const maxColor = colorScheme.length;

      facets[facet].geojson.features.map(
        (feature) => {
          const categoricalValue = feature.properties[attribute] || '';
          if (!legend.attributes[categoricalValue]) {
            legend.attributes[categoricalValue] = {
              color: ''
            };
          }

          legend.attributes[categoricalValue].count =
            (legend.attributes[categoricalValue].count || 0) + 1
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

        facets[facet].geojson.features.map(
          (feature) => {
            const categoricalValue = feature.properties[attribute] || '';

            feature.properties.tileRenderColor = legend.attributes[categoricalValue].color;
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
          record.properties.tileRenderColor = legend.colorFn(1.0 * value / range)
        });
    }
  }

  return  {
    facets,
    legend
  };
}

export {
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
}