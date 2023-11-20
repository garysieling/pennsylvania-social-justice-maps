const fs = require('fs');
const area = require('@turf/area').default;
const Papa = require('papaparse');

const sourceData = [
    {
      name: 'County',
      key: '1',
      source: '/static/Counties.geojson',
      population: 'county.csv',
      populationKey: 'CountyName',
      nameAttribute: 'co_name',
      //attributeSource: '../public/static/Data Sheets - Counties.tsv',
      attributeSourceKey: 'Name',
      attributeCategoryTypes: {
      },
      attributeNumericAttributes: [
      ],
      attributesToDisplay: [
      ]
    },
    {
      name: 'Zip',
      key: '2',
      source: '/static/zcta.geojson',
      population: 'zcta.csv',
      populationKey: 'zcta',
      nameAttribute: 'ZCTA5CE10'
    },
    {
      name: 'Municipality',
      key: '3',
      source: '/static/Municipalities.geojson',
      population: 'municipality.csv',
      populationKey: ['CountyName', 'MCDName'],
      nameAttribute: ['co_name', 'mun_name'],
      populationTransform: (k) => k.split(',')[0].toLowerCase(),
      //attributeSource: '../public/static/municipalities/data.tsv',
      attributeSourceKey: ['County', 'Municipality'],
      attributeCategoryTypes: {
      },
      attributeNumericAttributes: [
      ],
      attributesToDisplay: [
      ]
    },
    {
      name: 'School District',
      key: '4',
      source: '/static/SchoolDistricts.geojson',
      population: 'school_district.csv',
      populationKey: 'uschlnm20',
      nameAttribute: 'school_dis',
    //  attributeSourceKey: ['County', 'School District'],
      attributeCategoryTypes: {
      },
      attributeNumericAttributes: [
      ],
      attributesToDisplay: [
      ]
    },
    {
      name: 'Police Department',
      key: '5',
      source: '/static/Police.geojson',
      nameAttribute: ['County', 'Name'],
     // attributeSource: '/static/Data Sheets - Police.tsv',
      //attributeSourceKey: ['County', 'Location'],
      attributeCategoryTypes: {
      },
      attributeNumericAttributes: [
      ],
      attributesToDisplay: [
      ]
    },
    {
      name: 'Magesterial Courts',
      key: '6',
      source: '/static/MagesterialCourts.geojson',
      nameAttribute: 'District',
    },
    {
      name: 'PA Senate District',
      key: '7',
      source: '/static/Pennsylvania_State_Senate_Boundaries.geojson',
      nameAttribute: 'leg_distri',
      population: 'senate.csv',
      populationKey: 'sldu18',
      populationTransform: (k) => parseInt(k) + '',
      attributeSource: '../public/static/Data Sheets - PA State Senate.tsv',
      attributeSourceKey: 'District',
      attributeCategoryTypes: {
      },
      attributeNumericAttributes: [
      ],
      attributesToDisplay: [
        'Party',
        'District'
      ]
    },
    {
      name: 'PA House District',
      key: '8',
      source: '/static/Pennsylvania_State_House_Boundaries.geojson',
      nameAttribute: 'leg_distri',
      population: 'house.csv',
      populationKey: 'sldl18',
      populationTransform: (k) => parseInt(k) + '',
      whereObtained: 'PA Public Datasets',
      attributeSource: '../public/static/Data Sheets - PA State House.tsv',
      attributeSourceKey: 'District',
      attributeCategoryTypes: {
      },
      attributeNumericAttributes: [
      ],
      attributesToDisplay: [
        'Party',
        'District'
      ]
    },
    {
      name: 'State Police',
      key: '9',
      source: '/static/StatePolice.geojson',
      nameAttribute: 'Troop'
    },
    {
      name: 'FM Radio',
      key: '10',
      source: '/static/radio.geojson',
      nameAttribute: 'callsign',
      attributeCategoryTypes: {
      },
      attributeNumericAttributes: [
      ],
      attributesToDisplay: [
      ]
    }
  ];

