
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

export {
  position,
  zoom,
  DEFAULT_BLUE,
  DEFAULT_LEGEND,
  pageStyles,
  buttonStyle,
  globalExists,
  filterMap,
  sourceData
}