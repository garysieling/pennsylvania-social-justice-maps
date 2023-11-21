import React from 'react';

import { cloneDeep } from "lodash";

import { 
  schemeTableau10 as tileRenderColorScheme,
} from 'd3-scale-chromatic';

const DEFAULT_BLUE = '#4E79A7';

const DEFAULT_LEGEND = {
  type: 'Categorical',
  attributes: {
    'All Values': DEFAULT_BLUE
  }
};

export const numberFormatter = (v) => {
  if (v !== null && v !== undefined) {
    return v.toLocaleString()
  } else {
    return v;
  }
}

export const percentFormatter = (v) => {
  if (v !== null && v !== undefined) {
    return v.toLocaleString(null, {minimumFractionDigits: 0 }) + '%'
  } else {
    return v;
  }
}

export const dollarFormatter = (v) => {
  if (v !== null && v !== undefined) {
    return '$' + v.toLocaleString(null, {minimumFractionDigits: 2 })
  } else {
    return v;
  }
}



export function recomputeColoration({facet, attribute}, colorFn, facets) {  
  let legend = null;

  if (!facet || !attribute) {
    legend = cloneDeep(DEFAULT_LEGEND);

    // clear all colors - todo - not working
    facets[facet].geojson.features.map(
      (feature) => {
        feature.properties.tileRenderColor = DEFAULT_BLUE;
      })
  } else {
    legend = {};
    legend.attribute = attribute;
    legend.attributes = {};
    legend.type = facets[facet].attributeCategoryTypes[attribute];
    legend.colorFn = colorFn;

    if (legend.type === 'Categorical') {
      const colorScheme = tileRenderColorScheme;
      const maxColor = colorScheme.length;

      facets[facet].geojson.features.map(
        (feature) => {
          const categoricalValue = feature.properties[attribute] || '';
          if (!legend.attributes[categoricalValue]) {
            legend.attributes[categoricalValue] = {
              color: ''
            };
          }

          legend.attributes[categoricalValue].count =
            (legend.attributes[categoricalValue].count || 0) + 1
        });

      Object.keys(legend.attributes).sort(
        (a, b) => {
          if (a === b) {
            return 0;
          }

          if (a === '') {
            return 1;
          }

          if (b === '') {
            return -1;
          }

          if (a > b) {
            return 1;
          } else {
            return -1;
          }
        }
      ).map(
        (key, colorIndex) => {
          const color = colorScheme[colorIndex % maxColor];

          legend.attributes[key].color = color;
        });

        facets[facet].geojson.features.map(
          (feature) => {
            const categoricalValue = feature.properties[attribute] || '';

            feature.properties.tileRenderColor = legend.attributes[categoricalValue].color;
            legend.attributes[categoricalValue].count++;
        });

    } else if (
      legend.type === 'Ordered' ||
      legend.type === 'Diverging') {
      legend.min = null;
      legend.max = null;
      if (attribute === '_population') {
        legend.attributeNumericFormatter = numberFormatter;
      }

      
      facets[facet].geojson.features.map(
        (feature) => {
          const value = feature.properties[attribute];
          if (value !== null && value !== undefined) {
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

      legend.colorFn = colorFn;

      legend.rangeMin = legend.min;
      legend.rangeMax = legend.max;

      if (legend.min < 0 && legend.max > 0) {
        legend.rangeMax = Math.max(Math.abs(legend.min), legend.max);
        legend.rangeMin = -1 * legend.rangeMax;
      } else {
        legend.rangeMin = 0;
      }

      const range = legend.rangeMax - legend.rangeMin;
      
      facets[facet].geojson.features.map(
        (feature) => {
          const value = feature.properties[attribute];
          debugger;
          feature.properties.tileRenderColor = legend.colorFn(1.0 * value / range)
        });
    }
  }

  return  {
    facets,
    legend
  };
}

export const Legend = ({data}) => {
    if (!data || !data.attributes) {
      return <div key="legend" />;
    }

    const sortedKeys = Object.keys(data.attributes).sort();
  
    let legendData = null;
  
    if (data.type === 'Categorical') {
      legendData = sortedKeys.map(
        (key, i) => (
          <div key={i}>
            <div style={{
              backgroundColor: data.attributes[key].color,
              width: '14px',
              height: '14px',
              float: 'left',
              marginRight: '3px'
            }}/> {key || 'Unknown'}
            {' '}({data.attributes[key].count})
          </div>
        )
      );
    } else {
      let min = data.min;
      let max = data.max;
      let rangeMin = data.rangeMin;
      let rangeMax = data.rangeMax;

      if (data.attributeNumericFormatter) {
        min = data.attributeNumericFormatter(min);
        max = data.attributeNumericFormatter(max);

        rangeMin = data.attributeNumericFormatter(rangeMin);
        rangeMax = data.attributeNumericFormatter(rangeMax);
      }

      legendData = (
        <div>
          <b>Range:</b> {rangeMin} - {rangeMax} (seen {min} - {max})
          <div style={{
            height: '20px',
            width: '100%',
            background: 'linear-gradient(0.25turn, ' +
               data.colorFn(0) + ',' + 
               data.colorFn(0.1) + ',' + 
               data.colorFn(0.2) + ',' + 
               data.colorFn(0.3) + ',' + 
               data.colorFn(0.4) + ',' + 
               data.colorFn(0.5) + ',' + 
               data.colorFn(0.6) + ',' + 
               data.colorFn(0.7) + ',' + 
               data.colorFn(0.8) + ',' + 
               data.colorFn(0.9) + ',' + 
               data.colorFn(1) + ')'
          }} />
        </div>
      );
    }
  
    return (
      <div key="legend" style={{paddingLeft: '10px'}}>
        <h3>Legend</h3>
        <b>Attribute:</b> {data.attribute}
        {legendData}
      </div>
    );
  }