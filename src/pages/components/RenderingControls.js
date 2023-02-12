import React from 'react';
import { 
  Label,
  Select
} from "theme-ui";

const RenderingControls = ({layers, facets, setColoration}) => {  
    const [selectedFacet, selectFacet] = React.useState({});
    const [selectedAttribute, selectAttribute] = React.useState({});
  
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
          value={selectedFacet}
          onChange={(e) => {
            selectFacet(e.target.value);
          }}>
          <option key={-1}>N/A</option>
          {visibleLayers}
        </Select>
        <Label>Attribute: </Label>
        <Select 
          value={selectedAttribute}
          onChange={(e) => {
            setColoration({
              facet: selectedFacet, 
              attribute: e.target.value
            }, facets);
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
  
  
  export default RenderingControls;