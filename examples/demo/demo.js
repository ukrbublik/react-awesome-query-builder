import React, {Component} from 'react';
import {Query, Builder, Preview, Utils} from 'react-awesome-query-builder';
const {queryBuilderFormat, queryString, mongodbFormat, getTree, loadTree, uuid} = Utils;
const stringify = require('json-stringify-safe');
import throttle from 'lodash/throttle';
import Immutable from 'immutable';
window.Immutable = Immutable

import loadedConfig from './config';
import initValue from './init_value';
const emptyInitValue = {"id": uuid(), "type": "group"};
const queryInitValue = initValue && Object.keys(initValue).length > 0 ? initValue : emptyInitValue;


export default class DemoQueryBuilder extends Component {
    state = {
      tree: loadTree(queryInitValue),
      config: null
    };

    render() {
      return (
        <div>
          <Query 
              {...loadedConfig} 
              value={this.state.tree}
              onChange={this.onChange}
              get_children={this.getChildren}
          />
          <div className="query-builder-result">
            {this.renderResult(this.state)}
          </div>
        </div>
      );
    }

    getChildren = (props) => {
        return (
            <div className="query-builder-container" style={{padding: '10px'}}>
                <div className="query-builder">
                    <Builder {...props} />
                </div>
            </div>
        )
    }
    
    onChange = (immutableTree, config) => {
      this.immutableTree = immutableTree;
      this.tree = getTree(immutableTree); //can be saved to backend
      this.config = config;
      this.updateResult();
    }

    updateResult = throttle(() => {
      this.setState({tree: this.immutableTree, config: this.config});
    }, 1000)

    renderResult = (props) => {
      if (!props.tree || !props.config)
        return;
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

}
