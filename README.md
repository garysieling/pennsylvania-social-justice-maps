<p align="center">
  <a href="https://www.gatsbyjs.com/?utm_source=starter&utm_medium=readme&utm_campaign=minimal-starter">
    <img alt="Gatsby" src="https://www.gatsbyjs.com/Gatsby-Monogram.svg" width="60" />
  </a>
</p>
<h1 align="center">
  Gatsby minimal starter
</h1>


Converting Census data:

Reference: https://github.com/jgoodall/us-maps

Downlaod from here:

https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-geodatabase-file.html
l
brew install gdal

npm install -g json-minify

https://www.census.gov/programs-surveys/geography/guidance/geo-areas/zctas.html

https://carto.com/blog/zip-codes-spatial-analysis/
docker run -it -p 6432:5432 -e =POSTGRES_PASSWORD=password postgis/postgis:15-3.3

FROM tl_2019_us_zcta510
cd data 
ogr2ogr -f "GeoJSON" zcta5.geo.json ./tl_2019_us_zcta510.shp
node zcta_filter.js > montco_zcta5.geojson
