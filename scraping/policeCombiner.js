const fs = require('fs');
const union = require('@turf/union').default;

const trim = () => {};

/*
fire police for delco: http://www.delcofirepolice.org/districts/
1st District:  Upper Chichester Township, Lower Chichester Township, Marcus Hook Borough, Trainer Borough, Chester Township, Aston Township

2nd District:  City of Chester

3rd District:  Ridley Township

4th District:  Darby Borough, Collingdale Borough, Colwyn Borough

5th District:  Folcroft Borough, Norwood Borough, Glenolden Borough, Sharon Hill Borough, Darby Township

6th District:  Brookhaven Borough, Parkside Borough, Upland Borough, Morton Borough, Rutledge Borough, Springfield Township, Swarthmore Borough, Media Borough, Upper Providence Township, Nether Providence Township, Rose Valley Borough

7th District:  Clifton Heights Borough, Yeadon Borough, Lansdowne, Millborne Borough, East Lansdowne Borough

8th District:  Upper Darby Township

9th District:  Haverford Township

10th District:  Marple Township, Newtown Township, Radnor Township

11th District:  Aston Township, Bethel Township, Concord Township, Chadds Ford Township, Chester Heights, Middletown Township, Edgmont Township, Thornbury Township, Birmingham Township

12th District:  Ridley Park, Eddystone, Prospect Park, Tinicum Township

*/


const layer = [
    {
      source: 'Montgomery_County_Police_Districts.geojson',
    },
    {
      // Chester
      source: 'Police_Response_Territory.geojson',
    },
   
  ].map(
    (layer) => {
        let geojson = JSON.parse(
            fs.readFileSync('../public/to incorporate/' + layer.source)
        );

        layer.geojson = geojson;

        const seen = {

        }

        layer.geojson.features =
          layer.geojson.features.map(
            (feature) => {
              console.log('before', feature.properties);
              if (feature.properties.Name) {
                feature.properties.Name =
                  feature.properties.Name
                          .replace("Police Department", "")
                          .replace("Township", "")
                          .trim();

                feature.properties.County = 'Montgomery';

                return feature;
              }
              else if (feature.properties.DEPT_NAME) {
                const name = 
                  feature.properties.DEPT_NAME
                    .replace(' Twp PD', ' Township')
                    .replace(' Boro PD', ' Borough')
                    .replace(' PD', '');

                console.log('name', name);

                feature.properties.Name = name;
                feature.properties.County = 'Chester';

                if (!seen[name]) {
                  seen[name] = feature;
                } else {
                  try {
                  seen[name] = union(
                    seen[name],
                    feature
                  ) ;

                  seen[name].properties.Name = name;
                  seen[name].properties.County = 'Chester';

                  } catch (e) {
                    // some polygon isn't working...
                    console.log(e);
                    seen[name] = feature;
                    feature.properties.Name = name;
                    feature.properties.County = 'Chester';
                  }
                }

                console.log('after', seen[feature.properties.Name]);

                return null;
              } else {
                return feature;
              }

            }
          ).filter(
            feature => !!feature
          ).concat(
            Object.values(seen)
          );

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

fs.writeFileSync('../public/static/Police.geojson', 
  JSON.stringify(layer.geojson)
);



