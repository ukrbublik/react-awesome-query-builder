import React, {Component} from 'react';
import {
  Query, Builder, BasicConfig, Utils, 
  ImmutableTree, Config, BuilderProps, JsonTree
} from 'react-awesome-query-builder';
import throttle from 'lodash/throttle';
import loadedConfig from './config';
import loadedInitValue from './init_value';

const stringify = JSON.stringify;
const {queryBuilderFormat, jsonLogicFormat, queryString, mongodbFormat, sqlFormat, getTree, checkTree, loadTree, uuid} = Utils;
const preStyle = { backgroundColor: 'darkgrey', margin: '10px', padding: '10px' };
const preErrorStyle = { backgroundColor: 'lightpink', margin: '10px', padding: '10px' };

const emptyInitValue: JsonTree = {id: uuid(), type: "group"};
const initValue: JsonTree = loadedInitValue && Object.keys(loadedInitValue).length > 0 ? loadedInitValue as JsonTree : emptyInitValue;



interface DemoQueryBuilderState {
  tree: ImmutableTree;
  config: Config;
}

export default class DemoQueryBuilder extends Component<{}, DemoQueryBuilderState> {
    private immutableTree: ImmutableTree;
    private config: Config;

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

    renderBuilder = (props: BuilderProps) => (
      <div className="query-builder-container" style={{padding: '10px'}}>
          <div className="query-builder qb-lite">
              <Builder {...props} />
          </div>
      </div>
    )
    
    onChange = (immutableTree: ImmutableTree, config: Config) => {
      this.immutableTree = immutableTree;
      this.config = config;
      this.updateResult();
      const jsonTree = getTree(immutableTree); //can be saved to backend
    }

    updateResult = throttle(() => {
      this.setState({tree: this.immutableTree, config: this.config});
    }, 100)

    renderResult = ({tree: immutableTree, config} : {tree: ImmutableTree, config: Config}) => {
      const {logic, data, errors} = jsonLogicFormat(immutableTree, config);

      return (
        <div>
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
            sqlFormat: 
              <pre style={preStyle}>
                {stringify(sqlFormat(immutableTree, config), undefined, 2)}
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
            <a href="http://jsonlogic.com/play.html" target="_blank">jsonLogicFormat</a>: 
              { errors ? 
                <pre style={preErrorStyle}>
                  {stringify(errors, undefined, 2)}
                </pre> 
              : 
                <pre style={preStyle}>
                  // Rule:<br />
                  {stringify(logic, undefined, 2)}
                  <br />
                  <hr />
                  // Data:<br />
                  {stringify(data, undefined, 2)}
                </pre>
              }
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

}
