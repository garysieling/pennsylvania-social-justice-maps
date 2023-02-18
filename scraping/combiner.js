const fs = require('fs');
//const turf = require('turf');

const trim = () => {};

const layer = [
    {
      source: 'BucksCountyMagisterialDistricts202001.geojson',
    },
    {
      source: 'Chester_CountY_MagesterialDistrictsAndCourts.geojson',
    },
    {
      source: 'Montgomery_County_Magisterial_Districts.geojson',
    },
  ].map(
    (layer) => {
        let geojson = JSON.parse(
            fs.readFileSync('../public/to incorporate/' + layer.source)
        );

        layer.geojson = geojson;

        layer.geojson.features =
          layer.geojson.features.map(
            (feature) => {
              console.log('before', feature.properties);
              if (feature.properties.Jud_Dist_L) {
                feature.properties.District = feature.properties.Jud_Dist_L;
                delete feature.properties.Jud_Dist_L;
              }

              if (feature.properties.COURT_NUMBER) {
                feature.properties.District = feature.properties.COURT_NUMBER;
                delete feature.properties.COURT_NUMBER;
              }

              console.log('after', feature.properties);

              return feature;
            }
          )

        return layer;
    }
  ).reduce(
    (a, b) => {
      const c = Object.assign({}, a);
      c.geojson = Object.assign({}, a.geojson);
      c.geojson.features = c.geojson.features.concat(b.geojson.features);

      return c;
    }
  );

fs.writeFileSync('../public/static/MagesterialCourts.geojson', 
  JSON.stringify(layer.geojson)
);



