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

import hash from "object-hash";
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

import { cloneDeep } from "lodash";
import Papa from "papaparse";

import { 
  schemeTableau10 as tileRenderColorScheme,
} from 'd3-scale-chromatic';

import * as COLOR_SCHEMES from 'd3-scale-chromatic';

import Legend from './components/Legend';
import RenderingControls from './components/RenderingControls';
import Facets from './components/Facets';

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

const links = [
  {
    text: "Tutorial",
    url: "https://www.gatsbyjs.com/docs/tutorial/",
    description:
      "A great place to get started if you're new to web development. Designed to guide you through setting up your first Gatsby site.",
    color: "#E95800",
  },
]

let j = 0;
let trim = (value) => value.trim();


const sourceData = [
  {
    name: 'County',
    key: '1',
    loaded: false,
    source: '/static/Montgomery_County_Boundary.geojson',
    nameAttribute: 'Name',
    whereObtained: 'Montgomery County Public Datasets',
    nameProcessor: trim
  },
  {
    name: 'Zip',
    key: '2',
    loaded: false,
    source: '/static/montco_zcta5.geojson',
    nameAttribute: 'ZCTA5CE10',
    // https://www.zillow.com/browse/homes/pa/montgomery-county/
    whereObtained: 'Converted from https://www2.census.gov/geo/tiger/TIGER2019/ZCTA5/',
    nameProcessor: trim
  },
  {
    name: 'Municipality',
    key: '3',
    loaded: false,
    source: '/static/Montgomery_County_Municipal_Boundaries.geojson',
    nameAttribute: 'Name',
    whereObtained: 'Montgomery County Public Datasets',
    nameProcessor: trim
  },
  {
    name: 'School District',
    key: '4',
    loaded: false,
    source: '/static/Montgomery_County_School_Districts.geojson',
    nameAttribute: 'Name',
    whereObtained: 'Montgomery County Public Datasets',
    nameProcessor: trim
  },
  {
    name: 'Police Department',
    key: '5',
    loaded: false,
    source: '/static/Montgomery_County_Police_Districts.geojson',
    nameAttribute: 'Name',
    whereObtained: 'Montgomery County Public Datasets',
    nameProcessor: (name) => {
      return name
        .replace("Police Department", "")
        .replace("Township", "")
        .trim();
    },
    attributeSource: '/static/police/data.tsv',
    attributeSourceKey: 'Location',
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
    name: 'Magesterial Court District',
    key: '6',
    loaded: false,
    source: '/static/Montgomery_County_Magisterial_Districts.geojson',
    nameAttribute: 'District',
    whereObtained: 'Montgomery County Public Datasets',
    citation: 'https://data-montcopa.opendata.arcgis.com/datasets/ea654fc7b22f4039a8c3e1e85bcf868f_0/explore?location=40.210302%2C-75.353586%2C10.69',
    nameProcessor: trim
  },
  /*{
    // TODO what is this for?
    name: 'JPO Districts',
    key: 7,
    loaded: false,
    source: '/static/Montgomery_County_-_JPO_Districts.geojson',
    nameAttribute: 'Name',
    nameProcessor: trim
  }*/
  /*
    TODO legislative districts
  */
 /* TODO Libraries */
 /* TODO NAACPs */
];


