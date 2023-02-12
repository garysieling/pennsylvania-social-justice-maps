import React from 'react';

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

const headingStyles = {
    marginTop: 0,
    marginBottom: 64,
    maxWidth: 320
};

const listStyles = {
    marginBottom: 10,
    paddingLeft: 0
};
  
const listItemStyles = {
    fontWeight: 300,
    fontSize: 16,
    maxWidth: 560,
    marginBottom: 10,
    listStyleType: "none"
};

const Facets = ({layers, facets, facetClicker, showMoreCount, showAllCount, facetItemClicker, showMore}) => {
    return (
        <>
        <h3 style={headingStyles}>Facets</h3>
        <ul style={listStyles}>{
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
            }</ul>
        </>
    )
};

export default Facets;