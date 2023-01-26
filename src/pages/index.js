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
  interpolateSpectral,
  interpolateRdGy,
  interpolateRdBu,
  interpolatePuOr,
  interpolateReds,
  interpolateTurbo,
  interpolateGreens,
  interpolatePlasma,
  interpolateBlues
} from 'd3-scale-chromatic';

const position = [40.1546, -75.2216];
const zoom = 12;

const pageStyles = {
  color: "#232129",
  padding: 96,
  fontFamily: "-apple-system, Roboto, sans-serif, serif",
}
const headingStyles = {
  marginTop: 0,
  marginBottom: 64,
  maxWidth: 320,
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
  fontSize: 24,
  maxWidth: 560,
  marginBottom: 30,
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
];


let stories = [
  {
    name: 'N/A',
    key: '0',
    loaded: true,
    description: 'N/A',
    data: []
  },
  {
    name: 'Stories 1',
    key: '1',
    loaded: false,
    source: '/static/points.csv',
    description: 'Demo'
  },
  {
    name: 'Ambler NAACP - Police Meeting',
    key: '2',
    loaded: false,
    source: '/static/ambler naacp - meeting.csv'
  },
  {
    name: 'Ambler NAACP - Police Memorandum',
    key: '2',
    loaded: false,
    source: '/static/ambler naacp - memorandum.csv'
  }
];

// TODO ability to switch through "stories"
// TODO ability to have range color schemes
// TODO ability to have sequential color schemas
// TODO overlay description for the whole story
// TODO overlay description for each segment of the story

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

// hide for now
stories.filter(
  (story) => !!story.source
).map(
  (story) => {
    const tileRenderColors = {};
    const colorScheme = tileRenderColorScheme;
    const maxColor = colorScheme.length;

    Papa.parse(story.source, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function(results, file) {
        //const firstRow = Object.values(results[0]);

        //story.description = firstRow[0];
        //story.link = firstRow[1];

        story.data = results.data.filter(
          // first row is the description
          (value, i) => i > 0
        ).map(
          (record) => {
            if (record.lat) {
              record.lat = parseFloat(record.lat.trim())
            }

            if (record.lng) {
              record.lng = parseFloat(record.lng.trim())
            }

            if (record.certainty) {
              record.certainty = parseInt(record.certainty);
            }

            const categoricalValue = record[story.categoryVariable];
            if (tileRenderColors[categoricalValue]) {
              record.tileRenderColor = tileRenderColors[categoricalValue];
            } else {
              if (Object.keys(tileRenderColors) >= maxColor) {
                throw 'Only 10 colors available'
              }
  
              const colorIndex = Object.keys(tileRenderColors).length;
              const color = colorScheme[colorIndex];

              tileRenderColors[categoricalValue] = color;

              record.tileRenderColor = color;
            }

            return record;
          }
        )
        story.loaded = true;

        console.log(stories);
      }
    });
  }
);

let firstLoad = true;

// TODO React Router
// TODO Color coding for intensity
// TODO Stories
    // Spider chart (a graph)
    // Add real data for certainty of the one issue
    // Add real data to show how some things relate

// A mechanism to turn a list of addresses into an anonmyized dataset

// A mechanism to "join" two+ areas into one unit

// A mechanism to compute the population of an area

// TODO libraries / historical society

// "Stories"
  // List of police depts/chiefs that signed on w/ NAACP
  // List of police depts implicated by the earlier discussions
  // Link Zion vs people
  // List of people i've heard from vs. certainty
  // BMC group

// TODO naacp chapters


let cacheBuster = 0;
const showMoreCount = 5;
const showAllCount = showMoreCount + 3;

const RenderingEditor = ({layers, facets, setColoration}) => {  
  const [selectedFacet, selectFacet] = React.useState({});
  const [selectedAttribute, selectAttribute] = React.useState({});

  if (selectAttribute) {
    console.log(selectAttribute);
  }

  let attributes = [];

  if (facets[selectedFacet]) {
    attributes = Object.keys(facets[selectedFacet].attributeCategoryTypes || {}) || [];
  }

  const visibleLayers = 
    layers.filter(
      ({visible}) => visible
    ).map(
      (facet, i) => 
        <option key={i}>{facet.name}</option>
    );

  if (visibleLayers.length === 0) {
    return <div key="colorPicker"></div>
  }

  return (
    <div key="colorPicker">
      <Label>Coloration: </Label>
      <Select 
        onChange={(e) => {
          selectFacet(e.target.value);
        }}>
        <option key={-1}>N/A</option>
        {visibleLayers}
      </Select>
      <Label>Attribute: </Label>
      <Select 
        onChange={(e) => {
          setColoration({
            facet: selectedFacet, 
            attribute: e.target.value
          });
        }}>
        <option key={-1}>N/A</option>
        {attributes.map(
          (attribute, i) => 
            <option key={i}>{attribute}</option>
        )}
      </Select>
    </div>
  );
}


