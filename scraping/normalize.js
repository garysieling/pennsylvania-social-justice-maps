const fs = require('fs');

const sourceData = [
    {
      name: 'County',
      key: '1',
      source: '/static/Counties.geojson',
      nameAttribute: 'co_name',
      attributeSource: '/static/Data Sheets - Counties.tsv',
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
      attributeSource: '/static/municipalities/data.tsv',
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
      attributeSourceKey: ['County', 'School District'],
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
      attributeSource: '/static/Data Sheets - Police.tsv',
      attributeSourceKey: ['County', 'Location'],
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
      attributeSource: '/static/Data Sheets - PA State Senate.tsv',
      attributeSourceKey: 'District',
      attributeCategoryTypes: {
      },
      attributeNumericAttributes: [
      ],
      attributesToDisplay: [
      ]
    },
    {
      name: 'PA House District',
      key: '8',
      source: '/static/Pennsylvania_State_House_Boundaries.geojson',
      nameAttribute: 'leg_distri',
      whereObtained: 'PA Public Datasets',
      attributeSource: '/static/Data Sheets - PA State House.tsv',
      attributeSourceKey: 'District',
      attributeCategoryTypes: {
      },
      attributeNumericAttributes: [
      ],
      attributesToDisplay: [
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


sourceData.map(
    (metadata) => {
        const file = '../public/' + metadata.source;
        const data = JSON.parse(fs.readFileSync(file) + '');

        data.features.map(
            (feature) => {
                if(typeof metadata.nameAttribute === 'string') {
                    feature.properties._name = feature.properties[metadata.nameAttribute];
                } else {
                    feature.properties._name = 
                        metadata.nameAttribute.map(
                            (v) => {
                                let res = feature.properties[v];

                                if (!res) {
                                    throw feature.properties;
                                }

                                return res;
                            }
                        ).join(" - ");
                }

                if (!feature.properties._name) {
                    console.log(metadata);
                    throw feature.properties;
                }

                      // Needed for house/senate districts
                if (parseInt(feature.properties._name)) {
                    feature.properties._sort = parseInt(feature.properties._name);
                } else {
                    feature.properties._sort = feature.properties._name;
                }

                //console.log(JSON.stringify(feature.properties, null, 2));
            }
        )

//        console.log(data);
        fs.writeFileSync(file, 
            JSON.stringify(data)
        );
    }
)
  