let stories = [
  {
    name: 'N/A',
    key: '0',
    loaded: true,
    description: 'N/A',
    data: [],
    popupFields: [],
    legend: cloneDeep(DEFAULT_LEGEND),
    description: ``
  },
  /*{
    name: 'Stories 1',
    key: '1',
    loaded: false,
    source: '/static/points.csv',
    description: 'Demo',
    popupFields: []
  },*/
  {
    name: 'Ambler NAACP - Police Meeting',
    key: '2',
    loaded: false,
    source: '/static/ambler naacp - meeting.csv',
    popupFields: [],
    description: `
      The Ambler NAACP met publically with several police departments in 2020.
      
      <a href="https://www.facebook.com/UpperGwyneddPD/posts/shaykh-anwar-muhammad-president-of-the-ambler-area-naacp-members-of-his-executiv/1597643733736356/">Reference</a>
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
      
      <a href="https://whyy.org/wp-content/uploads/2021/04/Police-Document-Final.pdf">Reference</a>
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

// TODO overlay description for the whole story
// TODO overlay description for each segment of the story
// TODO description of the dataset
// TODO coloration control for the parts of a story
// TODO facet control for parts of a story
// TODO a feature to select all overlapping items between the different levels of government

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

            recordType.attributes[row[recordType.attributeSourceKey]] = row;
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

let firstLoad = true;

// TODO There is some sort of major issue w/ switching between "story" mode and regular mode
//      the colors don't reset and also the range legend doesn't work on the regular one

// TODO React Router
// TODO Stories
    // Spider chart (a graph)

// A mechanism to turn a list of addresses into an anonmyized dataset

// A mechanism to "join" two+ areas into one unit

// A mechanism to compute the population of an area

// TODO libraries / historical society

// "Stories"
  // Link Zion vs people
  // BMC group

// TODO story of "previous" attempt at some discussion

// TODO: a history of this topic through music

// TODO: research duty to intervene stats
// TODO: research training budgets vs incidents
// TODO: research on stats on Act 459
// TODO: research on Bill 21205 Statewide database of discipline and use of force

// TODO: something around the building of the food co-op

// TODO: there are sheriffs and constables - independent of police?

// TODO: something around historic preservation

// TODO: something around the borough hall move

// TODO: something to demonstrate the school funding stuff

// TODO: something about ADA compliance (sidewalks)

// TODO naacp chapters

// TODO measure of living in the neighborhood

// historical stuff around bb. is there a way to get a list of historical markers?
    // carve this out into a separate page/app on my website?
    // list out neighborhoods, churches, events

//todo color range changer
    
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
          if (value) {
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
  const [facets, updateFacets] = React.useState({});
  const [story, selectStory] = React.useState('N/A');
  const [coloration, setColorStrategy] = React.useState({});
  const [legend, setLegend] = React.useState({});

  function setColoration({facet, attribute, colorScheme}) {
    const colorFn = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES.interpolatePlasma;

    const colorationResults = recomputeColoration({facet, attribute}, colorFn, facets);

    updateFacets(colorationResults.facets);
    setColorStrategy({
      facet: facet, 
      attribute: attribute
    });

    setLegend(colorationResults.legend);
  }

  function onSelectStory(e) {
    const storyName = e.target.value;
    let newLegend = cloneDeep(DEFAULT_LEGEND);

    // re-rendering not a side effect of this, of something later
    stories.forEach(
      (story) => {
        story.selected = story.name === storyName;

        if (story.selected) {
          newLegend = story.legend;
        }
      }
    )
  
    Object.keys(facets).map(
      (facetName) => {
        const facet = facets[facetName];
        facet.geojson.features.map(
          feature => {
            const facetValue = feature.properties[facet.nameAttribute];
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
                  const geojson = JSON.parse(jsonText);

                  geojson.features.map(
                    (value) => {
                      value.properties[facet.nameAttribute] = facet.nameProcessor(
                        value.properties[facet.nameAttribute]
                      );
                    }
                  );

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
                      const facetValue = feature.properties[facet.nameAttribute];

                      let tileRenderColor = DEFAULT_BLUE;

                      initialFacetData[facet.name].values[facetValue] = {
                        selected: false,
                        tileRenderColor: tileRenderColor
                      }
                    }
                  )
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
    const facetName = e.target.dataset.facetname;

    const newFacets = cloneDeep(facets);
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
  } 

  const facetItemClicker = (e) => {
    const facetName = e.target.dataset.facetname;
    const facetValue = e.target.dataset.facetvalue;

    const newFacets = cloneDeep(facets);
    newFacets[facetName].values[facetValue].selected = e.target.checked;

    if (e.target.checked) {
      newFacets[facetName].visible = true;
    }

    if (coloration.facet && coloration.attribute) {
      setColoration(coloration);
    }

    updateFacets(newFacets);
  }

  const layers = Object.keys(facets)
    .map(
      (key) => facets[key]
    );

  const facetLayers = 
    layers.filter(
      (layer) => layer.visible
    ).map(
      (layer) => {
        return (
          <GeoJSON
            key={layer.name + (cacheBuster++)}
            filter={(segment, index) => {
              const facetValue = segment.properties[layer.nameAttribute];

              return facets[layer.name].values[facetValue].selected;
            }}
            onEachFeature={(feature, leafletLayer) => {
                const popupOptions = {
                    minWidth: 100,
                    maxWidth: 250,
                    className: "popup-classname"
                };
      
                leafletLayer.bindPopup(()=>{
                  const clickedItemName = feature.properties[layer.nameAttribute];
                  let tooltipContents = '<b>' + layer.name + '</b>: ' + clickedItemName + '<br />';
                 
                  if (layer.attributesToDisplay) {
                    const theseAttributes = layer.attributes[clickedItemName];
                    layer.attributesToDisplay.map(
                      (attr) => {
                        const attributesForSelected = layer.attributes[clickedItemName];
                        if (attributesForSelected === undefined) {
                          return 'Unlinked Data - ???';
                        }

                        const attributeValue = attributesForSelected[attr];
                        tooltipContents += '<b>' + attr + '</b>: ' + attributeValue + '<br />';
                      }
                    );
                  }
                  return tooltipContents || '';
                }, popupOptions);
            }}
            style={
              (reference) => {
                const facetName = layer.name;
                const facetValue = reference.properties[layer.nameAttribute];

                const colorFromFacet = facets[facetName].values[facetValue].tileRenderColor;
                const defaultColor = DEFAULT_BLUE;
                
                return {
                  color: colorFromFacet || defaultColor
                };
              }
            }
            data={layer.geojson} />
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

export const Head = () => <title>Home Page</title>
