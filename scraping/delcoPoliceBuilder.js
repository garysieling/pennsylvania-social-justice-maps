const Papa = require("papaparse");

const union = require('@turf/union').default;

// Data source
// https://wiki.radioreference.com/index.php/Delaware_County_%28PA%29

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
              && ['Delaware'].indexOf(feature.properties.co_name) >= 0
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
const data = `sector\tid\tmunicipality\tpolice
1\t25\tParkside Borough\tParkside
1\t26\tUpland Borough\tUpload
1\t2\tBrookhaven Borough\tBrookhaven
1\t29\tChester Township\tChester
1\t81\tAston Township\tAston
1\t83\tBethel Township\tBethel
1\t84\tUpper Chichester Township\tUpper Chichester
1\t85\tMarcus Hook Borough\tMarcus Hook
1\t86\tTrainer Borough\tTrainer
1\t88\tLower Chichester Township\tLower Chichester
2\t71\tNewtown Township\tNewtown
2\t75\tMarple Township\tMarple
2\t77\tUpper Providence Township\tUpper Providence
2\t91\tSpringfield Township\tSpringfield
2\t93\tMorton Borough\tMorton
2\t95\tSwarthmore Borough\tSwarthmore
2\t95\tRutledge Borough\tSwarthmore
2\t98\tMedia Borough\tMedia
2\t99\tNether Providence Township\tNether Providence
3\t24\tChester City\tChester City
4\t41\tLansdowne Borough\tLansdowne
4\t43\tAldan Borough\tAldan
4\t44\tClifton Heights Borough\tClifton Heights
4\t45\tEast Lansdowne Borough\tEast Lansdowne
4\t46\tYeadon Borough\tYeadon
4\t47\tDarby Borough\tDarby
4\t48\tColwyn Borough\tColwyn
4\t61\tSharon Hill Borough\tSharon Hill
4\t63\tFolcroft Borough\tFolcroft
4\t65\tCollingdale Borough\tCollingdale
4\t67\tDarby Township\tDarby
5\t23\tEddystone Borough\tEddystone
5\t31\tRidley Township\tRidley
5\t32\tGlenolden Borough\tGlenolden
5\t33\tProspect Park Borough\tProspect Park
5\t34\tNorwood Borough\tNorwood
5\t36\tRidley Park Borough\tRidley Park
6\t78\tMillbourne Borough\tMillbourne
6\t79\tUpper Darby Township\tUpper Darby
7\t73\tHaverford Township\tHaverford
7\t76\tRadnor Township\tRadnor
\t\tChadds Ford Township\tPSP MEDIA STATION
\t\tChester Heights Borough\tPSP MEDIA STATION
\t\tConcord Township\tPSP MEDIA STATION
\t\tEdgmont Township\tPSP MEDIA STATION
\t\tMiddletown Township\tPSP MEDIA STATION
\t\tRose Valley Borough\tPSP MEDIA STATION
\t\tThornbury Township\tPSP MEDIA STATION
`;
// 7   56  Delaware County Constables
//2   53  Delaware County Sheriffs Office
//2   55  Delaware County Park Police
//7   96  Villanova University    Villanova Public Safety
// 2   97  Penn State University (Brandywine Campus)

Papa.parse(data, {
    download: false,
    header: true,
    skipEmptyLines: true,
    delimiter: "\t",

    complete: function(results, file) {
        //municipalities

        //console.log('results', results);

        const seen = {
        
        }

        const features = results.data.map(
            (row) => {
                const {police, municipality} = row;
                const found = municipalities[0].geojson.features.filter(
                    (feature) => {
                        //console.log('feature', feature, police, municipality);
                        return feature.properties.mun_name.toLowerCase() 
                            === municipality.toLowerCase();
                    }
                );

                if (found.length === 1) {
                    //console.log('found ' + municipality);
                    found[0].properties.Name = police;
                    return found[0];
                } else if (found.length === 0) {
                    console.log('Cant find ', row)
                } else if (found.length > 1) {
                    console.log('Found two ', municipality)
                }
            }
        ).map(
            (feature) => {
                feature.properties.County = 'Delaware';

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
                        feature.properties.County = 'Delaware';
                    }
                }

                //console.log('after', seen[feature.properties.Name]);

                return null;
            }).filter(
                feature => !!feature
            ).concat(
                Object.values(seen)
            );

        console.log('features', features);

        const geojson = {
            "type": "FeatureCollection",
            "name": "Delaware_County_Police",
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

        fs.writeFileSync('../public/to incorporate/DelawareCountyPolice.geojson', JSON.stringify(geojson));
    }
  });
