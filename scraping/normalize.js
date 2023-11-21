const fs = require('fs');
const Papa = require('papaparse');
const intersect = require('@turf/intersect').default;
const area = require('@turf/area').default;
const bbox = require('@turf/bbox').default;
const bboxPolygon = require('@turf/bbox-polygon').default;
const polygonize = require('@turf/polygonize').default;

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



function replaceAbbr(value) {
  return value
    .replace(/\bSt \b/, "St. ")
    .replace(/\bSaint\b/, "St.")
    .replace(/\bMt \b/, "Mt. ")
    .replace(/\bMount\b/, "Mt.")
    .replace(/\bJ\b/, "J.")
}


function getValueFromRow(row, sourceKey) {
  if (Array.isArray(sourceKey)) {
    const result = sourceKey.map(
      (key) => trim(row[key])
    ).join(" - ");

    return replaceAbbr(result);
  } else {
    return replaceAbbr((row[sourceKey] + '').trim());
  }
}

async function toJson (filepath) {
  const file = fs.createReadStream(filepath)
  return await new Promise((resolve, reject) => {
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
    return replaceAbbr(trim(src[valueOrValues]));
  } else {
      return replaceAbbr(trim(valueOrValues.map(
              (v) => {
                  let res = src[v];

                  if (!res) {
                      throw src;
                  }

                  return res;
              }
          ).join(" - ")));
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


const judges = {
  "Honorable David J. Sosovicka": "05-3-03",
  "Honorable Robert P. Dzvonick": "",
  "Honorable Richard D. Olasz, Jr.": "05-2-14",
  "Honorable Thomas Caulfield": "",
  "Honorable Suzanne Blaschak": "",
  "Honorable Elissa M. Lang": "",
  "Honorable Beth S. Mills": "05-2-26",
  "Honorable Armand A. Martin": "05-3-09",
  "Honorable Kimberly M. Hoots": "05-2-18",
  "Honorable William K. Wagner": "05-2-12",
  "Honorable Tara L. Smith": "05-2-01",
  "Honorable Gary M. Zyra": "",
  "Honorable Anthony W. Saveikis": "05-3-17",
  "Honorable Carla M. Swearingen": "05-2-43",
  "Honorable Scott H. Schricker": "05-2-47",
  "Honorable Thomas G. Miller": "05-3-05",
  "Honorable Maureen McGraw-Desmet": "05-2-21",
  "Honorable Mary P. Murray": "",
  "Honorable Carolyn S. Bengel": "05-2-05",
  "Honorable Thomas R. Torkowsky": "",
  "Honorable Richard G. King": "05-3-14",
  "Honorable Dennis R. Joyce": "",
  "Honorable Blaise Larotonda": "",
  "Honorable Robert L. Ford": "05-3-02",
  "Honorable Guy Reschenthaler": "",
  "Honorable David J. Barton": "05-2-17",
  "Honorable Eugene F. Riazzi": "05-2-13",
  "Honorable Leonard J. HRomyak": "",
  "Honorable Linda I. Zucco": "05-2-32",
  "Honorable Ronald A. Arnoni": "05-2-20",
  "Honorable Mary Ann Cercone": "",
  "Honorable Jeffrey L. Herbst": "05-2-07",
  "Honorable Richard G. Opiela": "05-2-02",
  "Honorable Robert P. Ravenstahl , Jr.": "",
  "Honorable Kevin E. Cooper": "05-3-12",
  "Honorable Ronald N. Costa , Sr.": "",
  "Honorable Anthony Ceoffe": "",
  "Honorable Derwin Rushing": "",
  "Honorable Randy C. Martini": "",
  "Honorable Oscar J. Petite, Jr.": "05-2-28",
  "Honorable Hugh Fitzpatrick McGough": "",
  "Honorable Eugene N. Ricciardi": "05-2-27",
  "Honorable James A. Motznik": "",
  "Honorable James J. Hanley , Jr.": "05-2-36"
}  

async function run() {
  console.log('run');
  for (let i = 0; i < sourceData.length; i++)  {
    const metadata = sourceData[i];
  
    metadata.file = '../public/' + metadata.source;
    const data = JSON.parse(fs.readFileSync(metadata.file ) + '');

    metadata.geojson = data;
  }

  for (let i = 0; i < sourceData.length; i++)  {
    const metadata = sourceData[i];

    metadata.geojson.features.map(
        (feature) => {
            feature.properties._name = toKey(metadata.nameAttribute, feature.properties);

            if (feature.properties._name === 'District') {
              //console.log(JSON.stringify(metadata.nameAttribute));
              console.log(JSON.stringify(feature.properties.Judge));
              if (!!judges[feature.properties.Judge]) {
                feature.properties._name = judges[feature.properties.Judge];
              }
            }
            
            if (!feature.properties._name) {
                //console.log(metadata);
                throw feature.properties;
            }
          }
      );
        
      //console.log('metadata 1 ' + !!metadata);
      if (metadata.attributeSource) {
        metadata.rows = await toJson(metadata.attributeSource);
      } else {
        metadata.rows = []
      }
    }

    for (let i = 0; i < sourceData.length; i++)  {
      const metadata = sourceData[i];

      let popData = {};
      if (metadata.population) {
        const censusData = await toJson('./census/' + metadata.population);

        //console.log('census data ' + JSON.stringify(censusData));
        popData = toMap(
          metadata.populationKey,
          metadata.populationTransform || ((k) => (k || '').toLowerCase()),
          censusData
        )
      }
      metadata.popData = popData;
    }

    for (let i = 0; i < sourceData.length; i++)  {
      const metadata = sourceData[i];

      let popMatch = 0;
      let popTotal = 0;

      writeGeojson(sourceData, metadata, metadata.popData, () => popMatch++, () => popTotal++);
      console.log('Population matched: ' + popMatch + ' / ' + popTotal + ' for ' + metadata.name);
    }
}

run().then(
  () => {
    console.log('complete');
  }
);

function writeGeojson(sourceData, metadata, popData, matchCb, totalCb) {
      metadata.geojson.features.map(
          (feature) => {
              if (popData[feature.properties._name.toLowerCase()]) {
                feature.properties._population = parseInt(popData[feature.properties._name.toLowerCase()]);
                matchCb();
              } else {
                if (Object.keys(popData).length > 0) {
                  console.log(feature.properties._name);
                }
                //console.log(metadata.name);

                //if (!feature.properties._population) {                 
                  let featureAbbox = bboxPolygon(bbox(feature));

                  // build a cache of potential hits?
                  sourceData.filter(x => !!x.populationKey).
                    map(
                      (candidate) => {
                        candidate.geojson.features.map(
                          (featureB) => {
                           // if (!!feature.properties._population) {
                            //  delete feature.properties._population;
                              //matchCb();

                              //return;
                            //}

                            if (feature.properties._name === featureB.properties._name) {
                              return;
                            } else {
                              //if (metadata.name === 'Police Department') {
                               // console.log('testing ' + feature.properties._name + ' === ' + featureB.properties._name);
                              //}
                            }

                            let featureBbbox = bboxPolygon(bbox(featureB));

                            try {
                              if (intersect(featureAbbox, featureBbbox)) {
                                const polygonA = feature;
                                const polygonB = featureB;
                                
                                let trueIntersection = intersect(
                                  polygonA,
                                  polygonB
                                );

                                if (trueIntersection == null) {
                                  return;
                                }

                                let overlap = area(trueIntersection);

                                const area1 = area(polygonA);
                                const area2 = area(polygonB);

                                // min, because one could surround the other
                                overlapPercent = Math.min(overlap / area1, overlap / area2);

                                if (overlapPercent > .95 && featureB.properties._population) {
                                    console.log('Found a real intersection between ' +
                                      feature.properties._name + ' and ' + featureB.properties._name + ' overlapPercent: ' + overlapPercent + ', pop: ' + featureB.properties._population);

                                    feature.properties._population = featureB.properties._population;

                                    matchCb();
                                } else {
                                  if (overlapPercent > .75) {
                                    console.log('failed a real intersection between ' +
                                    feature.properties._name + ' and ' + featureB.properties._name + ' overlapPercent: ' + overlapPercent + ', pop: ' + featureB.properties._population);
                                  }

                                }
                              }
                            } catch (e) {
                              console.log(e);
                              return 
                             } 
                          }
                        )
                      }       
                    )
              }

       

              totalCb();

             // console.log(feature.properties._name);

                // Needed for house/senate districts
              if (parseInt(feature.properties._name)) {
                  feature.properties._sort = parseInt(feature.properties._name);
              } else {
                  feature.properties._sort = feature.properties._name;
              }

               
               if (metadata.rows.length > 0) {
                // console.log(rows.length + ' ____ ' + JSON.stringify(rows));
               }

                for (let j = 0; j < metadata.rows.length; j++) {
                 // console.log(j);
                    const row = metadata.rows[j];
                    //console.log(row);
                    const joinKey = row[metadata.attributeSourceKey];

                   // console.log('joinKey: ' + joinKey);

                    if (joinKey == feature.properties._name) {
                      //console.log('found match! ' + feature.properties._name);

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
    
      metadata.geojson.features.sort(
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
      fs.writeFileSync(metadata.file, 
          JSON.stringify(metadata.geojson)
      );
  }