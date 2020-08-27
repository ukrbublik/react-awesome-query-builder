/*eslint no-unused-vars: ["off", {"varsIgnorePattern": "^_"}]*/
import React, {Component} from "react";
import {
  Query, Builder, Utils,
} from "react-awesome-query-builder";
import throttle from "lodash/throttle";
import loadedConfig from "./config_simple"; // <- you can try './config_complex' for more complex examples
import loadedInitValue from "./init_value";
import loadedInitLogic from "./init_logic";
const stringify = JSON.stringify;
const {jsonLogicFormat, queryString, mongodbFormat, sqlFormat, getTree, checkTree, loadTree, uuid, loadFromJsonLogic} = Utils;
const preStyle = { backgroundColor: "darkgrey", margin: "10px", padding: "10px" };
const preErrorStyle = { backgroundColor: "lightpink", margin: "10px", padding: "10px" };

const emptyInitValue = {"id": uuid(), "type": "group"};

// get init value in JsonTree format:
const initValue = loadedInitValue && Object.keys(loadedInitValue).length > 0 ? loadedInitValue : emptyInitValue;
const initTree = checkTree(loadTree(initValue), loadedConfig);

// -OR- alternativaly get init value in JsonLogic format:
//const initLogic = loadedInitLogic && Object.keys(loadedInitLogic).length > 0 ? loadedInitLogic : undefined;
//const initTree = checkTree(loadFromJsonLogic(initLogic, loadedConfig), loadedConfig);


export default class DemoQueryBuilder extends Component {
    
    state = {
      tree: initTree,
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

        <button onClick={this.resetValue}>reset</button>
        <button onClick={this.clearValue}>clear</button>

        <div className="query-builder-result">
          {this.renderResult(this.state)}
        </div>
      </div>
    )

    resetValue = () => {
      this.setState({
        tree: initTree, 
      });
    };

    clearValue = () => {
      this.setState({
        tree: loadTree(emptyInitValue), 
      });
    };

    renderBuilder = (props) => (
      <div className="query-builder-container" style={{padding: "10px"}}>
        <div className="query-builder">
          <Builder {...props} />
        </div>
      </div>
    )
    
    onChange = (immutableTree, config) => {
      this.immutableTree = immutableTree;
      this.config = config;
      this.updateResult();

      // `jsonTree` or `logic` can be saved to backend
      // (and then loaded with `loadTree` or `loadFromJsonLogic` as seen above)
      const jsonTree = getTree(immutableTree);
      const {logic, data, errors} = jsonLogicFormat(immutableTree, config);
    }

    updateResult = throttle(() => {
      this.setState({tree: this.immutableTree, config: this.config});
    }, 100)

    renderResult = ({tree: immutableTree, config}) => {
      const {logic, data, errors} = jsonLogicFormat(immutableTree, config);
      return (
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
            <a href="http://jsonlogic.com/play.html" target="_blank" rel="noopener noreferrer">jsonLogicFormat</a>: 
            { errors.length > 0 
              && <pre style={preErrorStyle}>
                {stringify(errors, undefined, 2)}
              </pre> 
            }
            { !!logic
              && <pre style={preStyle}>
                {"// Rule"}:<br />
                {stringify(logic, undefined, 2)}
                <br />
                <hr />
                {"// Data"}:<br />
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
        </div>
      );
    }

}
