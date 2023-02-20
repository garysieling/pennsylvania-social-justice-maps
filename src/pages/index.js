import * as React from "react";

import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  GeoJSON,
  Circle,
  Polygon,
  Polyline
} from "react-leaflet";

import { 
  Checkbox, 
  Grid, 
  Label, 
  Link, 
  Button,
  IconButton,
  MenuButton,
  Progress,
  Radio,
  Select,
  Option,
  Slider,
  Spinner,
  Switch
} from "theme-ui";

import { cloneDeep, isObject } from "lodash";
import Papa from "papaparse";

import { 
  schemeTableau10 as tileRenderColorScheme,
} from 'd3-scale-chromatic';

import * as COLOR_SCHEMES from 'd3-scale-chromatic';

import Legend from '../components/Legend';
import Description from '../components/Description';
import RenderingControls from '../components/RenderingControls';
import Facets from '../components/Facets';

import area from '@turf/area';
import intersections from '../data/intersections';

const position = [40.1546, -75.2216];
const zoom = 12;

const DEFAULT_BLUE = '#4E79A7';

const DEFAULT_LEGEND = {
  type: 'Categorical',
  attributes: {
    'All Values': DEFAULT_BLUE
  }
};

const pageStyles = {
  color: "#232129",
  padding: 96,
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
}

const headingAccentStyles = {
  color: "#663399",
}
const paragraphStyles = {
  marginBottom: 48,
}
const codeStyles = {
  color: "#8A6534",
  padding: 4,
  backgroundColor: "#FFF4DB",
  fontSize: "1.25rem",
  borderRadius: 4,
}
const listStyles = {
  marginBottom: 10,
  paddingLeft: 0,
}

const listItemStyles = {
  fontWeight: 300,
  fontSize: 16,
  maxWidth: 560,
  marginBottom: 10,
  listStyleType: "none"
}

const linkStyle = {
  color: "#8954A8",
  fontWeight: "bold",
  fontSize: 16,
  verticalAlign: "5%",
}

const docLinkStyle = {
  ...linkStyle,
  listStyleType: "none",
  marginBottom: 24,
}

const descriptionStyle = {
  color: "#232129",
  fontSize: 14,
  marginTop: 10,
  marginBottom: 0,
  lineHeight: 1.25,
}

const docLink = {
  text: "Documentation",
  url: "https://www.gatsbyjs.com/docs/",
  color: "#8954A8",
}

const badgeStyle = {
  color: "#fff",
  backgroundColor: "#088413",
  border: "1px solid #088413",
  fontSize: 11,
  fontWeight: "bold",
  letterSpacing: 1,
  borderRadius: 4,
  padding: "4px 6px",
  display: "inline-block",
  position: "relative",
  top: -2,
  marginLeft: 10,
  lineHeight: 1,
}


let j = 0;
let trim = (value) => (value + '').trim();


