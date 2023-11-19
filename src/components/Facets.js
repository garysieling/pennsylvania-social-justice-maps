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

const Facets = ({layers, title, facets, facetClicker, facetItemClicker, getValueFromRow, filters}) => {
    const [showMore, updateShowMore] = React.useState({});

    const toggleShowMore = (facetName) => {
        const newShowMore = cloneDeep(showMore);
        newShowMore[facetName] = true;

        updateShowMore(newShowMore);
    }

    return (
        <>
        <h3 style={headingStyles}>{title}</h3>
        <ul style={listStyles}>{
            layers.filter(
              (facet) => {
                if (!filters) {
                  return true;
                }

                for (let key in filters) {
                  if (key === facet.name) {
                    return true;
                  }
                }

                return false;
              }
            ).map(
              (facet) => {
                            
                const features = facet.geojson.features.filter(
                  (feature, index) => {
                    if (!filters) {
                      return true;
                    }

                    let values = [];
                    for (let key in filters) {
                      if (key === facet.name) {
                        values = filters[key];
                      }
                    }

                    const facetValue = feature.properties._name;

                    return values.indexOf(facetValue) >= 0;
                  }
                );

                return (
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
                        features.filter(
                          (feature, index) => 
                            index < showMoreCount ||
                              features.length <= showAllCount ||
                              showMore[facet.name]
                        ).map(
                          (feature, index) => {
                            const facetValue = feature.properties._name;
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
                        features.length > showAllCount &&
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
                  );
                }
              )
            }</ul>
        </>
    )
};

export default Facets;