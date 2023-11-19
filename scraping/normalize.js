const fs = require('fs');
const area = require('@turf/area').default;
const Papa = require('papaparse');

const sourceData = [
    {
      name: 'County',
      key: '1',
      source: '/static/Counties.geojson',
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
      nameAttribute: 'ZCTA5CE10'
    },
    {
      name: 'Municipality',
      key: '3',
      source: '/static/Municipalities.geojson',
      nameAttribute: ['co_name', 'mun_name'],
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
      nameAttribute: ['County', 'school_nam'],
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

sourceData.filter(
  (recordType) => 
    !!recordType.attributeSource
).map(
  (recordType) => {
    const file = fs.createReadStream(recordType.attributeSource);
    const rows = [];

    Papa.parse(file, {
      download: false,
      header: true,
      skipEmptyLines: true,
      step: function(result) {
         //console.log('result: ' + JSON.stringify(result));
        rows.push(result.data);
      },
      complete: function(results) {
       // console.log('csv complete ' + JSON.stringify(rows));
        writeGeojson(recordType, rows);
      }
    });
  }
);

function writeGeojson(metadata, rows) {
    const file = '../public/' + metadata.source;
    const data = JSON.parse(fs.readFileSync(file) + '');

      data.features.map(
          (feature) => {
              if(typeof metadata.nameAttribute === 'string') {
                  feature.properties._name = trim(feature.properties[metadata.nameAttribute]);
              } else {
                  feature.properties._name = 
                      trim(metadata.nameAttribute.map(
                          (v) => {
                              let res = feature.properties[v];

                              if (!res) {
                                  throw feature.properties;
                              }

                              return res;
                          }
                      ).join(" - "));
              }

              if (!feature.properties._name) {
                  console.log(metadata);
                  throw feature.properties;
              }

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


  

sourceData.filter(
  (recordType) => 
    !recordType.attributeSource
).map(
  (recordType) => writeGeojson(recordType, [])
);
