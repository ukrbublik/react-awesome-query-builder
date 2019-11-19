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

    render = () => (
      <div>
        <Query 
            {...loadedConfig} 
            value={this.state.tree}
            onChange={this.onChange}
            get_children={this.renderBuilder}
        />
        <div className="query-builder-result">
          {this.renderResult(this.state)}
        </div>
      </div>
    )

    renderBuilder = (props) => (
        <div className="query-builder-container" style={{padding: '10px'}}>
            <div className="query-builder">
                <Builder {...props} />
            </div>
        </div>
    )
    
    onChange = (immutableTree, config) => {
      this.immutableTree = immutableTree;
      this.tree = getTree(immutableTree); //can be saved to backend
      this.config = config;
      this.updateResult();
    }

    updateResult = throttle(() => {
      this.setState({tree: this.immutableTree, config: this.config});
    }, 100)

    renderResult = ({tree, config}) => {
      if (!tree || !config)
        return;
      const jsonStyle = { backgroundColor: 'darkgrey', margin: '10px', padding: '10px' } 
      return (
        <div>
          <br />
          <div>
            stringFormat: 
            <pre style={jsonStyle}>
              {stringify(queryString(tree, config), undefined, 2)}
            </pre>
          </div>
          <hr/>
          <div>
            humanStringFormat: 
            <pre style={jsonStyle}>
              {stringify(queryString(tree, config, true), undefined, 2)}
            </pre>
          </div>
          <hr/>
          <div>
            mongodbFormat: 
              <pre style={jsonStyle}>
                {stringify(mongodbFormat(tree, config), undefined, 2)}
              </pre>
          </div>
          <hr/>
          <div>
            queryBuilderFormat: 
              <pre style={jsonStyle}>
                {stringify(queryBuilderFormat(tree, config), undefined, 2)}
              </pre>
          </div>
          <hr/>
          <div>
            Tree: 
            <pre style={jsonStyle}>
              {stringify(tree, undefined, 2)}
            </pre>
          </div>
          <hr/>
          <div>
            Serialized Tree: 
            <div style={jsonStyle}>
              {stringify(getTree(tree))}
            </div>
          </div>
        </div>
      );
    }

}