const sourceData = [
  {
    name: 'County',
    key: '1',
    loaded: false,
    source: '/static/Counties.geojson',
    nameAttribute: 'co_name',
    whereObtained: 'Public Datasets',
    nameProcessor: trim,
    attributeSource: '/static/Data Sheets - Counties.tsv',
    attributeSourceKey: 'Name',
    attributeCategoryTypes: {
      'Constables': 'Ordered'
    },
    attributeNumericAttributes: [
      'Constables'
    ],
    attributesToDisplay: [
      'Constables'
    ]
  },
  {
    name: 'Zip',
    key: '2',
    loaded: false,
    source: '/static/zcta.geojson',
    nameAttribute: 'ZCTA5CE10',
    // https://www.pccdcis.pa.gov/CCETS/Public/ConstableFinder.aspx
    whereObtained: 'Converted from https://www.pccdcis.pa.gov/CCETS/Public/ConstableFinder.aspx',
    nameProcessor: trim
  },
  {
    name: 'Municipality',
    key: '3',
    loaded: false,
    source: '/static/Municipalities.geojson',
    nameAttribute: ['co_name', 'mun_name'],
    whereObtained: 'Chester County Public Datasets',
    nameProcessor: trim,
    attributeSource: '/static/municipalities/data.tsv',
    // TODO this needs TO JOIN ON BOTH COUNTY AND MUNICIPALITY OR THE FIPS CODE
    attributeSourceKey: ['County', 'Municipality'],
    // TODO source some attributes from the geojson
    // like Municipal_Class
    attributeCategoryTypes: {
      '2020': 'Ordered',
      '2010': 'Ordered',
      'Percent Change': 'Ordered',
      'Environmental Action Communitee': 'Categorical',
      'Human Rights Comittee': 'Categorical',
      'Municipal Class': 'Categorical'    },
    attributeNumericAttributes: [
      '2020',
      '2010',
      'Percent Change'
    ],
    attributesToDisplay: [
      '2020',
      '2010',
      'Percent Change',
      'Environmental Action Communitee',
      'Human Rights Comittee',
      'Municipal Class',
      'Square Miles'
    ]
  },
  {
    name: 'School District',
    key: '4',
    loaded: false,
    source: '/static/SchoolDistricts.geojson',
    nameAttribute: ['school_nam'],
    whereObtained: 'Montgomery County Public Datasets',
    nameProcessor: trim,
    attributeSource: '/static/SchoolDistricts.csv',
    attributeSourceKey: ['LEA'],
    attributeCategoryTypes: {
      'Ratio of black to white discipline': 'Ordered',
    },
    attributeNumericAttributes: [
      'Ratio of black to white discipline',
    ],
    attributesToDisplay: [
      'Ratio of black to white discipline',
    ]
  },
  {
    name: 'Police Department',
    key: '5',
    loaded: false,
    source: '/static/Police.geojson',
    nameAttribute: ['County', 'Name'],
    nameProcessor: trim,
    attributeSource: '/static/police/data.tsv',
    attributeSourceKey: ['County', 'Location'],
    attributeCategoryTypes: {
      'Pennsylvania Chief of Police Association Accreditation': 'Categorical',
      'Total Employees': 'Ordered',
      'Full Time Civilians': 'Ordered',
      'Full Time Sworn Officers': 'Ordered',
      'Part Time Civilians': 'Ordered',
      'Part Time Sworn Officers': 'Ordered',
    },
    attributeNumericAttributes: [
      'Total Employees',
      'Full Time Civilians',
      'Full Time Sworn Officers',
      'Part Time Civilians',
      'Part Time Sworn Officers'
    ],
    attributesToDisplay: [
      'Chief Name',
      'Last Update',
      'Total Employees',
      'Pennsylvania Chief of Police Association Accreditation',
      'Full Time Civilians',
      'Full Time Sworn Officers',
      'Part Time Civilians',
      'Part Time Sworn Officers'
    ]
  },
  {
    name: 'Magesterial Courts',
    key: '6',
    loaded: false,
    source: '/static/MagesterialCourts.geojson',
    nameAttribute: 'District',
    whereObtained: 'Montgomery County Public Datasets',
    citation: 'https://data-montcopa.opendata.arcgis.com/datasets/ea654fc7b22f4039a8c3e1e85bcf868f_0/explore?location=40.210302%2C-75.353586%2C10.69',
    nameProcessor: trim
  },
  {
    name: 'PA Senate District',
    key: '7',
    loaded: false,
    source: '/static/Pennsylvania_State_Senate_Boundaries.geojson',
    nameAttribute: 'leg_distri',
    whereObtained: 'Montgomery County Public Datasets',
    citation: 'https://data-montcopa.opendata.arcgis.com/datasets/montcopa::montgomery-county-pa-senate-districts-2022-1/explore?location=40.210380%2C-75.353586%2C10.94',
    nameProcessor: (name) => name + '',
    attributeSource: '/static/Data Sheets - PA Senate.csv',
    attributeSourceKey: 'District',
    attributeCategoryTypes: {
      //'2020 Population': 'Ordered',
      //'Registered Voters': 'Ordered',
      //'Registered Democrats': 'Ordered',
      //'Registered Republicans': 'Ordered',
      //'Registered Independents': 'Ordered', 
      //'Registered Other': 'Ordered',
      // the values don't add up?
      //'Square Miles': 'Ordered'
    },
    attributeNumericAttributes: [
      //'2020 Population',
     // 'Registered Voters',
     // 'Registered Democrats',
     // 'Registered Republicans',
     // 'Registered Independents',
     // 'Registered Other',
      // the values don't add up?
      //'Square Miles'
    ],
    attributesToDisplay: [
      //'2020 Population',
      //'Representative', 
      //'Home County',
      //'Representative Party', 
      //'Registered Voters',
      //'Registered Democrats',	
      //'Registered Republicans',
      //'Registered Independents',	
      //'Registered Other',
      //'Square Miles'
    ]
  },
  {
    name: 'PA House District',
    key: '8',
    loaded: false,
    source: '/static/Pennsylvania_State_House_Boundaries.geojson',
    nameAttribute: 'leg_distri',
    whereObtained: 'PA Public Datasets',
    nameProcessor: (name) => name + '',
    attributeSource: '/static/Data Sheets - PA House.csv',
    attributeSourceKey: 'District',
    attributeCategoryTypes: {
      //'2020 Population': 'Ordered',
      //'Registered Voters': 'Ordered',
      //'Registered Democrats': 'Ordered',
      //'Registered Republicans': 'Ordered',
      //'Registered Independents': 'Ordered', 
      //'Registered Other': 'Ordered',
      // the values don't add up?
      //'Square Miles': 'Ordered'
    },
    attributeNumericAttributes: [
      //'2020 Population',
      //'Registered Voters',
      //'Registered Democrats',
      //'Registered Republicans',
      //'Registered Independents',
      //'Registered Other',
      // the values don't add up?
      //'Square Miles'
    ],
    attributesToDisplay: [
      //'2020 Population',
      //'Representative',
      //'Home County',
      //'Representative Party', 
      //'Registered Voters',
      //'Registered Democrats',	
      //'Registered Republicans',
      //'Registered Independents',	
      //'Registered Other',
      // the values don't add up?
      //'Square Miles'
    ]
  },
  {
    name: 'State Police',
    key: '9',
    loaded: false,
    source: '/static/StatePolice.geojson',
    nameAttribute: 'Troop',
    whereObtained: 'https://www.pasda.psu.edu/uci/DataSummary.aspx?dataset=1691',
    nameProcessor: trim
  },
  //{
  //  // TODO what is this for?
  //  name: 'JPO Districts',
  //  key: 9,
  //  loaded: false,
  //  source: '/static/Montgomery_County_-_JPO_Districts.geojson',
  //  nameAttribute: 'Name',
  //  nameProcessor: trim
  //}
 //TODO Libraries */
 // TODO NAACPs */
];


