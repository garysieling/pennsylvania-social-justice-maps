import React from 'react';

import {  
    Grid, 
    Button
  } from "theme-ui";
  
import {
    buttonStyle,
    globalExists,
    filterMap
} from '../shared/app'


const CopyLink = ({facets, coloration}) => {
    function copyLink() {
        const changes = {
            facets: facets,
            coloration: coloration
        }
        
        const result = {};
        Object.keys(changes.facets).map( 
            (key) => changes.facets[key]
        ).filter( 
            ({visible}) => visible
        ).map(
            (record) => {
            return { 
                key: record.key, 
                values: Object.keys(filterMap(
                record.values, 
                ({selected}) => selected 
                ))
            }
            }
        ).filter( 
            ({values}) => Object.keys(values).length > 0
        ).forEach(
            ({key, values}) => {
            result[key] = values;
            }
        )
        
        if (globalExists('window')) {
            let baseUrl = window.location.href;
            if (baseUrl.indexOf('?') > 0) {
            baseUrl = baseUrl.split('?')[0];
            }
        
            navigator.clipboard.writeText(baseUrl + '?' + JSON.stringify(result));
        }
        
        return result;
    }
    return (
        <Button 
            mr={2}
            style={buttonStyle}
            onClick={copyLink}>
              Copy link to this page
          </Button>
    );
  }

export default CopyLink;