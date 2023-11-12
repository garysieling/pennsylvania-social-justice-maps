Site here:

https://montcomapsmain.gatsbyjs.io/

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




// Things that make this "special"
    // compute areas of all the geojsons
    // match areas to census units, so everything has base population data
    // ability to link a database of addresses to each grouping (intersection of addresses and social institutions)
    // ability to find intersecting entities


// rangers??

// TODO range control in the legend should have commas

// TODO environmental data: https://gis.dep.pa.gov/esaSearch/
// TODO special ed data: https://penndata.hbg.psu.edu/Public-Reporting/Data-at-a-Glance
// TODO: is there more than one superfund thing? https://www.arcgis.com/home/item.html?id=8f9d8703b4c94d36804a3031f397bc98

// TODO There is some sort of major issue w/ switching between "story" mode and regular mode
//      the colors don't reset and also the range legend doesn't work on the regular one

// TODO this site (originally census data) has info on race, housing:
//   https://pasdc.hbg.psu.edu/Census-2020-Dashboards/Census-2020-Municipal-Data

// TODO React Router
// TODO Stories
    // Spider chart (a graph)
    // or just tie these to areas
        // maybe some kind of workflow that lets you pick?

// todo a cronological view

// A mechanism to turn a list of addresses into an anonmyized dataset
  // or tag to the facets?

// A mechanism to "join" two+ areas into one unit

// A mechanism to compute the population of an area

// TODO libraries / historical society

// TODO: research duty to intervene stats
// TODO: research training budgets vs incidents
// TODO: research on stats on Act 459
// TODO: research on Bill 21205 Statewide database of discipline and use of force

// TODO: something around the building of the food co-op

// TODO: there are sheriffs and constables - independent of police?
// Extract this in tabular form https://en.wikipedia.org/wiki/Pennsylvania_State_Constables
// TODO: something around historic preservation

// TODO: something around the borough hall move

// TODO: something to demonstrate the school funding stuff
  // underfundedness

// TODO the color picker control doesn't know the difference between attribute classes
//    i.e. categorical/diverging/uniform

// TODO there are a lot more color schems at https://github.com/d3/d3-scale-chromatic

// TODO: something about ADA compliance (sidewalks)

// TODO naacp chapters

// TODO measure of living in the neighborhood

// TODO shapefiles for delco/chester county
   // which implies a facet that loads each file, vs one file w/ all

// School district stats
  // # of kids
  // demographics
  // teacher demographics
  // budget
  // # of elementary buildings
  // special ed stats
  // underfundedness
  
// labor stats
// scraper for special ed data, i.e https://penndata.hbg.psu.edu/Public-Reporting/Data-at-a-Glance

// split out the sheets:
//    historically black churches (suburban baptist assn)
//    historical markers / events / black achievements

// a website w/ findings to show the value - blog type thing...

// think about data protection

// some commentary / policies on ethics - written up

// historical stuff around bb. is there a way to get a list of historical markers?
    // carve this out into a separate page/app on my website?
    // list out neighborhoods, churches, events
    
/*
underfunded
power plants that are toxic
targetting election districts
underfunded districts

live free team in philly
  

airbnb - housing would save a lot of stuff

water access

climate issues

show intersectionality

illustrate systemic racism

lack of affordable housing

history of faith, land

identify where there is power

places where people are marginalized

history of redlining
*/

  //{
  //  // TODO what is this for?
  //  name: 'JPO Districts',
  //  key: 9,
  //  loaded: false,
  //  source: '/static/Montgomery_County_-_JPO_Districts.geojson',
  //  nameAttribute: 'Name',
  //}
 //TODO Libraries */
 // TODO NAACPs */


 the tooltip thing + intersections things don't work at once

 the rendering doesn't make sense w/ interects
    like need outline for first layer
    colors once you pick two? or hashes

    and something to highlight what you cliked?