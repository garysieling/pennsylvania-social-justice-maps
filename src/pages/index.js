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

import { schemeTableau10 } from 'd3-scale-chromatic';

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
    attributeSource: '/static/police/data.csv',
    attributeSourceKey: 'Location',
    attributeNumericAttributes: [
      'Full Time Civilians',
      'Full Time Sworn Officers',
      'Part Time Civilians',
      'Part Time Sworn Officers'
    ],
    attributesToDisplay: [
      'Chief Name',
      'Last Update',
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
    description: 'Demo',
    cardinalityType: 'categorical',
    categoryVariable: 'name'
  }
];

// TODO ability to switch through "stories"
// TODO ability to have range color schemes
// TODO ability to have sequential color schemas
// TODO more than the tableau color scheme (to override and make it look better)
// TODO more contrast between the map and the color scheme 
// TODO overlay description for the whole story
// TODO overlay description for each segment of the story
// TODO real data

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
  () => false
).map(
  (story) => {
    const categoricalColors = {};
    const colorScheme = schemeTableau10;
    const maxColor = colorScheme.length;

    Papa.parse(story.source, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function(results, file) {
        story.data = results.data.map(
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
            if (categoricalColors[categoricalValue]) {
              record.categoricalColor = categoricalColors[categoricalValue];
            } else {
              if (Object.keys(categoricalColors) >= maxColor) {
                throw 'Only 10 colors available'
              }
  
              const colorIndex = Object.keys(categoricalColors).length;
              const color = colorScheme[colorIndex];

              categoricalColors[categoricalValue] = color;

              record.categoricalColor = color;
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
// TODO hover text for additional data about a place
// TODO Stories
    // Spider chart (a graph)
    // Add real data for certainty of the one issue
    // Add real data to show how some things relate

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

const RenderingEditor = ({layers, facets}) => {
  const [selectedFacet, selectFacet] = React.useState({});
  const [selectedAttribute, selectAttribute] = React.useState({});
  const [attributeType, selectAttributeType] = React.useState({});

  if (selectAttribute) {
    console.log(selectAttribute);
  }

  let attributes = [];

  if (facets[selectedFacet]) {
    attributes = facets[selectedFacet].attributesToDisplay || [];
  }

  return (
    <div>
      <Label>Facet: </Label>
      <Select 
        onChange={(e) => {
          selectFacet(e.target.value);
        }}>
        <option key={-1}>N/A</option>
        {layers.map(
          (facet, i) => 
            <option key={i}>{facet.name}</option>
        )}
      </Select>
      <Label>Attribute: </Label>
      <Select 
        onChange={(e) => {
          selectAttribute(e.target.value);
        }}>
        <option key={-1}>N/A</option>
        {attributes.map(
          (attribute, i) => 
            <option key={i}>{attribute}</option>
        )}
      </Select>
      <Label>Type: </Label>
      <Select
        onChange={(e) => {
          selectAttributeType(e.target.value);
        }}>
        <option>
          Categorical
        </option>
        <option>
          Ordered
        </option>
        <option>
          Diverging
        </option>
      </Select>
    </div>
  );
}


const StoryPicker = (props) => {
  return (
    <div>
      Story
      <Select>
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
  //const [boundaries, addBoundary] = React.useState([]);
  const [facets, updateFacets] = React.useState({});
  //const [facetsSelected, selectFacet] = React.useState({});
  //const [itemsSelected, selectItem] = React.useState({});
  //const [showMoreList, updateShowMore] = React.useState({});

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

                      const selectedFacetFromStory = stories.filter(
                          (story) => story.loaded
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

                      let categoricalColor = 'blue';
                      if (selectedFacetFromStory.length > 0) {
                        if (!!selectedFacetFromStory[0].categoricalColor) {
                          categoricalColor = selectedFacetFromStory[0].categoricalColor;
                        }
                      }

                      initialFacetData[facet.name].values[facetValue] = {
                        selected: facetValueChecked,
                        categoricalColor: categoricalColor
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
        const limeOptions = { color: 'lime' }

        // layer.features.map
        //layer.geojson.features[0].geometry
        /*return layer.geojson.features.filter(
          (segment, index) => {
            const facetValue = segment.properties[layer.nameAttribute];

            return facets[layer.name].values[facetValue].selected;
          }
        ).map(
          ({geometry, properties}, i) => {
            const facetName = layer.name;
            const facetValue = properties[layer.nameAttribute];
            const styleOptions = {
              color: facets[facetName].values[facetValue].categoricalColor || 'blue'
            }

            if (geometry.type === 'Polygon') {
              debugger;
              return (
                <Polygon pathOptions={styleOptions} positions={geometry.coordinates[0]} key={i}>
                  <Popup>
                    {JSON.stringify(properties)}
                  </Popup>
                </Polygon>
              );
            } else {
              debugger;
              return (
                <Polyline pathOptions={styleOptions} positions={geometry.coordinates} key={i}>
                  <Popup>
                    {JSON.stringify(properties)}
                  </Popup>
                </Polyline>
              );
            }
            
          });*/

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
                return {
                  color: facets[facetName].values[facetValue].categoricalColor || 'blue'
                }
              }
            }
            data={layer.geojson} />
        );
      }
    );
  console.timeEnd("figuring out layers");

  console.timeEnd("render");

  const markers = stories.filter(
    (story) => story.loaded
  ).flatMap(
    (story, storyIndex) =>
      story.data.flatMap(
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
                pathOptions={{ fillColor: record.categoricalColor || 'blue' }} 
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
          <StoryPicker selected={'Police'} />
          <RenderingEditor layers={layers} facets={facets} />
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
