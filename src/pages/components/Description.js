import React from 'react';

const Description = ({description}) => {
    if (!description) {
      return <div key="description" />;
    }
  
    return (
      <div key="description" style={{paddingLeft: '10px'}}>
        <h3>Description</h3>
            <div dangerouslySetInnerHTML={{__html: description}} />
      </div>
    );
  }

export default Description;