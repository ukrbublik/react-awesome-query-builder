import React, {Component} from 'react';
import {Query, Builder, Preview, Utils} from 'react-awesome-query-builder';
const {queryBuilderFormat, queryString, mongodbFormat, getTree, loadTree, uuid} = Utils;
import config from './config';
import initValue from './init_value';
var stringify = require('json-stringify-safe');
var emptyInitValue = {"id": uuid(), "type": "group"};

export default class DemoQueryBuilder extends Component {
    getChildren = (props) => {
        return (
            <div className="query-builder-container" style={{padding: '10px', overflow: "scroll", height: "400px"}}>
                <div className="query-builder">
                    <Builder {...props} />
                </div>
                <div className="query-builder-result">
                  {this.renderResult(props)}
                </div>
            </div>
        )
    }

    renderResult = (props) => {
      const jsonStyle = { backgroundColor: 'darkgrey', margin: '10px', padding: '10px' } 
      return (
        <div>
          <br />
          <div>
            stringFormat: 
            <pre style={jsonStyle}>
              {stringify(queryString(props.tree, props.config), undefined, 2)}
            </pre>
          </div>
          <hr/>
          <div>
            humanStringFormat: 
            <pre style={jsonStyle}>
              {stringify(queryString(props.tree, props.config, true), undefined, 2)}
            </pre>
          </div>
          <hr/>
          <div>
            mongodbFormat: 
              <pre style={jsonStyle}>
                {stringify(mongodbFormat(props.tree, props.config), undefined, 2)}
              </pre>
          </div>
          <hr/>
          <div>
            queryBuilderFormat: 
              <pre style={jsonStyle}>
                {stringify(queryBuilderFormat(props.tree, props.config), undefined, 2)}
              </pre>
          </div>
          <hr/>
          <div>
            Tree: 
            <pre style={jsonStyle}>
              {stringify(props.tree, undefined, 2)}
            </pre>
          </div>
          <hr/>
          <div>
            Serialized Tree: 
            <div style={jsonStyle}>
              {stringify(getTree(props.tree))}
            </div>
          </div>
        </div>
      );
    }

    render() {
        const {tree, ...config_props} = config;
        let value = initValue;
        if (!tree || Object.keys(tree).length === 0)
          value = emptyInitValue;
                
        return (
                <Query 
                    value={loadTree(value)}
                    {...config_props} 
                    get_children={this.getChildren}
                    onChange={this.onChange}
                > </Query>
        );
    }
}