let trim = (value) => (value + '').trim().replace(/[ ]+/g, ' ');




function getValueFromRow(row, sourceKey) {
  if (Array.isArray(sourceKey)) {
    const result = sourceKey.map(
      (key) => trim(row[key])
    ).join(" - ");

    return result;
  } else {
    return (row[sourceKey] + '').trim();
  }
}

function toJson (filepath) {
  const file = fs.createReadStream(filepath)
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete (results, file) {
        resolve(results.data)
      },
      error (err, file) {
        reject(err)
      }
    })
  })
}


function toKey(valueOrValues, src) {
  if(typeof valueOrValues === 'string') {
    return trim(src[valueOrValues]);
  } else {
      return trim(valueOrValues.map(
              (v) => {
                  let res = src[v];

                  if (!res) {
                      throw src;
                  }

                  return res;
              }
          ).join(" - "));
  }
}

function toMap(key, keyCb, rows) {
  let result = {};

  for (let i = 0; i < rows.length; i++) {
    result[keyCb(toKey(key, rows[i]))] = rows[i].pop20;
  }

if (key === 'uschlnm20') {
  //console.log(result);
}

  return result;
}

function run() {
  console.log('run');
  sourceData.map(
    async (recordType) => {
      let popMatch = 0;
      let popTotal = 0;
    
      let rows = [];
      if (recordType.attributeSource) {
        data = await toJson(recordType.attributeSource)
      }

      let popData = {};
      if (recordType.population) {
        popData = toMap(
          recordType.populationKey,
          recordType.populationTransform || ((k) => (k || '').toLowerCase()),
          await toJson('./census/' + recordType.population)
        )
      }

      writeGeojson(recordType, rows, popData, () => popMatch++, () => popTotal++);

      console.log('Population matched: ' + popMatch + ' / ' + popTotal + ' for ' + recordType.name);
    }
  );
}

run();

function writeGeojson(metadata, rows, popData, matchCb, totalCb) {
    const file = '../public/' + metadata.source;
    const data = JSON.parse(fs.readFileSync(file) + '');

      data.features.map(
          (feature) => {
              feature.properties._name = toKey(metadata.nameAttribute, feature.properties);
              
              if (!feature.properties._name) {
                  console.log(metadata);
                  throw feature.properties;
              }

              if (popData[feature.properties._name.toLowerCase()]) {
                feature.properties._population = parseInt(popData[feature.properties._name.toLowerCase()]);
                matchCb();
              }

              totalCb();

             // console.log(feature.properties._name);

                // Needed for house/senate districts
              if (parseInt(feature.properties._name)) {
                  feature.properties._sort = parseInt(feature.properties._name);
              } else {
                  feature.properties._sort = feature.properties._name;
              }

              
               if (rows.length > 0) {
                // console.log(rows.length + ' ____ ' + JSON.stringify(rows));
               }

                for (let j = 0; j < rows.length; j++) {
                 // console.log(j);
                    const row = rows[j];
                    //console.log(row);
                    const joinKey = row[metadata.attributeSourceKey];

                   // console.log('joinKey: ' + joinKey);

                    if (joinKey == feature.properties._name) {
                      console.log('found match! ' + feature.properties._name);

                      metadata.attributesToDisplay.map(
                        (attr) => {
                          feature.properties[attr] = row[attr];
                        }
                      )             
                    }
                }
              

              const totalArea = (area(feature) * 3.861E-7).toFixed(1);
              feature.properties._areaInMiles = totalArea;
      
              //console.log(JSON.stringify(feature.properties, null, 2));
          }
      )
    
      data.features.sort(
        (featureA, featureB) => {
          let nameA = featureA.properties._sort;
          let nameB = featureB.properties._sort;

          if (nameA > nameB) {
            return 1;
          }

          if (nameA < nameB) {
            return -1;
          }

          return 0;
        }
      )


//        console.log(data);
      fs.writeFileSync(file, 
          JSON.stringify(data)
      );
  }