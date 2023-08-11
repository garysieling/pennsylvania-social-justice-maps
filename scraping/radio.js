const papa = require("papaparse");
const fs = require('fs');
const helpers = require('@turf/helpers');
const concave = require('@turf/concave').default;

const readline = require('readline');

const items = [];
papa.parse(fs.createReadStream('../datasets/ny_pa_fm_radio.txt'), {
  header: false,
  complete: function(results, file) {
    const applications = {}
    const lms = {};
    results.data.map(
      (record) => {
        const callsign = record[1].trim();
        const frequency = record[2].trim();
        const city = record[10].trim();
        const state = record[11].trim();
        
        const lms_application_id = record[38].trim();
        const application_id = record[37].trim();
        if (callsign !== '-') {

          applications[application_id] = {callsign, frequency, city, state, lms_application_id, application_id};
          lms[lms_application_id] = {callsign, frequency, city, state, lms_application_id, application_id};
        }
      }
    );
           
    const rl = readline.createInterface({
      input: fs.createReadStream('../datasets/FM_service_contour_current.txt')
    });
       
    rl.on('line', (line) => {
      const fields = line.split('|');
      if (fields.length > 10) {
        const application_id = fields.shift().trim();
        const service = fields.shift().trim();
        const lms_application_id = fields.shift().trim();

        if (service === 'FM') {
          if (applications[application_id] || lms[lms_application_id]) {
            /*console.log('fields', fields.map(
              (field) => field.split(",").map(x => x.trim())
            ));*/

            let allPoints = fields.map(
              field => field.split(",").map(x => parseFloat(x.trim())).reverse()
            ).filter(
              field => field.length == 2 && field[0] !== null
            );

            allPoints.shift();

            allPoints = allPoints.reverse();
            allPoints.push(allPoints[0]);
            const poly = 
              {"type":"Feature","properties": applications[application_id] || lms[lms_application_id],
               "geometry":{"type":"Polygon","coordinates":[
                allPoints
              ]}};

            const callsign = poly.properties.callsign;
            if (!![
              'W239BX',
              'WTSS',
              'WCOQ',
              'WCOF',
              'WCOU',
              'WCIK',
              'WCIN',
              'WCIG',
              'W275BC',
              'WDRE', 
              'WILQ',
              'W291CN',
              'WBUF',
              'W204CR',
              'WCOH-FM',
              'WCGV',
              'WCIY',
              'W279AB',
              'WCOH-FM',
              'WCGT',
              'WCIP',
              'W272BO',
              'WCOG-FM',
              'WCIS',
              'WCOH',
              'W263CN',
              'WCOM',
              'WCOP',
              'WCIH',
              'WCID',
              'WCGH',
              'WCOV',
              'WCOG',
              'WCIK',
              'WCOA',
              'WCDR',
              'WCOR',
              'W284BG',
              'WILQ',
              'WCGS',
              'W272DV',
              'WILQ',
              'W262CQ',
              'WBUF',
              'WCIM',
              'W239BA',
              'WBUF',
              'WCGE',
              'W293BE',
              'WCII',
              'W266BN',
              'WCOV-FM',
              'WCIT',
              'W250BE',
              'WCIJ',
              'WCIO',
              'W220CJ',
              'WCIY',
              'WCDN',
              'W234AZ',
              'WBZA',
              'WCDH',
              'WCOM',
              'WCII',
              'WCOB',
              'W252AC',
              'WCIS-FM',
              'WCOT',
              'W238BD',
              'WCOB',
              'W228CH',
              'WCIN',
              'WCDV-FM',
              'WCDJ',
              'WCIJ',
              'W283AT',
              'WCIJ',
              'W264AT',
              'WCOT',
              'WCGM',
              'W230BM',
              'WCIH',
              'WKRZ',
              'W277BJ',
              'WILQ'
            ].indexOf[callsign.toUpperCase()] >= 0) {
              poly.properties.FLN = true;
              poly.properties.type = 'Christian Radio';
            } else {
              poly.properties.FLN = false;
              poly.properties.type = 'Other';
            }

          //  console.log(JSON.stringify(allPoints));

            /*var points = helpers.featureCollection(
              allPoints.map(helpers.point)
            );

            var options = {units: 'degrees', maxEdge: 360};
            
            const hull = helpers.feature(
              points, options,
              applications[application_id] || lms[lms_application_id]
            );*/
           
           items.push(poly);
          }
        }
      }
    });
  
    rl.on('close', () => {
      var collection = helpers.featureCollection(items);
      fs.writeFileSync("../public/static/radio.geojson", JSON.stringify(collection, null, 2));

      console.log('close!');
    })
  }
});

