const fs = require('fs');
const intersect = require('@turf/intersect').default;
const area = require('@turf/area').default;
const bbox = require('@turf/bbox').default;
const bboxPolygon = require('@turf/bbox-polygon').default;

const trim = () => {};

const layers =  [
  {
    name: 'County',
    key: '1',
    loaded: false,
    source: '/static/Counties.geojson',
    nameAttribute: 'co_name',
    whereObtained: 'Public Datasets',
    nameProcessor: trim,
    attributeSource: '/static/Data Sheets - Counties.tsv',
    attributeSourceKey: 'Name',
    attributeCategoryTypes: {
      'Constables': 'Ordered'
    },
    attributeNumericAttributes: [
      'Constables'
    ],
    attributesToDisplay: [
      'Constables'
    ]
  },
  {
    name: 'Zip',
    key: '2',
    loaded: false,
    source: '/static/zcta.geojson',
    nameAttribute: 'ZCTA5CE10',
    // https://www.pccdcis.pa.gov/CCETS/Public/ConstableFinder.aspx
    whereObtained: 'Converted from https://www.pccdcis.pa.gov/CCETS/Public/ConstableFinder.aspx',
    nameProcessor: trim
  },
  {
    name: 'Municipality',
    key: '3',
    loaded: false,
    source: '/static/Municipalities.geojson',
    nameAttribute: ['co_name', 'mun_name'],
    whereObtained: 'Chester County Public Datasets',
    nameProcessor: trim,
    attributeSource: '/static/municipalities/data.tsv',
    // TODO this needs TO JOIN ON BOTH COUNTY AND MUNICIPALITY OR THE FIPS CODE
    attributeSourceKey: ['County', 'Municipality'],
    // TODO source some attributes from the geojson
    // like Municipal_Class
    attributeCategoryTypes: {
      '2020': 'Ordered',
      '2010': 'Ordered',
      'Percent Change': 'Ordered',
      'Environmental Action Communitee': 'Categorical',
      'Human Rights Comittee': 'Categorical',
      'Municipal Class': 'Categorical'    },
    attributeNumericAttributes: [
      '2020',
      '2010',
      'Percent Change'
    ],
    attributesToDisplay: [
      '2020',
      '2010',
      'Percent Change',
      'Environmental Action Communitee',
      'Human Rights Comittee',
      'Municipal Class',
      'Square Miles'
    ]
  },
  {
    name: 'School District',
    key: '4',
    loaded: false,
    source: '/static/SchoolDistricts.geojson',
    nameAttribute: ['County', 'school_nam'],
    whereObtained: 'Montgomery County Public Datasets',
    nameProcessor: trim,
    attributeSource: '/static/SchoolDistricts.csv',
    attributeSourceKey: ['LEA'],
    attributeCategoryTypes: {
      'Ratio of black to white discipline': 'Ordered',
    },
    attributeNumericAttributes: [
      'Ratio of black to white discipline',
    ],
    attributesToDisplay: [
      'Ratio of black to white discipline',
    ]
  },
  {
    name: 'Police Department',
    key: '5',
    loaded: false,
    source: '/static/Police.geojson',
    nameAttribute: ['County', 'Name'],
    nameProcessor: trim,
    attributeSource: '/static/police/data.tsv',
    attributeSourceKey: ['County', 'Location'],
    attributeCategoryTypes: {
      'Pennsylvania Chief of Police Association Accreditation': 'Categorical',
      'Total Employees': 'Ordered',
      'Full Time Civilians': 'Ordered',
      'Full Time Sworn Officers': 'Ordered',
      'Part Time Civilians': 'Ordered',
      'Part Time Sworn Officers': 'Ordered',
    },
    attributeNumericAttributes: [
      'Total Employees',
      'Full Time Civilians',
      'Full Time Sworn Officers',
      'Part Time Civilians',
      'Part Time Sworn Officers'
    ],
    attributesToDisplay: [
      'Chief Name',
      'Last Update',
      'Total Employees',
      'Pennsylvania Chief of Police Association Accreditation',
      'Full Time Civilians',
      'Full Time Sworn Officers',
      'Part Time Civilians',
      'Part Time Sworn Officers'
    ]
  },
  {
    name: 'Magesterial Courts',
    key: '6',
    loaded: false,
    source: '/static/MagesterialCourts.geojson',
    nameAttribute: 'District',
    whereObtained: 'Montgomery County Public Datasets',
    citation: 'https://data-montcopa.opendata.arcgis.com/datasets/ea654fc7b22f4039a8c3e1e85bcf868f_0/explore?location=40.210302%2C-75.353586%2C10.69',
    nameProcessor: trim
  },
  {
    name: 'PA Senate District',
    key: '7',
    loaded: false,
    source: '/static/Pennsylvania_State_Senate_Boundaries.geojson',
    nameAttribute: 'leg_distri',
    whereObtained: 'Montgomery County Public Datasets',
    citation: 'https://data-montcopa.opendata.arcgis.com/datasets/montcopa::montgomery-county-pa-senate-districts-2022-1/explore?location=40.210380%2C-75.353586%2C10.94',
    nameProcessor: (name) => name + '',
    attributeSource: '/static/Data Sheets - PA Senate.csv',
    attributeSourceKey: 'District',
    attributeCategoryTypes: {
      //'2020 Population': 'Ordered',
      //'Registered Voters': 'Ordered',
      //'Registered Democrats': 'Ordered',
      //'Registered Republicans': 'Ordered',
      //'Registered Independents': 'Ordered', 
      //'Registered Other': 'Ordered',
      // the values don't add up?
      //'Square Miles': 'Ordered'
    },
    attributeNumericAttributes: [
      //'2020 Population',
     // 'Registered Voters',
     // 'Registered Democrats',
     // 'Registered Republicans',
     // 'Registered Independents',
     // 'Registered Other',
      // the values don't add up?
      //'Square Miles'
    ],
    attributesToDisplay: [
      //'2020 Population',
      //'Representative', 
      //'Home County',
      //'Representative Party', 
      //'Registered Voters',
      //'Registered Democrats',	
      //'Registered Republicans',
      //'Registered Independents',	
      //'Registered Other',
      //'Square Miles'
    ]
  },
  {
    name: 'PA House District',
    key: '8',
    loaded: false,
    source: '/static/Pennsylvania_State_House_Boundaries.geojson',
    nameAttribute: 'leg_distri',
    whereObtained: 'PA Public Datasets',
    nameProcessor: (name) => name + '',
    attributeSource: '/static/Data Sheets - PA House.csv',
    attributeSourceKey: 'District',
    attributeCategoryTypes: {
      //'2020 Population': 'Ordered',
      //'Registered Voters': 'Ordered',
      //'Registered Democrats': 'Ordered',
      //'Registered Republicans': 'Ordered',
      //'Registered Independents': 'Ordered', 
      //'Registered Other': 'Ordered',
      // the values don't add up?
      //'Square Miles': 'Ordered'
    },
    attributeNumericAttributes: [
      //'2020 Population',
      //'Registered Voters',
      //'Registered Democrats',
      //'Registered Republicans',
      //'Registered Independents',
      //'Registered Other',
      // the values don't add up?
      //'Square Miles'
    ],
    attributesToDisplay: [
      //'2020 Population',
      //'Representative',
      //'Home County',
      //'Representative Party', 
      //'Registered Voters',
      //'Registered Democrats',	
      //'Registered Republicans',
      //'Registered Independents',	
      //'Registered Other',
      // the values don't add up?
      //'Square Miles'
    ]
  },
  {
    name: 'State Police',
    key: '9',
    loaded: false,
    source: '/static/StatePolice.geojson',
    nameAttribute: 'Troop',
    whereObtained: 'https://www.pasda.psu.edu/uci/DataSummary.aspx?dataset=1691',
    nameProcessor: trim
  },
  /*{
    // TODO what is this for?
    name: 'JPO Districts',
    key: 9,
    loaded: false,
    source: '/static/Montgomery_County_-_JPO_Districts.geojson',
    nameAttribute: 'Name',
    nameProcessor: trim
  }*/
 /* TODO Libraries */
 /* TODO NAACPs */
  {
    name: 'FM Radio',
    key: '10',
    loaded: false,
    source: '/static/radio.geojson',
    nameAttribute: 'callsign',
    whereObtained: 'FCC',
    attributeCategoryTypes: {
      'FLN': 'Categorical',
      'type': 'Categorical'
    },
    attributeNumericAttributes: [
    ],
    attributesToDisplay: [
      'callsign',
      'frequency',
      'city',
      'state',
      'FLN',
      'type'
    ]
  },
].map(
    (layer) => {
        let geojson = JSON.parse(
            fs.readFileSync('../public/' + layer.source)
        );

        layer.geojson = geojson;

        return layer;
    }
  );



