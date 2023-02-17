import React from 'react';
import { 
  Label,
  Select
} from "theme-ui";

const categoricalColorSchems = [
  {name: 'schemeTableau10', label: 'Tableau'}
]

const rangeColorSchemes = [
  { name: 'interpolateSpectral', label: 'Spectral'},
  { name: 'interpolateRdGy', label: 'Red<->Gray'},
  { name: 'interpolateRdBu', label: 'Red<->Blue'},
  { name: 'interpolatePuOr', label: 'Purple<->Brown'},
  { name: 'interpolateReds', label: 'Red'},
  { name: 'interpolateTurbo', label: 'Turbo'},
  { name: 'interpolateGreens', label: 'Green'},
  { name: 'interpolatePlasma', label: 'Plasma'},
  { name: 'interpolateBlues', label: 'Blue'},
]

const RenderingControls = ({layers, facets, setColoration}) => {  
    const [selectedFacet, selectFacet] = React.useState('');
    const [selectedAttribute, selectAttribute] = React.useState('');
    const [selectedRangeColorScheme, selectRangeColorScheme] = React.useState('Plasma');

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

            setColoration({
              facet: e.target.value, 
              attribute: selectedAttribute,
              rangeColorScheme: selectedRangeColorScheme
            }, facets);
          }}>
          <option key={-1}>N/A</option>
          {visibleLayers}
        </Select>
        <Label>Attribute: </Label>
        <Select 
          value={selectedAttribute}
          onChange={(e) => {
            selectAttribute(e.target.value);
            setColoration({
              facet: selectedFacet, 
              attribute: e.target.value,
              rangeColorScheme: selectedRangeColorScheme
            }, facets);
          }}>
          <option key={-1}>N/A</option>
          {attributes.map(
            (attribute, i) => 
              <option key={i}>{attribute}</option>
          )}
        </Select><Label>Color Scheme: </Label>
        <Select 
          value={selectedRangeColorScheme}
          onChange={(e) => {
            selectRangeColorScheme(e.target.value);
            setColoration({
              facet: selectedFacet, 
              attribute: selectedAttribute,
              rangeColorScheme: e.target.value
            }, facets)
          }}>
          {rangeColorSchemes.map(
            ({name, label}, i) => 
              <option key={i} value={name}>{label}</option>
          )}
        </Select>
      </div>
    );
  }
  
  
  export default RenderingControls;