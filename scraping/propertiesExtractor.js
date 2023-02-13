const fs = require('fs');
let geojson = JSON.parse(
    fs.readFileSync('../public/static/Montgomery_County_Municipal_Boundaries.geojson')
);

geojson.features.map(
    (feature) => {
        console.log(
            feature.properties.Name + "\t" +
            feature.properties.Municipal_Class + "\t" +
            feature.properties.Sq_Miles + "\t" +
            feature.properties.Web_URL
        );
    }
)