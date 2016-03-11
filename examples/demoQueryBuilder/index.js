import React, {Component} from 'react';
import {Query, Builder, Preview} from 'react-query-builder';
import {queryBuilderFormat} from 'react-query-builder/utils';
import config from './config';

var stringify = require('json-stringify-safe');

export default class DemoQueryBuilder extends Component {
    
    render() {
        return (
            <Query {...config} get_children=
                                   {(props) => (
                                     <div>
                                     <div>{stringify(queryBuilderFormat(props.tree, props.config))}</div>
                                       <div className="query-builder">
                                         <Builder {...props} />
                                       </div>
                                     </div>
                                   )}>
            </Query>
        );
    }
}
