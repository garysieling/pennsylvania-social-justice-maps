const Papa = require("papaparse");

const union = require('@turf/union').default;

const fs = require('fs');
const is = require('@turf/intersect');

const municipalities = [
    {
      name: 'Municipalities',
      key: '1',
      loaded: false,
      source: 'Municipal_Boundaries_(polygon).geojson',
      destination: 'Municipalities.geojson',
      postProcess: (geojson) => {
        geojson.features = geojson.features.filter(
          (feature) => {
            return feature.properties.state_name === 'Pennsylvania'
              && ['Bucks'].indexOf(feature.properties.co_name) >= 0
          }
        ).map(
          (feature) => {
            //console.log(feature);

            return feature;
          }
        )

        return geojson;
      }
    },
  ].map(
    (layer) => {
        let geojson = JSON.parse(
            fs.readFileSync('../public/to incorporate/' + layer.source)
        );

        layer.geojson = geojson;

        return layer;
    }
  ).map(
    layer => {
      layer.geojsonNew = layer.postProcess(layer.geojson)

      return layer;
    }
  )

/*
Bucks county has made this intentionally hard to get
https://bucksgis.maps.arcgis.com/apps/mapviewer/index.html?layers=95cbd4b20b164cee961d583082b7312b
*/
const data = `police\tmunicipality
Bristol Borough Police	Bristol Borough
PA State Police (Trevose)	Hulmeville Borough
Hulmeville Borough Police	Hulmeville Borough
Tullytown Borough Police	Tullytown Borough
Penndel Borough Police	Penndel Borough
PA State Police (Trevose)	Penndel Borough
Langhorne Manor Borough Police	Langhorne Manor Borough
PA State Police (Trevose)	Langhorne Manor Borough
Bristol Township Police	Bristol Township
Lower Southampton Township Police	Lower Southampton Township
PA State Police (Trevose)	Langhorne Borough
Langhorne Borough Police	Langhorne Borough
Upper Southampton Township Police	Upper Southampton Township
Ivyland Borough Police	Ivyland Borough
Warminster Township Police	Ivyland Borough
Falls Township Police	Falls Township
Morrisville Borough Police	Morrisville Borough
Middletown Township Police	Middletown Township
Newtown Township Police	Newtown Township
Warminster Township Police	Warminster Township
Newtown Borough Police	Newtown Borough
Yardley Borough Police	Yardley Borough
Northampton Township Police	Northampton Township
Lower Makefield Township Police	Lower Makefield Township
Warrington Township Police	Warrington Township
Warwick Township Police	Warwick Township
Central Bucks Regional Police	Chalfont Borough
Newtown Township Police	Wrightstown Township
Central Bucks Regional Police	New Britain Borough
Central Bucks Regional Police	Doylestown Borough
Telford Borough Police	Telford Borough
Upper Makefield Township Police	Upper Makefield Township
Doylestown Township Police	Doylestown Township
Pennridge Regional Police	West Rockhill Township
Hilltown Township Police	Silverdale Borough
Perkasie Borough Police	Sellersville Borough
New Hope Borough Police	New Hope Borough
Dublin Borough Police	Dublin Borough
Buckingham Township Police	Buckingham Township
Perkasie Borough Police	Perkasie Borough
Hilltown Township Police	Hilltown Township
PA State Police (Dublin)	Trumbauersville Borough
Solebury Township Police	Solebury Township
Plumstead Township Police	Plumstead Township
Quakertown Borough Police	Quakertown Borough
Pennridge Regional Police	East Rockhill Township
Bedminster Township Police	Bedminster Township
PA State Police (Dublin)	Bedminster Township
PA State Police (Dublin)	Richlandtown Borough
PA State Police (Dublin)	Milford Township
PA State Police (Dublin)	Haycock Township
Tinicum Township Police	Tinicum Township
PA State Police (Dublin)	Nockamixon Township
PA State Police (Dublin)	Bridgeton Township
Springfield Township Police	Springfield Township
PA State Police (Dublin)	Springfield Township
PA State Police (Dublin)	Durham Township
PA State Police (Dublin)	Riegelsville Borough
PA State Police (Bensalem)	Bensalem Township
Richland Township Police	Richland Township
PA State Police (Dublin)	Richland Township
New Britain Township Police	New Britain Township
`;

Papa.parse(data, {
    download: false,
    header: true,
    skipEmptyLines: true,
    delimiter: "\t",

    complete: function(results, file) {
        //municipalities

        const seen = {
        
        }

        const features = results.data.map(
            ({police, municipality}) => {
                const found = municipalities[0].geojson.features.filter(
                    (feature) => {
                        return feature.properties.mun_name.toLowerCase() 
                            === municipality.toLowerCase();
                    }
                );

                if (found.length === 1) {
                    console.log('found ' + municipality);
                    found[0].properties.Name = police;
                    return found[0];
                } else if (found.length === 0) {
                    console.log('Cant find ' + municipality)
                } else if (found.length > 1) {
                    console.log('Found two ' + municipality)
                }
            }
        ).map(
            (feature) => {
                feature.properties.County = 'Bucks';

                const name = feature.properties.Name;
                if (!seen[name]) {
                    seen[name] = feature;
                } else {
                    try {
                        seen[name] = union(
                        seen[name],
                        feature
                    ) ;

                    seen[name].properties.Name = name;

                    } catch (e) {
                        // some polygon isn't working...
                        console.log(e);
                        seen[name] = feature;
                        feature.properties.Name = name;
                        feature.properties.County = 'Bucks';
                    }
                }

                console.log('after', seen[feature.properties.Name]);

                return null;
            }).filter(
                feature => !!feature
            ).concat(
                Object.values(seen)
            );

        console.log('features', features);

        const geojson = {
            "type": "FeatureCollection",
            "name": "Bucks_County_Police",
            "crs": { "type": "Name", "properties": { 
                "Name": "urn:ogc:def:crs:OGC:1.3:CRS84",
                "County": "urn:ogc:def:crs:OGC:1.3:CRS84"
             } },
            "features": features.map(
                (feature) => {
                    feature.properties = {
                        'Name': feature.properties.Name,
                        'County': feature.properties.County,
                    }
                    return feature;
                }
            )
        }

        fs.writeFileSync('../public/to incorporate/BucksCountyPolice.geojson', JSON.stringify(geojson));
    }
  });