const StoryPicker = ({onSelectStory}) => {
  return (
    <div>
      Story:
      <Select onChange={(e) => onSelectStory(e)}>
        {
          stories.map(
            (story) => {
              return (
                <option>
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

const IndexPage = () => {
  const [facets, updateFacets] = React.useState({});
  const [story, selectStory] = React.useState('N/A');
  const [coloration, setColorStrategy] = React.useState({});

  function onSelectStory(e) {
    console.log('selecting story');
    const storyName = e.target.value;

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

            let tileRenderColor = 'blue';
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
    
    console.log('refreshing');
    selectStory(storyName);
    updateFacets(facets);
  }

  function setColoration({facet, attribute}) {
    const categoryType = facets[facet].attributeCategoryTypes[attribute];
    if (!facet || !attribute || !categoryType) {
      // clear all colors
      Object.keys(facets[facet].values).map(
        (value) => {
          delete facets[facet].values[value].tileRenderColor;
        }
      );

      updateFacets(facets);
    } else if (categoryType === 'Categorical') {
      const colorScheme = tileRenderColorScheme;
      const maxColor = colorScheme.length;
      const tileRenderColors = {};

      Object.keys(facets[facet].values).map(
        (facetValue) => {
          const record = facets[facet].values[facetValue];

          const categoricalValue = (facets[facet].attributes[facetValue] || {})[attribute] || '';
          if (tileRenderColors[categoricalValue]) {
            record.tileRenderColor = tileRenderColors[categoricalValue];
          } else {
            const colorIndex = Object.keys(tileRenderColors).length;
            const color = colorScheme[colorIndex % maxColor];
  
            tileRenderColors[categoricalValue] = color;
  
            record.tileRenderColor = color;
          }
        });

        updateFacets(facets);
    } else if (
      categoryType === 'Ordered' ||
      categoryType === 'Diverging') {
      let min = null;
      let max = null;

      Object.keys(facets[facet].values).map(
        (facetValue) => {
          const value = (facets[facet].attributes[facetValue] || {})[attribute];
          if (value) {
            if (min == null) {
              min = value;
            }

            if (max == null) {
              max = value;
            }

            if (value > max) { 
              max = value;
            }

            if (value < min) {
              min = value;
            }
          }
        });

      const range = max - min;
      const colorFn = interpolatePlasma;
     /* ,
  interpolateRdBu,
  interpolatePuOr,
  interpolateReds,
  interpolateTurbo,
  interpolateGreens,
  interpolateBluesU*/

    Object.keys(facets[facet].values).map(
      (facetValue) => {
        const record = facets[facet].values[facetValue];

        const value = (facets[facet].attributes[facetValue] || {})[attribute];
        record.tileRenderColor = colorFn(1.0 * value / range)
      });
    }

    setColorStrategy({facet, attribute, categoryType});
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

                      let tileRenderColor = 'blue';

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

  const showMore = (facetName) => {
    const newFacets = cloneDeep(facets);
    newFacets[facetName].showMore = true;

    updateFacets(newFacets);
  }

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

    console.log(newFacets);
    updateFacets(newFacets);
  }

  console.time("figuring out layers");

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
                const defaultColor = 'blue';
                
                return {
                  color: colorFromFacet || defaultColor
                };
              }
            }
            data={layer.geojson} />
        );
      }
    );
  console.timeEnd("figuring out layers");

  console.timeEnd("render");

  const markers = stories.filter(
    (story) => story.selected
  ).flatMap(
    (story, storyIndex) =>
      story.data.filter(
        (record) => record.lat && record.lng
      ).flatMap(
        (record, recordIndex) => {
          const results = [(
            <Marker position={[record.lat, record.lng]} key={storyIndex + '-' + recordIndex}>
              <Popup>
                {story.description + ' ' + record.name}
              </Popup>
            </Marker>
          )];

          if (record.certainty) {
            results.push((
              <Circle 
                center={[record.lat, record.lng]} 
                pathOptions={{ fillColor: record.tileRenderColor || 'blue' }} 
                radius={100 * record.certainty} />
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
        <h2 style={headingStyles}>Layers</h2>
        <ul style={listStyles}>
          {
            layers.map(
              (facet) => (
                <li key={facet.key} style={listItemStyles}>
                  <Label>
                    <Checkbox 
                      data-facetname={facet.name}
                      checked={!!facets[facet.name].visible}
                      key={facet.key}
                      onChange={facetClicker}
                    />
                    <b>{facet.name}</b>

                    
                  </Label>
                  <ul style={listStyles}>
                    {
                      facet.geojson.features.filter(
                        (value, index) => 
                          index < showMoreCount ||
                            facet.geojson.features.length <= showAllCount ||
                            facets[facet.name].showMore
                      ).map(
                        (feature, index) => {
                          const facetValue = feature.properties[facet.nameAttribute];
                          return (
                            <Label key={index} >
                              <Checkbox 
                                  data-facetname={facet.name}
                                  data-facetvalue={facetValue}
                                  key={facet.key + ' ' + index}
                                  checked={facet.values[facetValue].selected}
                                  onChange={facetItemClicker} 
                              />
                              {facetValue}
                            </Label>
                          )
                        }
                      )
                    }
                    {
                      facet.geojson.features.length > showAllCount &&
                      !facets[facet.name].showMore &&
                      (
                      <li key='showMore'>
                          <a href="#" onClick={() => showMore(facet.name)}>
                            Show More
                          </a>
                        </li>
                      )
                    }
                  </ul>
                </li>
              )
            )
          }
        </ul>
      </aside>
      <main style={pageStyles}>
        <div>
          <StoryPicker onSelectStory={onSelectStory} />
          <RenderingEditor 
            layers={layers} 
            facets={facets} 
            setColoration={setColoration}
          />
        </div>
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

export default IndexPage

export const Head = () => <title>Home Page</title>
