import * as React from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import hash from 'object-hash';

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
  {
    text: "How to Guides",
    url: "https://www.gatsbyjs.com/docs/how-to/",
    description:
      "Practical step-by-step guides to help you achieve a specific goal. Most useful when you're trying to get something done.",
    color: "#1099A8",
  },
  {
    text: "Reference Guides",
    url: "https://www.gatsbyjs.com/docs/reference/",
    description:
      "Nitty-gritty technical descriptions of how Gatsby works. Most useful when you need detailed information about Gatsby's APIs.",
    color: "#BC027F",
  },
  {
    text: "Conceptual Guides",
    url: "https://www.gatsbyjs.com/docs/conceptual/",
    description:
      "Big-picture explanations of higher-level Gatsby concepts. Most useful for building understanding of a particular topic.",
    color: "#0D96F2",
  },
  {
    text: "Build and Host",
    url: "https://www.gatsbyjs.com/cloud",
    badge: true,
    description:
      "Now you’re ready to show the world! Give your Gatsby site superpowers: Build and host on Gatsby Cloud. Get started for free!",
    color: "#663399",
  },
]

const IndexPage = () => {

  const [countyBoundaries, setCountyBoundaryJson] = React.useState(null);

  React.useEffect(() => {
    fetch(
      "/static/Montgomery_County_Boundary.geojson"
    )
      .then(res => res.text())
      .then(jsonText => {
        const countyBoundaries = JSON.parse(jsonText);
        setCountyBoundaryJson(countyBoundaries);
        window.countyBoundaries = countyBoundaries;
      });
  }, []);

  const [municipalBoundaries, setMunicipalBoundaryJson] = React.useState(null);

  React.useEffect(() => {
    fetch(
      "/static/Montgomery_County_Municipal_Boundaries.geojson"
    )
      .then(res => res.text())
      .then(jsonText => {
        const municipalBoundaries = JSON.parse(jsonText);
        //debugger;
        setMunicipalBoundaryJson(municipalBoundaries);
        window.municipalBoundaries = municipalBoundaries;
      });
  }, []);

  return (
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
        { countyBoundaries &&
          <GeoJSON
            key={/*hash(municipalBoundaries)*/'bbb'}
            data={countyBoundaries} />
        }

        { municipalBoundaries &&
          <GeoJSON
            key={/*hash(municipalBoundaries)*/'aaa'}
            data={municipalBoundaries} />
        }

      </MapContainer>
    </main>
  )
}

export default IndexPage

export const Head = () => <title>Home Page</title>
