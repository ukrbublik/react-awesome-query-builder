import React, {Component} from 'react';
import {Query, Builder, Preview} from 'react-query-builder';
import config from './config';

export default class Demo extends Component {
    render() {
        return (
            <Query {...config} get_children=
                                   {(props) => (
                                     <div>
                                       {console.log(props.tree)}
                                       <Preview {...props}>
                                         {(string) => (
                                           <code className="query-preview">{string || 'Use the builder below to create a search query.'}</code>
                                         )}
                                       </Preview>
                                       <div className="query-builder">
                                         <Builder {...props} />
                                       </div>
                                     </div>
                                   )}>
            </Query>
        );
    }
}