// do pre-computation
    // TODO: square miles should go in here
// compute the intersections of every segment of the map with every other segment of the map
// datastructure

// alpha these so we only need to do half?
// municipality:ambler_borough <-> zip:19002 => true

// for each layer
function getValueFromRow(row, sourceKey) {
  if (Array.isArray(sourceKey)) {
    //console.log('is array', sourceKey);
    const result = sourceKey.map(
      (key) => row[key]
    ).join(" - ");

    //console.log('result', result);
    return result;
  } else {
    return row[sourceKey] + '';
  }
}



layers.forEach(
    (layerA) => {
        const layerAName = layerA.name;

        layers.forEach(
          (layerB) => {
            const layerBName = layerB.name;

            if (layerAName === layerBName) {
              // TODO this removes some potentially useful matches, but
              // also makes things faster
              return;
            }

            const intersections = {};
            const destinationFileName = 'intersections_cache/intersections' + layerAName + '_' + layerBName + '.json';
            if (fs.existsSync(destinationFileName)) {
              return;
            }

            layerA.geojson.features.forEach(
                (featureA) => {
                  const featureAName = 
                      getValueFromRow(featureA.properties, layerA.nameAttribute);

                  const featureAKey = layerAName + ":" + featureAName;


                      layerB.geojson.features.forEach(
                        (featureB) => {
                          const featureBName = 
                            getValueFromRow(
                              featureB.properties, 
                              layerB.nameAttribute
                            );
                          const featureBKey = layerBName + ":" + featureBName;

                          //if (layerAName === 'County' || layerBName === 'County') {
                              // arguably not useful enough to be worth the weight
                          //    return;
                          //}

                          if (featureAKey === featureBKey) {
                              // trial/dumb case
                              // one question though is if we care if something 
                              // intersects the same "type"? for instance a borough
                              // and a township. we might get a lot of false positives though
                              return;
                          }

                          const intersectionName = [
                              featureAKey,
                              featureBKey,
                          ].sort().join(" -> ");

                          // TODO - it might make sense to think in terms of size
                          // where the smaller one is first ("is part of" vs "intersects")?
                          if (!intersections.hasOwnProperty(intersectionName)) {
                              // TODO probably needs to be an object
                              //      could include area intersection
                              try {
                                if (!featureA.bbox) {
                                  featureA.bbox = bboxPolygon(bbox(featureA));
                                }

                                if (!featureB.bbox) {
                                  featureB.bbox = bboxPolygon(bbox(featureB));
                                }

                                let intersection = false;
                                try {
                                  if (!intersect(featureA.bbox, featureB.bbox)) {
                                    intersection = false;
                                  } else {
                                    intersection = intersect(
                                      featureA,
                                      featureB
                                    );
                                  }
                                } catch (e) {
                                 console.log(e);
                                 return 
                                }

                                let overlap = null;
                                let isIntersection = !!intersection;
                                let overlapPercent = null;

                                if (intersection) {
                                    overlap = area(intersection);

                                    const area1 = area(featureA);
                                    const area2 = area(featureB);
      
                                    // one could totally suround the other...
                                    overlapPercent = Math.min(overlap / area1, overlap / area2);
      
                                    if (overlapPercent < .05) {
                                        isIntersection = false;
                                    }
                                }
            
                                intersections[intersectionName] = {
                                    intersects: !!isIntersection,
                                    overlap: overlap,
                                    overlapPercent: overlapPercent,
                                    features: [
                                      featureAKey,
                                      featureBKey
                                    ]
                                };
                              } catch (e) {
                                //console.log(e);
                              }
                          }
                      }
                  );

                 // console.log('intersections: ', intersections);

                  const allIntersections = {};
                  Object.keys(intersections).map(
                    (key) => intersections[key]
                  ).filter(
                    ({intersects}) => intersects
                  ).map(
                    ({features}) => features
                  ).forEach(
                    ([key1, key2]) => {
                      if (!allIntersections.hasOwnProperty(key1)) {
                        allIntersections[key1] = [];
                      }

                      if (!allIntersections.hasOwnProperty(key2)) {
                        allIntersections[key2] = [];
                      }

                      allIntersections[key1].push(key2);
                      allIntersections[key2].push(key1);
                    }
                  );
                 // console.log('all intersections: ', allIntersections);

                  fs.writeFileSync(destinationFileName, JSON.stringify(allIntersections, null, 2));
              }
          );
        }
      )
    }
);

let mergedData = {};
fs.readdirSync('./intersections_cache').map(
  (file) => {
    const data = JSON.parse(fs.readFileSync('./intersections_cache/' + file));
    //mergedData = Object.assign(mergedData, data);
    for (var key in data) {
      if (!mergedData[key]) {
        mergedData[key] = data[key];
      } else {
        mergedData[key] = mergedData[key].concat(data[key]);
      }
    }
  }
);

fs.writeFileSync(
  '../src/data/intersections.js',
  "export default " + JSON.stringify(mergedData, null, 2)
);

//fs.writeFileSync('intersections.json', JSON.stringify(intersections, null, 2));

