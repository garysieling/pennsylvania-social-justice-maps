const fs = require('fs');
let geojson = JSON.parse(
    fs.readFileSync('../public/static/Montgomery_County_PA_Senate_Districts_-_2022.geojson')
);

/*
operties": { 
    "OBJECTID": 62, "District": 131, 
    "Last_Name": "Mackenzie", "First_Name": 
    "Milou", "Home_County":
     "Northampton",
      "Party": "R",
       "Population_2020": 24946, 
       "Registered_Voters": 16727,
        "Registered_DEM": 5649, 
        "Registered_REP": 8319, 
        "Registered_IND": 198, 
        "Registered_OTH": 2561, 
        "Total_VTD": 9, 
        "Web_URL": "http://www.legis.state.pa.us/cfdocs/legis/home/member_information/house_bio.cfm?districtnumber=131", 
        "Shape__Area": 1275571235.88708,
         "Shape__Length": 192803.55052908801 }, "geometry": { "type": "Polygon", "coordinates":
*/

geojson.features.map(
    (feature) => {
        console.log(
            feature.properties.District + "\t" +
            feature.properties.Population_2020 + "\t" +
            feature.properties.First_Name + ' ' + feature.properties.Last_Name + "\t" +
            feature.properties.Home_County + "\t" +
            feature.properties.Party + "\t" +
            feature.properties.Registered_Voters + "\t" +
            feature.properties.Registered_DEM + "\t" +
            feature.properties.Registered_REP + "\t" +
            feature.properties.Registered_IND + "\t" +
            feature.properties.Registered_OTH + "\t" +
            feature.properties.Web_URL + "\t" + 
            feature.properties.Shape__Area / 2589988.1103
        );
    }
)