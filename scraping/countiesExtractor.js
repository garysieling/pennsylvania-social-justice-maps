const fs = require('fs');
const is = require('@turf/intersect');
const intersect = is.default;

console.log('intersect', intersect);

const trim = () => {};

const counties = JSON.parse(
  fs.readFileSync('../public/static/Counties.geojson')
);

const layers = [
    {
      name: 'County',
      key: '1',
      loaded: false,
      source: 'County_Boundaries_(polygon).geojson',
      destination: 'Counties.geojson',
      postProcess: (geojson) => {
        geojson.features = geojson.features.filter(
          (feature) => {
            return feature.properties.state_name === 'Pennsylvania'
              && ['Chester', 'Delaware', 'Montgomery', 'Bucks', 'Allegheny', 'Philadelphia'].indexOf(feature.properties.co_name) >= 0
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
              && ['Chester', 'Delaware', 'Montgomery', 'Bucks', 'Allegheny', 'Philadelphia'].indexOf(feature.properties.co_name) >= 0
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
    
    {
      name: 'School Districts',
      key: '1',
      loaded: false,
      source: 'Pennsylvania School Districts Boundaries.geojson',
      destination: 'SchoolDistricts.geojson',
      postProcess: (geojson) => {
        geojson.features = geojson.features.filter(
          (feature) => {
            for (var i = 0; i < counties.features.length; i++) {
              if (!!intersect(
                feature,
                counties.features[i])) {
                  console.log('passed ', counties.features[i].properties.co_name)

                  return true;
              }
            }

            return false;

            //return feature.properties.state_name === 'Pennsylvania'
            //  && ['Chester', 'Delaware', 'Montgomery', 'Bucks', 'Allegheny', 'Philadelphia'].indexOf(feature.properties.co_name) >= 0
          }
        ).map(
          (feature) => {
            console.log(feature);

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
  ).map(
    layer => {
      fs.writeFileSync('../public/static/' + layer.destination, 
        JSON.stringify(layer.geojsonNew)
      );
    }
  );




