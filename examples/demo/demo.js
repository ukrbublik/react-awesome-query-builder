import React, {Component} from 'react';
import {Query, Builder, Utils} from 'react-awesome-query-builder';
const {queryBuilderFormat, queryString, mongodbFormat, getTree, loadTree, uuid} = Utils;
const stringify = require('json-stringify-safe');
import throttle from 'lodash/throttle';
import Immutable from 'immutable';
window.Immutable = Immutable

import loadedConfig from './config';
import initValue from './init_value';
const emptyInitValue = {"id": uuid(), "type": "group"};
const queryInitValue = initValue && Object.keys(initValue).length > 0 ? initValue : emptyInitValue;
const preStyle = { backgroundColor: 'darkgrey', margin: '10px', padding: '10px' };


export default class DemoQueryBuilder extends Component {
    state = {
      tree: loadTree(queryInitValue),
      config: loadedConfig
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
      this.config = config;
      this.updateResult();
      const jsonTree = getTree(immutableTree); //can be saved to backend
    }

    updateResult = throttle(() => {
      this.setState({tree: this.immutableTree, config: this.config});
    }, 100)

    renderResult = ({tree: immutableTree, config}) => (
      <div>
        <br />
        <div>
          stringFormat: 
          <pre style={preStyle}>
            {stringify(queryString(immutableTree, config), undefined, 2)}
          </pre>
        </div>
        <hr/>
        <div>
          humanStringFormat: 
          <pre style={preStyle}>
            {stringify(queryString(immutableTree, config, true), undefined, 2)}
          </pre>
        </div>
        <hr/>
        <div>
          mongodbFormat: 
            <pre style={preStyle}>
              {stringify(mongodbFormat(immutableTree, config), undefined, 2)}
            </pre>
        </div>
        <hr/>
        <div>
          Tree: 
          <pre style={preStyle}>
            {stringify(getTree(immutableTree), undefined, 2)}
          </pre>
        </div>
        {/* <hr/>
        <div>
          queryBuilderFormat: 
            <pre style={preStyle}>
              {stringify(queryBuilderFormat(immutableTree, config), undefined, 2)}
            </pre>
        </div> */}
      </div>
    )

}