let stories = [
  {
    name: 'N/A',
    key: '0',
    loaded: true,
    data: [],
    popupFields: [],
    legend: cloneDeep(DEFAULT_LEGEND),
    description: ``
  },
  {
    name: 'Ambler NAACP - Police Meeting',
    key: '2',
    loaded: false,
    source: '/static/ambler naacp - meeting.csv',
    popupFields: [],
    description: `
      The Ambler NAACP met publically with several police departments in 2020.
      
      <a href="https://www.facebook.com/UpperGwyneddPD/posts/shaykh-anwar-muhammad-president-of-the-ambler-area-naacp-members-of-his-executiv/1597643733736356/">[1]</a>
    `
  },
  {
    name: 'Ambler NAACP - Police Memorandum',
    key: '2',
    loaded: false,
    source: '/static/ambler naacp - memorandum.csv',
    popupFields: [],
    description: `
      The Ambler NAACP signed a memorandum of understanding with several 
      departments in 2020.
      
      <a href="https://whyy.org/wp-content/uploads/2021/04/Police-Document-Final.pdf">[1]</a>
    `
  }, 
  {
    name: 'My research',
    key: '3',
    categoryVariable: 'Characterization',
    loaded: false,
    source: '/static/private_ethnography.csv',
    fuzzyLocations: true,
    popupFields: [
      'Speaker Race',
      'Inferred Target',
      'Institution', 
      'Description',
      'When Heard',
      'When Occurred',
      'Location Reference'
    ], 
    description: `
      My personal notes
    `
  }
];



function getValueFromRow(row, sourceKey) {
  if (Array.isArray(sourceKey)) {
    console.log('is array', sourceKey);
    const result = sourceKey.map(
      (key) => row[key]
    ).join(" - ");

    console.log('result', result);
    return result;
  } else {
    return row[sourceKey];
  }
}

