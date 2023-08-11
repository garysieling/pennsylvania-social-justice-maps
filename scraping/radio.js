const papa = require("papaparse");
const fs = require('fs');

const readline = require('readline');
  

function toGeoJson(row) {
  console.log(row);
}

papa.parse(fs.createReadStream('../datasets/ny_pa_fm_radio.txt'), {
  header: false,
  complete: function(results, file) {
    const applications = {}
    const lms = {};
    const stations = results.data.map(
      (record) => {
        const callsign = record[1].trim();
        const frequency = record[2].trim();
        const city = record[10].trim();
        const state = record[11].trim();
        
        const lms_application_id = record[38].trim();
        const application_id = record[37].trim();
        if (callsign !== '-') {

          applications[application_id] = true;
          lms[lms_application_id] = true;

          return {callsign, frequency, city, state, lms_application_id, application_id};
        }
      }
    );

    console.log('stations', stations);
            
    const rl = readline.createInterface({
      input: fs.createReadStream('../datasets/FM_service_contour_current.txt')
    });

    rl.on('line', (line) => {
      const fields = line.split('|');
      if (fields.length > 10) {
        const application_id = fields[0].trim();
        const service = fields[1].trim();
        const lms_application_id = fields[2].trim();

        if (service === 'FM') {
          if (applications[application_id] || lms[lms_application_id]) {
            console.log('Line from file:', toGeoJson(fields));
          }
        }
      }
    });

    rl.on('close', () => {
      console.log('close!');
    })
  }
});

