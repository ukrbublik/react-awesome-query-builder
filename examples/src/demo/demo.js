import React, {Component} from 'react';
import {Query, Builder, BasicConfig, Utils} from 'react-awesome-query-builder';
import throttle from 'lodash/throttle';
import Immutable from 'immutable';
import loadedConfig from './config';
import loadedInitValue from './init_value';

const {queryBuilderFormat, queryString, mongodbFormat, getTree, checkTree, loadTree, uuid} = Utils;
const stringify = require('json-stringify-safe');
window.Immutable = Immutable;
const preStyle = { backgroundColor: 'darkgrey', margin: '10px', padding: '10px' };

const emptyInitValue = {"id": uuid(), "type": "group"};
const initValue = loadedInitValue && Object.keys(loadedInitValue).length > 0 ? loadedInitValue : emptyInitValue;


export default class DemoQueryBuilder extends Component {
    state = {
      tree: checkTree(loadTree(initValue), loadedConfig),
      config: loadedConfig
    };

    render = () => (
      <div>
        <Query 
            {...loadedConfig} 
            value={this.state.tree}
            onChange={this.onChange}
            renderBuilder={this.renderBuilder}
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