if (window) {
  sourceData.filter(
    (recordType) => !!recordType.attributeSource
  ).map(
    (recordType) => {
      Papa.parse(recordType.attributeSource, {
        download: true,
        header: true,
        skipEmptyLines: true,

        complete: function(results, file) {
          recordType.attributes = {};
          
          results.data.map(
            (row) => {
              (recordType.attributeNumericAttributes || []).map(
                (attribute) => {
                  row[attribute] = parseFloat(row[attribute]) || 0;
                }
              )
              
              recordType.attributes[getValueFromRow(row, recordType.attributeSourceKey)] = row;
            }
          )

          console.log('records', recordType.attributes);
        }
      });
    }
  )

  stories.filter(
    (story) => !!story.source
  ).map(
    (story) => {
      const colorScheme = tileRenderColorScheme;
      const maxColor = colorScheme.length;

      Papa.parse(story.source, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results, file) {
          story.legend = {
            type: 'Categorical',
            attribute: story.categoryVariable,
            attributes: {}
          };

          story.data = results.data.map(
            (record) => {
              if (record.latitude) {
                record.latitude = parseFloat(record.latitude.trim());

                if (story.fuzzyLocations) {
                  record.latitude = record.latitude + (Math.random() - 0.5) / 100.0;
                }
              }

              if (record.longitude) {
                record.longitude = parseFloat(record.longitude.trim());

                record.longitude = record.longitude + (Math.random() - 0.5) / 100.0;
              }

              if (record.certainty) {
                record.certainty = parseInt(record.certainty);
              }

              const categoricalValue = record[story.categoryVariable] || 'All Values';
              if (story.legend.attributes[categoricalValue]) {
                record.tileRenderColor = story.legend.attributes[categoricalValue];
              } else {
                if (Object.keys(story.legend.attributes) >= maxColor) {
                  throw 'Only 10 colors available'
                }
    
                const colorIndex = Object.keys(story.legend.attributes).length;
                const color = colorScheme[colorIndex];

                story.legend.attributes[categoricalValue] = color;

                record.tileRenderColor = color;
              }

              return record;
            }
          )

          story.loaded = true;
        }
      });
    }
  );
}

let firstLoad = true;

// Things that make this "special"
    // compute areas of all the geojsons
    // match areas to census units, so everything has base population data
    // ability to link a database of addresses to each grouping (intersection of addresses and social institutions)
    // ability to find intersecting entities


// TODO overlay description for the whole story
// TODO overlay description for each segment of the story
// TODO coloration control for the parts of a story
// TODO facet control for parts of a story
// TODO a feature to select all overlapping items between the different levels of government
// TODO story with points doesn't clear when you switch off it

// rangers??

// TODO range control in the legend should have commas

// TODO need ratios / support for ratios
// TODO house/senate should be alpha

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

// "Stories"
  // Link Zion vs people
  // BMC group

// TODO: a history of this topic through music

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



let cacheBuster = 0;

const StoryPicker = ({onSelectStory, story}) => {
  return (
    <div>
      Story:
      <Select onChange={(e) => onSelectStory(e)} value={story}>
        {
          // TODO There are bugs here because this select is not controlled by React
          stories.map(
            (story, i) => {
              return (
                <option key={i}>
                  {story.name}
                </option>
              );
            }
          )
        }
      </Select>
    </div>
  )
}


