const fs = require('fs');
const turf = require('turf');

const trim = () => {};

const layers = [
    {
      name: 'County',
      key: '1',
      loaded: false,
      source: '/static/Montgomery_County_Boundary.geojson',
      nameAttribute: 'Name',
      whereObtained: 'Montgomery County Public Datasets',
      nameProcessor: trim
    },
    {
      name: 'Zip',
      key: '2',
      loaded: false,
      source: '/static/montco_zcta5.geojson',
      nameAttribute: 'ZCTA5CE10',
      // https://www.zillow.com/browse/homes/pa/montgomery-county/
      whereObtained: 'Converted from https://www2.census.gov/geo/tiger/TIGER2019/ZCTA5/',
      nameProcessor: trim
    },
    {
      name: 'Municipality',
      key: '3',
      loaded: false,
      source: '/static/Montgomery_County_Municipal_Boundaries.geojson',
      nameAttribute: 'Name',
      whereObtained: 'Montgomery County Public Datasets',
      nameProcessor: (name, record) => 
        name.replace(' Twp', '') +
           ' ' + record['Municipal_Class']
          .replace('1st Class', '')
          .replace('2nd Class', '')
          .toLowerCase().trim(),
      attributeSource: '/static/municipalities/data.tsv',
      attributeSourceKey: 'Municipality',
      // TODO source some attributes from the geojson
      // like Municipal_Class
      attributeCategoryTypes: {
        '2020': 'Ordered',
        '2010': 'Ordered',
        'Percent Change': 'Ordered',
        'Environmental Action Communitee': 'Categorical',
        'Human Rights Comittee': 'Categorical',
        'Municipal Class': 'Categorical',
        // TODO - attributes like population / square miles
        //        should just exist for every shapefile and be
        //        normalized or else this is going to make analysis a pain
        'Square Miles': 'Ordered'
      },
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
      source: '/static/Montgomery_County_School_Districts.geojson',
      nameAttribute: 'Name',
      whereObtained: 'Montgomery County Public Datasets',
      nameProcessor: trim
    },
    {
      name: 'Police Department',
      key: '5',
      loaded: false,
      source: '/static/Montgomery_County_Police_Districts.geojson',
      nameAttribute: 'Name',
      whereObtained: 'Montgomery County Public Datasets',
      nameProcessor: (name) => {
        return name
          .replace("Police Department", "")
          .replace("Township", "")
          .trim();
      },
      attributeSource: '/static/police/data.tsv',
      attributeSourceKey: 'Location',
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
      name: 'Magesterial Court District',
      key: '6',
      loaded: false,
      source: '/static/Montgomery_County_Magisterial_Districts.geojson',
      nameAttribute: 'District',
      whereObtained: 'Montgomery County Public Datasets',
      citation: 'https://data-montcopa.opendata.arcgis.com/datasets/ea654fc7b22f4039a8c3e1e85bcf868f_0/explore?location=40.210302%2C-75.353586%2C10.69',
      nameProcessor: trim
    },
    {
      name: 'PA Senate District',
      key: '7',
      loaded: false,
      source: '/static/Montgomery_County_PA_Senate_Districts_-_2022.geojson',
      nameAttribute: 'District',
      whereObtained: 'Montgomery County Public Datasets',
      citation: 'https://data-montcopa.opendata.arcgis.com/datasets/montcopa::montgomery-county-pa-senate-districts-2022-1/explore?location=40.210380%2C-75.353586%2C10.94',
      nameProcessor: (name) => name + '',
      attributeSource: '/static/Data Sheets - PA Senate.csv',
      attributeSourceKey: 'District',
      attributeCategoryTypes: {
        '2020 Population': 'Ordered',
        'Registered Voters': 'Ordered',
        'Registered Democrats': 'Ordered',
        'Registered Republicans': 'Ordered',
        'Registered Independents': 'Ordered', 
        'Registered Other': 'Ordered',
        // the values don't add up?
        //'Square Miles': 'Ordered'
      },
      attributeNumericAttributes: [
        '2020 Population',
        'Registered Voters',
        'Registered Democrats',
        'Registered Republicans',
        'Registered Independents',
        'Registered Other',
        // the values don't add up?
        //'Square Miles'
      ],
      attributesToDisplay: [
        '2020 Population',
        'Representative', 
        'Home County',
        'Representative Party', 
        'Registered Voters',
        'Registered Democrats',	
        'Registered Republicans',
        'Registered Independents',	
        'Registered Other',
        'Square Miles'
      ]
    },
    {
      name: 'PA House District',
      key: '8',
      loaded: false,
      source: '/static/Montgomery_County_PA_House_Districts_-_2022.geojson',
      nameAttribute: 'District',
      whereObtained: 'Montgomery County Public Datasets',
      citation: 'https://data-montcopa.opendata.arcgis.com/datasets/montcopa::montgomery-county-pa-house-districts-2022-1/explore?location=40.210380%2C-75.353586%2C10.94',
      nameProcessor: (name) => name + '',
      attributeSource: '/static/Data Sheets - PA House.csv',
      attributeSourceKey: 'District',
      attributeCategoryTypes: {
        '2020 Population': 'Ordered',
        'Registered Voters': 'Ordered',
        'Registered Democrats': 'Ordered',
        'Registered Republicans': 'Ordered',
        'Registered Independents': 'Ordered', 
        'Registered Other': 'Ordered',
        // the values don't add up?
        //'Square Miles': 'Ordered'
      },
      attributeNumericAttributes: [
        '2020 Population',
        'Registered Voters',
        'Registered Democrats',
        'Registered Republicans',
        'Registered Independents',
        'Registered Other',
        // the values don't add up?
        //'Square Miles'
      ],
      attributesToDisplay: [
        '2020 Population',
        'Representative',
        'Home County',
        'Representative Party', 
        'Registered Voters',
        'Registered Democrats',	
        'Registered Republicans',
        'Registered Independents',	
        'Registered Other',
        // the values don't add up?
        //'Square Miles'
      ]
    }
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
const intersections = {};



layers.forEach(
    (layerA) => {
        const layerAName = layerA.name;

        layerA.geojson.features.forEach(
            (featureA) => {
                const featureAName = featureA.properties[layerA.nameAttribute];
                const featureAKey = layerAName + ":" + featureAName;

                layers.forEach(
                    (layerB) => {
                        const layerBName = layerB.name;

                        if (layerAName === layerBName) {
                            // TODO this removes some potentially useful matches, but
                            // also makes things faster
                            return;
                        }

                        layerB.geojson.features.forEach(
                            (featureB) => {
                                const featureBName = featureB.properties[layerB.nameAttribute];
                                const featureBKey = layerBName + ":" + featureBName;

                                if (layerAName === 'County' || layerBName === 'County') {
                                    // arguably not useful enough to be worth the weight
                                    return;
                                }

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
                                    const intersection = turf.intersect(
                                        featureA,
                                        featureB
                                    );

                                    let overlap = null;
                                    let isIntersection = !!intersection;
                                    let overlapPercent = null;

                                    if (intersection) {
                                        overlap = turf.area(intersection);

                                        const area1 = turf.area(featureA);
                                        const area2 = turf.area(featureB);

                                        overlapPercent = overlap / (area1 + area2);

                                        if (overlapPercent < .05) {
                                            isIntersection = false;
                                        }
                                    }
                
                                    intersections[intersectionName] = {
                                        intersects: !!isIntersection,
                                        overlap: overlap,
                                        overlapPercent: overlapPercent
                                    };
                                }
                            }
                        )
                    }
                )
            }
        )
    }
);

console.log('intersections: ', intersections);

fs.writeFileSync('intersections.json', JSON.stringify(intersections, null, 2));