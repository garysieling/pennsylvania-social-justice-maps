const codes = {
'19446': true,
'19464': true,
'19403': true,
'19460': true,
'19426': true,
'19401': true,
'19002': true,
'19087': true,
'19038': true,
'19454': true,
'19406': true,
'19468': true,
'19006': true,
'19438': true,
'19010': true,
'19040': true,
'19027': true,
'19473': true,
'19422': true,
'19046': true,
'19428': true,
'19090': true,
'19525': true,
'19440': true,
'19044': true,
'19001': true,
'18969': true,
'18964': true,
'19462': true,
'19096': true,
'19003': true,
'18073': true,
'19072': true,
'19004': true,
'19444': true,
'19085': true,
'19034': true,
'19075': true,
'19095': true,
'19041': true,
'19012': true,
'18041': true,
'19066': true,
'18074': true,
'18054': true,
'19405': true,
'19504': true,
'19031': true,
'19025': true,
'19035': true,
'18076': true,
'18915': true,
'18936': true,
'19453': true,
'19009': true,
'18070': true,
'19436': true,
'19492': true,
'19435': true,
'19456': true,
'18924': true,
'19420': true,
'19485': true,
'18084': true,
'18918': true,
'18957': true,
'18958': true,
'18971': true,
'18979': true,
'19049': true,
'19048': true,
'19404': true,
'19407': true,
'19409': true,
'19408': true,
'19415': true,
'19424': true,
'19423': true,
'19429': true,
'19430': true,
'19437': true,
'19441': true,
'19443': true,
'19451': true,
'19450': true,
'19455': true,
'19472': true,
'19474': true,
'19477': true,
'19478': true,
'19484': true,
'19486': true,
'19490': true
};

const fs = require('fs');
// zips includes .features[ properties.ZCTA5CE10 [value]a
console.log( "{");
console.log('"type": "FeatureCollection",')
console.log('"name": "tl_2019_us_zcta510",')
console.log('"crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:EPSG::4269" } },')
console.log('"features": [')

var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('zcta5.geo.jsonl')
});

lineReader.on('line', function (line) {
  const data = JSON.parse(line);

  if (codes[data.properties.ZCTA5CE10]) {
  console.log(line + ",");
  }
});

lineReader.on('close', function() {
console.log(']')
console.log('}')
});