function recomputeColoration({facet, attribute}, colorFn, facets) {  
  let legend = null;

  if (!facet || !attribute) {
    legend = cloneDeep(DEFAULT_LEGEND);

    // clear all colors - todo - not working
    Object.keys(facets,
      (facetKey) => {
        Object.keys(facets[facetKey].values).map(
          (value) => {
            facets[facetKey].values[value].tileRenderColor = DEFAULT_BLUE;
          }
        );
      });
  } else {
    legend = {};
    legend.attribute = attribute;
    legend.attributes = {};
    legend.type = facets[facet].attributeCategoryTypes[attribute];
    legend.colorFn = colorFn;

    if (legend.type === 'Categorical') {
      const colorScheme = tileRenderColorScheme;
      const maxColor = colorScheme.length;

      Object.keys(facets[facet].values).map(
        (facetValue) => {
          const record = facets[facet].values[facetValue];

          const categoricalValue = (facets[facet].attributes[facetValue] || {})[attribute] || '';
          if (legend.attributes[categoricalValue]) {
            record.tileRenderColor = legend.attributes[categoricalValue];
          } else {
            const colorIndex = Object.keys(legend.attributes).length;
            const color = colorScheme[colorIndex % maxColor];
  
            legend.attributes[categoricalValue] = color;
  
            record.tileRenderColor = color;
          }
        });
    } else if (
      legend.type === 'Ordered' ||
      legend.type === 'Diverging') {
      legend.min = null;
      legend.max = null;

      Object.keys(facets[facet].values).filter(
        (facetValue) => {
          return facets[facet].values[facetValue].selected; 
        }
      ).map(
        (facetValue) => {
          const value = (facets[facet].attributes[facetValue] || {})[attribute];
          if (value !== null && value !== undefined) {
            if (legend.min == null) {
              legend.min = value;
            }

            if (legend.max == null) {
              legend.max = value;
            }

            if (value > legend.max) { 
              legend.max = value;
            }

            if (value < legend.min) {
              legend.min = value;
            }
          }
        });

      const range = legend.max - legend.min;
      legend.colorFn = colorFn;

      Object.keys(facets[facet].values).map(
        (facetValue) => {
          const record = facets[facet].values[facetValue];

          const value = (facets[facet].attributes[facetValue] || {})[attribute];
          record.tileRenderColor = legend.colorFn(1.0 * value / range)
        });
    }
  }

  return  {
    facets,
    legend
  };
}


