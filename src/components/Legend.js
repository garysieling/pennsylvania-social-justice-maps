import React from 'react';

const Legend = ({data}) => {
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

      const attributeNumericFormatter = data.attributeNumericFormatter;
      if (attributeNumericFormatter) {
        min = attributeNumericFormatter(min);
        max = attributeNumericFormatter(max);

        rangeMin = attributeNumericFormatter(rangeMin);
        rangeMax = attributeNumericFormatter(rangeMax);
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

  export default Legend;