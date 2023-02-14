import React from 'react';

import { 
    Checkbox, 
    Label
} from "theme-ui";

import { cloneDeep } from "lodash";

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

const showMoreCount = 5;
const showAllCount = showMoreCount + 3;

const Facets = ({layers, facets, facetClicker, facetItemClicker}) => {
    const [showMore, updateShowMore] = React.useState({});

    const toggleShowMore = (facetName) => {
        const newShowMore = cloneDeep(showMore);
        newShowMore[facetName] = true;

        updateShowMore(newShowMore);
    }

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
                      facet.geojson.features.sort(
                        (featureA, featureB) => {
                          let nameA = featureA.properties[facet.nameAttribute];
                          let nameB = featureB.properties[facet.nameAttribute];

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
                      ).filter(
                        (value, index) => 
                          index < showMoreCount ||
                            facet.geojson.features.length <= showAllCount ||
                            showMore[facet.name]
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
                      !showMore[facet.name] &&
                      (
                      <li key='showMore'>
                          <a href="#" onClick={() => toggleShowMore(facet.name)}>
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