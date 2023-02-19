const Papa = require("papaparse");

const fs = require('fs');

/*
Bucks county has made this intentionally hard to get
https://bucksgis.maps.arcgis.com/apps/mapviewer/index.html?layers=95cbd4b20b164cee961d583082b7312b
*/
const data = fs.readFileSync('../public/to incorporate/discipline_montgomery_county_schools_report.csv')  + '';
const numberColumns = [
    //'Instances', unsure what this is
'American Indian or Alaska Native',
'Asian or Pacific Islander',
'Asian',
'Hawaiian/ Pacific Islander',
'Hispanic',
'Black',
'White',
'Two or more races',
'Total',
//'EL' unsure what this is
];

function groupBy(
    results,
    columns,
    reducer
) {
    const seen = {};

    for (var i = 0; i < results.length; i++) {
        const row = results[i];
        const key = columns.map(
            (col) => row[col]
        ).join(" - ");

        if (!seen[key]) {
            seen[key] = [];
        }

        seen[key].push(row);
    }

    //console.log('seen', seen);

    return Object.keys(seen).flatMap(
        (key) => {
            const row = seen[key].reduce(reducer);

            const firstRow = seen[key][0];
            for (var i = 0; i < columns.length; i++) {
                const key = columns[i];
                row[key] = firstRow[key];
            }

            return row;
        }
    )

}

function join(ds1, ds2, name1, name2, key,) {
    const seen = {

    };

    for (var i = 0; i < ds1.length; i++) {
        const keyValue = ds1[i][key];
        seen[keyValue] = {};
        seen[keyValue][key] = keyValue;
        
        for (var j = 0; j < numberColumns.length; j++) {
            seen[keyValue][name1 + numberColumns[j]] =
                ds1[i][numberColumns[j]];
        }
    }

    for (var i = 0; i < ds2.length; i++) {
        const keyValue = ds2[i][key];
        
        for (var j = 0; j < numberColumns.length; j++) {
            seen[keyValue][name2 + numberColumns[j]] =
                ds2[i][numberColumns[j]];

            seen[keyValue]['percent: ' + numberColumns[j]] =
                100.0 * seen[keyValue][name1 + numberColumns[j]] /
                ds2[i][numberColumns[j]];
        }
    }

    return Object.keys(seen).map(
        (key) => seen[key]
    );
}

Papa.parse(data, {
    download: false,
    header: true,
    skipEmptyLines: true,
    delimiter: ",",
    newline: "\n",

    complete: function(results, file) {
        //municipalities
        //console.log('results', results, file);

        results = results.data.map(
            (row) => {
                row.LEA = row.LEA.replace(
                    ' Sd', ''
                ).replace(
                    ' Area', ''
                ).replace(
                    ' SCHOOL DISTRICT', ''
                ).replace(' SD', '');

                row.EL = row["EL\r"];
                delete row["EL\r"];

                numberColumns.map(
                    (column) => {
                        if (row[column] === '') {
                            row[column] = 0;
                        } else {
                            row[column] = parseInt(row[column]);
                        }
                    }
                )

                if (row.School.indexOf(' El Sch') >= 0) {
                    row.type = 'Elementary';
                } else if (row.School.indexOf(' Ms')) {
                    row.type = 'Middle';
                } else {
                    console.log('UNKOWN TYPE', row.School);
                }

                return row;
            }
        );

        // Total enrollment
        const totalEnrollment = results.filter(
            ({Category, Year}) =>
                Category === 'Total enrollment' && 
                Year === '2000'
        );

        const punishments = results.filter(
            ({Category}) =>
                Category !== 'Total enrollment'
        );

        const cumulativeTotalEnrollment = results.filter(
            ({Category}) =>
                Category === 'Total enrollment'
        );

        const cumulativePunishments = groupBy(
            punishments,
            ['LEA'],
            (row1, row2) => {
                const result = {};
                for (var i = 0; i < numberColumns.length; i++) {
                    const col = numberColumns[i];
                    const sum = row1[col] + row2[col];
                    result[col] = sum;
                }

                return result;
            }    
        ) // change the numbers to per capita

        const cumulativePopulation = groupBy(
            cumulativeTotalEnrollment,
            ['LEA'],
            (row1, row2) => {
                const result = {};
                for (var i = 0; i < numberColumns.length; i++) {
                    const col = numberColumns[i];
                    const sum = row1[col] + row2[col];
                    result[col] = sum;
                }

                return result;
            }    
        );

        const result = 
            join(
                cumulativePunishments,
                cumulativePopulation,
                'discipline: ',
                'cumulative: ',
                'LEA'
            ).map(
                (result) => {
                    const var1 = result['percent: Black'];
                    const var2 = result['percent: White'];

                    result['Ratio of black to white discipline'] = var1 / var2;

                    return result;
                }
            );

        const LEAs = {};
        totalEnrollment.forEach(
            (row) => {
                LEAs[row.LEA] = row;
            }
        );

        const newResult = result.map(
            (row) => {
                return Object.assign(
                    row,
                    LEAs[row.LEA]
                )
            }
        ).map(
            (row) => {
                row.LEA = row.LEA.trim();

                const replacements = {
                    "LOWER MORELAND TOWNSHIP": "Lower Moreland",
                    "ABINGTON": "Abington",
                    "POTTSGROVE": "Pottsgrove",
                    "BOYERTOWN AREA": "Boyertown",
                    "UPPER MERION AREA": "Upper Merion",
                    "UPPER PERKIOMEN": "Upper Perkiomen",
                    "UPPER DUBLIN": "Upper Dublin",
                    "POTTSTOWN": "Pottstown",
                    "NORRISTOWN AREA": "Norristown",
                    "SOUDERTOWN AREA": "Souderton",
                    "SPRINGFIELD TOWNSHIP": "Springfield Township",
                    "SPRING-FORD AREA": "Spring-Ford",
                    "HATBORO-HORSHAM": "Hatboro-Horsham",
                    "NORTH PENN": "North Penn",
                    "CENTRAL BUCKS": "Central Bucks"
                };

                if (replacements[row.LEA]) {
                    row.LEA = replacements[row.LEA];
                }

                return row;
            }
        )



        const csv = Papa.unparse(newResult, {
            //quotes: false, //or array of booleans
            quoteChar: '"',
            escapeChar: '"',
            delimiter: ",",
            header: true,
            newline: "\r\n",
            //skipEmptyLines: false, //other option is 'greedy', meaning skip delimiters, quotes, and whitespace.
            //columns: null //or array of strings        
        });

        console.log('joined results', csv);
        fs.writeFileSync('../public/static/SchoolDistricts.csv', csv);
    }
  });