const IndexPage = () => {
  console.time("render");

  const [facets, updateFacets] = React.useState({});
  const [story, selectStory] = React.useState('N/A');
  const [coloration, setColorStrategy] = React.useState({});
  const [legend, setLegend] = React.useState({});
  const [description, setDescription] = React.useState('');

  function setColoration({facet, attribute, rangeColorScheme}) {
    console.time("setColoration");
    const colorFn = COLOR_SCHEMES[rangeColorScheme] || COLOR_SCHEMES.interpolatePlasma;

    const colorationResults = recomputeColoration({facet, attribute}, colorFn, facets);

    updateFacets(colorationResults.facets);
    setColorStrategy({
      facet: facet, 
      attribute: attribute
    });

    setLegend(colorationResults.legend);
    console.timeEnd("setColoration");
  }

  function onSelectStory(e) {
    console.time("onSelectStory");

    const storyName = e.target.value;
    let description = '';
    let newLegend = cloneDeep(DEFAULT_LEGEND);

    // re-rendering not a side effect of this, of something later
    stories.forEach(
      (story) => {
        story.selected = story.name === storyName;

        if (story.selected) {
          newLegend = story.legend;
          description = story.description;
        }
      }
    )
  
    Object.keys(facets).map(
      (facetName) => {
        const facet = facets[facetName];
        facet.geojson.features.map(
          feature => {
            const facetValue = getValueFromRow(feature.properties, facet.nameAttribute);
            const selectedFacetFromStory = stories.filter(
                (story) => story.loaded
              ).filter(
                (story) => story.name === storyName
              ).flatMap(
                (story) => story.data
              ).filter(
                (story) => story.facet && story.facetvalue
              ).filter(
                (story) => 
                  story.facet === facet.name &&
                  story.facetvalue === facetValue
              );

            let facetValueChecked = selectedFacetFromStory.length > 0;
    
            if (storyName === 'N/A') {
              facetValueChecked = false;
            }

            let tileRenderColor = DEFAULT_BLUE;
            if (selectedFacetFromStory.length > 0) {
              if (!!selectedFacetFromStory[0].tileRenderColor) {
                tileRenderColor = selectedFacetFromStory[0].tileRenderColor;
              }
            }
    
            facets[facet.name].values[facetValue].selected = facetValueChecked;
            facets[facet.name].values[facetValue].tileRenderColor = tileRenderColor;
          }
        );
      }
    );
    
    setLegend(newLegend);
    selectStory(storyName);
    updateFacets(facets);
    setDescription(description);

    console.timeEnd("onSelectStory");
  }

  React.useEffect(
    () => {
      if (firstLoad) {
        firstLoad = false;
        const initialFacetData = {};
        Promise.all(
          sourceData.map(
            (facet) => 
              fetch(facet.source)
                .then(res => res.text())
                .then(jsonText => {
                  console.time("process " + facet.name);
                  const geojson = JSON.parse(jsonText);

                  geojson.features.map(
                    (value) => {
                      const name = getValueFromRow(value.properties, facet.nameAttribute)
                      value.properties[name] = facet.nameProcessor(
                        value.properties[name],
                        value.properties
                      );
                    }
                  );

                  geojson.features.sort(
                    (featureA, featureB) => {
                      let nameA = getValueFromRow(featureA.properties, facet.nameAttribute);
                      let nameB = getValueFromRow(featureB.properties, facet.nameAttribute);

                      // Needed for house/senate districts
                      if (parseInt(nameA) && parseInt(nameB)) {
                        nameA = parseInt(nameA);
                        nameB = parseInt(nameB);
                      }

                      if (nameA > nameB) {
                        return 1;
                      }

                      if (nameA < nameB) {
                        return -1;
                      }

                      if (nameA === nameB) {
                        return 0;
                      }
                    }
                  )

                  facet.loaded = true;

                  // story selects facet
                  let facetLayerVisible = 
                    stories.filter(
                      (story) => story.loaded
                    ).flatMap(
                      (story) => story.data
                    ).filter(
                      (story) => story.facet && story.facetvalue
                    ).filter(
                      (story) => 
                        story.facet === facet.name
                    ).length > 0;

                  initialFacetData[facet.name] = Object.assign(
                    facet, {
                      'visible': facetLayerVisible,
                      'showMore': false,
                      'geojson': geojson,
                      'values': {}
                    }
                  );

                  geojson.features.map(
                    feature => {
                      const facetValue = getValueFromRow(feature.properties, facet.nameAttribute);

                      let tileRenderColor = DEFAULT_BLUE;

                      initialFacetData[facet.name].values[facetValue] = {
                        selected: false,
                        tileRenderColor: tileRenderColor
                      }
                    }
                  )

                  console.timeEnd("process " + facet.name);
                })
          )
        ).then(
          responses => {
            updateFacets(initialFacetData);
          }
        );
      }
    }
  )

  const facetClicker = (e) => {
    console.time("facetClicker");
    const facetName = e.target.dataset.facetname;

    //const newFacets = cloneDeep(facets);
    const newFacets = Object.assign({}, facets);
    Object.keys(newFacets[facetName].values)
      .map(
        key => {
          newFacets[facetName].values[key].selected = e.target.checked;
        }
      );

    newFacets[facetName].visible = e.target.checked;

    if (coloration.facet && coloration.attribute) {
      setColoration(coloration);
    }
    
    updateFacets(newFacets);
    console.timeEnd("facetClicker");
  } 

  const facetItemClicker = (e) => {
    console.time("facetItemClicker");
    const facetName = e.target.dataset.facetname;
    const facetValue = e.target.dataset.facetvalue;

    //const newFacets = cloneDeep(facets);
    const newFacets = Object.assign({}, facets);
    newFacets[facetName].values[facetValue].selected = e.target.checked;

    if (e.target.checked) {
      newFacets[facetName].visible = true;
    }

    if (coloration.facet && coloration.attribute) {
      setColoration(coloration);
    }

    updateFacets(newFacets);
    console.timeEnd("facetItemClicker");
  }

  const layers = Object.keys(facets)
    .map(
      (key) => facets[key]
    ).filter(
      (facet) => !!facet.geojson
    ).sort(
      (facetA, facetB) => 
        facetA.geojson.features.length - 
        facetB.geojson.features.length
    );

  const facetLayers = 
    layers.filter(
      (layer) => layer.visible
    ).map(
      (layer) => {
        const filteredGeojson = Object.assign({},layer.geojson);

        filteredGeojson.features = filteredGeojson.features.filter(
          (feature) => {
            const facetValue = getValueFromRow(feature.properties, layer.nameAttribute);

            return facets[layer.name].values[facetValue].selected;
          }
        );

        return (
          <GeoJSON
            key={layer.name + (cacheBuster++)}
            onEachFeature={(feature, leafletLayer) => {
                const popupOptions = {
                    minWidth: 100,
                    maxWidth: 250,
                    className: "popup-classname"
                };
      
                leafletLayer.bindPopup(()=>{
                  const clickedItemName = getValueFromRow(feature.properties, layer.nameAttribute);
                  let tooltipContents = '<b>' + layer.name + '</b>: ' + clickedItemName + '<br />';
                 
                  const totalArea = (area(feature) * 3.861E-7).toFixed(1);
                  tooltipContents += '<b>Area:</b> ' + totalArea + ' square miles <br />'
                
                  if (layer.attributesToDisplay) {
                    const theseAttributes = layer.attributes[clickedItemName];
                    layer.attributesToDisplay.map(
                      (attr) => {
                        const attributesForSelected = layer.attributes[clickedItemName];
                        if (attributesForSelected === undefined) {
                          return 'Unlinked Data - ???';
                        }

                        // attributeNumericAttributes

                        let attributeValue = attributesForSelected[attr];

                        if (layer.attributeNumericAttributes.indexOf(attr) > 0) {
                          attributeValue = attributeValue.toLocaleString('en-US')
                        }

                        tooltipContents += '<b>' + attr + '</b>: ' + attributeValue + '<br />';
                      }
                    );
                  }

                  const interactsWith = intersections[layer.name + ':'+ clickedItemName];

                  if (interactsWith) {
                    const intersectKeys = {};
                    interactsWith.map(
                      (key) => key.split(":")
                    ).map(
                      ([key, value]) => {
                        if (!intersectKeys.hasOwnProperty(key)) {
                          intersectKeys[key] = [];
                        }

                        intersectKeys[key].push(value);
                        intersectKeys[key].sort();
                      }
                    );

                    let intersectionsHtml = '';
                    Object.keys(intersectKeys).sort().map(
                      (key) => {
                        let subitems = intersectKeys[key].map(
                          (value) => '<li>' + value + '</li>'
                        ).join("");

                        console.log('key', key)
                        console.log('subitems', subitems)

                        intersectionsHtml += ('<li>' + key + '<ul>' +
                          subitems + '</ul></li>');


                      }
                    );

                    tooltipContents += ('<b>Intersects:</b> <ul>' + 
                       intersectionsHtml + '</ul>');
                  }
                  return tooltipContents || '';
                }, popupOptions);
            }}
            style={
              (reference) => {
                const facetName = layer.name;
                const facetValue = getValueFromRow(reference.properties, layer.nameAttribute);

                const colorFromFacet = facets[facetName].values[facetValue].tileRenderColor;
                const defaultColor = DEFAULT_BLUE;
                
                return {
                  color: colorFromFacet || defaultColor
                };
              }
            }
            data={filteredGeojson} />
        );
      }
    );

  const markers = stories.filter(
    (story) => story.selected
  ).flatMap(
    (story, storyIndex) =>
      story.data.filter(
        (record) => record.latitude && record.longitude
      ).flatMap(
        (record, recordIndex) => {
          let popupContents = 
            story.popupFields.map(
              (field) => 
                <p>
                  <b>{field}:</b> {record[field]}
                </p>
            );


          const results = [(
            <Marker color={record.tileRenderColor || 'blue'} position={[record.latitude, record.longitude]} key={storyIndex + '-' + recordIndex}>
              <Popup>
                {popupContents}
              </Popup>
            </Marker>
          )];

          if (record.certainty) {
            results.push((
              <Circle 
                center={[record.latitude, record.longitude]} 
                pathOptions={{ 
                  fillColor: record.tileRenderColor || DEFAULT_BLUE,
                  color: record.tileRenderColor || DEFAULT_BLUE
                }} 
                radius={150 * record.certainty} />
            ));
          }

          return results;
        }
      )
  );

  const result = (
    <Grid
      gap={2} 
      columns={[2, '0.5fr 3fr']}>
      <aside>
        <Facets layers={layers} 
          facets={facets}
          facetClicker={facetClicker}
          facetItemClicker={facetItemClicker}
          getValueFromRow={getValueFromRow}
        />
      </aside>
      <main style={pageStyles}>
        <Grid
          gap={2} 
          columns={[2, '1fr 1fr']}>
            <div>
              <StoryPicker onSelectStory={onSelectStory} story={story} />
              <RenderingControls 
                layers={layers} 
                facets={facets} 
                setColoration={setColoration}
              />
            </div>
            <div>
              <Description description={description} />
              <Legend data={legend} />
            </div>
        </Grid>
          <MapContainer style={{ height: '600px' }} center={position} zoom={zoom} scrollWheelZoom={true}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            { markers }
            { facetLayers }
          </MapContainer>
      </main>
    </Grid>
  );

  console.timeEnd("render");
  
  return result;
}

export default IndexPage;