import * as React from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import hash from 'object-hash';
import { Checkbox, Grid, Label } from "theme-ui";

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
  marginBottom: 96,
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

const facets = [
  {
    title: 'County',
    key: 1,
    loaded: false,
    source: '/static/Montgomery_County_Boundary.geojson',
    nameAttribute: 'Name',
    whereObtained: 'Montgomery County Public Datasets'
  },
  {
    title: 'ZCTA5 2019',
    key: 2,
    loaded: false,
    source: '/static/montco_zcta5.geojson',
    nameAttribute: 'ZCTA5CE10',
    // https://www.zillow.com/browse/homes/pa/montgomery-county/
    whereObtained: 'Converted from https://www2.census.gov/geo/tiger/TIGER2019/ZCTA5/'
  },
  /*{
    title: 'Municipalities',
    key: 3,
    loaded: false,
    source: '/static/Montgomery_County_Municipal_Boundaries.geojson',
    nameAttribute: 'Name'
  },
  {
    title: 'School Districts',
    key: 4,
    loaded: false,
    source: '/static/Montgomery_County_School_Districts.geojson',
    nameAttribute: 'Name'
  },
  {
    title: 'Police Departments',
    key: 5,
    loaded: false,
    source: '/static/Montgomery_County_Police_Districts.geojson',
    nameAttribute: 'Name'
  },*/
  /*{
    // TODO find a shapefile of the 2022 magesterial districts
    title: 'Courts',
    key: 5,
    loaded: false,
    source: '/static/Montgomery_County_Police_Districts.geojson',
    nameAttribute: 'Name'
  },*/
  /*{
    // TODO what is this for?
    title: 'JPO Districts',
    key: 7,
    loaded: false,
    source: '/static/Montgomery_County_-_JPO_Districts.geojson',
    nameAttribute: 'Name'
  }*/
  /*
    TODO legislative districts
  */
]

const IndexPage = () => {
  const [boundaries, addBoundary] = React.useState([]);
  const [facetsUnselected, selectFacet] = React.useState({});
  const [itemsUnselected, selectItem] = React.useState({});

  const facetClicker = (e) => {
    const key = e.target.dataset.key;
    console.log('facetClicker', key)

    const newSelection = {...facetsUnselected};
    newSelection[key] = !newSelection[key];
    selectFacet(newSelection);
  } 

  const facetItemClicker = (e) => {
    const key = e.target.dataset.key;
    const newItems = {...itemsUnselected};
    newItems[key] = !newItems[key];
    selectItem(newItems);
  }

  console.log('rendering...');

  React.useEffect(() => {
    facets.filter(
      (facet) => !facet.loaded
    ).map(
      (facet) => {
          fetch(facet.source)
            .then(res => res.text())
            .then(jsonText => {
              const boundaryJson = JSON.parse(jsonText);
              boundaryJson.key = facet.key;
              facet.boundaries = boundaryJson;
              facet.loaded = true;

              addBoundary(
                arr => [...arr, boundaryJson]
              );
            });
        });
      }
    );

    console.log('boundaries', boundaries);
  const facetLayers = 
      boundaries.filter(
        (boundary) => !facetsUnselected[boundary.key]
      ).map(
        (json) => {
          // TODO cache the hash
          return (
            <GeoJSON
              key={hash(json)}
              data={json} />
          );
        }
      );

  return (
    <Grid
      gap={2} 
      columns={[2, '0.5fr 3fr']}>
      <aside>
        <h2 style={headingStyles}>Layers</h2>
        <ul style={listStyles}>
          {
            facets.map(
              (facet) =>
                <li key={facet.key} style={listItemStyles}>
                  <Label>
                    <Checkbox 
                      checked={!facetsUnselected[facet.key]}
                      data-key={facet.key}
                      key={facet.key}
                      onClick={facetClicker}
                    />
                    <b>{facet.title}</b>
                  </Label>
                  <ul style={listStyles}>
                    {
                      // TODO facet control with TOP N
                      facet.boundaries &&
                      facet.boundaries.features.map(
                        (feature) => {
                          const key = facet.key + '_' + feature.properties[facet.nameAttribute];
                          return (
                            <Label key={key} >
                              <Checkbox 
                                  data-key={key}
                                  checked={!itemsUnselected[key]}
                                  onClick={facetItemClicker} 
                              />
                              {feature.properties[facet.nameAttribute]}
                            </Label>
                          )
                        }
                      )
                    }
                  </ul>
                </li>
            )
          }
        </ul>
      </aside>
      <main style={pageStyles}>
        <h1 style={headingStyles}>
          Map
        </h1>
        
        <MapContainer style={{ height: '400px' }} center={position} zoom={zoom} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position}>
            <Popup>
              A pretty CSS3 popup. <br /> Easily customizable.
            </Popup>
          </Marker>
          { facetLayers }
        </MapContainer>
      </main>
    </Grid>
  )
}

export default IndexPage

export const Head = () => <title>Home Page</title>
