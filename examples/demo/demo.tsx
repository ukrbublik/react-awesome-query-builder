import React, {Component} from "react";
import {
  Query, Builder, Utils, 
  //types:
  ImmutableTree, Config, BuilderProps, JsonTree, JsonLogicTree, ActionMeta, Actions
} from "react-awesome-query-builder";
import throttle from "lodash/throttle";
import loadConfig from "./config";
import loadedInitValue from "./init_value";
import loadedInitLogic from "./init_logic";
import Immutable from "immutable";

const stringify = JSON.stringify;
const {elasticSearchFormat, queryBuilderFormat, jsonLogicFormat, queryString, mongodbFormat, sqlFormat, getTree, checkTree, loadTree, uuid, loadFromJsonLogic, isValidTree} = Utils;
const preStyle = { backgroundColor: "darkgrey", margin: "10px", padding: "10px" };
const preErrorStyle = { backgroundColor: "lightpink", margin: "10px", padding: "10px" };

const initialSkin = "antd";
const emptyInitValue: JsonTree = {id: uuid(), type: "group"};
const loadedConfig = loadConfig(initialSkin);
let initValue: JsonTree = loadedInitValue && Object.keys(loadedInitValue).length > 0 ? loadedInitValue as JsonTree : emptyInitValue;
const initLogic: JsonLogicTree = loadedInitLogic && Object.keys(loadedInitLogic).length > 0 ? loadedInitLogic as JsonLogicTree : undefined;
let initTree: ImmutableTree;
//initTree = checkTree(loadTree(initValue), loadedConfig);
initTree = checkTree(loadFromJsonLogic(initLogic, loadedConfig), loadedConfig); // <- this will work same  

// Trick to hot-load new config when you edit `config.tsx`
const updateEvent = new CustomEvent<CustomEventDetail>("update", { detail: {
  config: loadedConfig,
  _initTree: initTree,
  _initValue: initValue,
} });
window.dispatchEvent(updateEvent);

interface CustomEventDetail {
  config: Config;
  _initTree: ImmutableTree;
  _initValue: JsonTree;
}

interface DemoQueryBuilderState {
  tree: ImmutableTree;
  config: Config;
  skin: String,
}

export default class DemoQueryBuilder extends Component<{}, DemoQueryBuilderState> {
    private immutableTree: ImmutableTree;
    private config: Config;
    private _actions: Actions;

    componentDidMount() {
      window.addEventListener("update", this.onConfigChanged);
    }

    componentWillUnmount() {
      window.removeEventListener("update", this.onConfigChanged);
    }

    state = {
      tree: initTree, 
      config: loadedConfig,
      skin: initialSkin
    };

    render = () => (
      <div>
        <Query
          {...this.state.config}
          value={this.state.tree}
          onChange={this.onChange}
          renderBuilder={this.renderBuilder}
        />

        <select value={this.state.skin} onChange={this.changeSkin}>
          <option key="vanilla">vanilla</option>
          <option key="antd">antd</option>
          <option key="material">material</option>
        </select>
        <button onClick={this.resetValue}>reset</button>
        <button onClick={this.clearValue}>clear</button>
        <button onClick={this.runActions}>beta: actions</button>

        <div className="query-builder-result">
          {this.renderResult(this.state)}
        </div>
      </div>
    )

    runActions = () => {
      // Demonstrates how actions can be called programmatically

      const firstPath = [
        this.state.tree.get('id'), 
        this.state.tree.get('children1').first().get('id')
      ];

      this._actions.setField(firstPath, 'num');
      this._actions.setOperator(firstPath, 'between');
      this._actions.setValue(firstPath, 0, 2, 'number');
      this._actions.setValue(firstPath, 1, 4, 'number');

      this._actions.addRule(
        [ this.state.tree.get('id') as string ],
        {
          field: "cars",
          mode: "array",
          operator: "all",
        },
        "rule_group",
        [
          {
            type: "rule",
            properties: {
              field: "cars.year",
              operator: "equal",
              value: [2021]
            }
          }
        ]
      );

      this._actions.addGroup(
        [ this.state.tree.get('id') as string ],
        {
          conjunction: "AND"
        },
        [
          {
            type: "rule",
            properties: {
              field: "slider",
              operator: "equal",
              value: [50]
            }
          },
          {
            type: "group",
            properties: {
              conjunction: "AND"
            },
            children1: [
              {
                type: "rule",
                properties: {
                  field: "slider",
                  operator: "less",
                  value: [20]
                }
              },
            ]
          }
        ]
      );
    }

    onConfigChanged = (e: Event) => {
      const {detail: {config, _initTree, _initValue}} = e as CustomEvent<CustomEventDetail>;
      console.log("Updating config...");
      this.setState({
        config,
      });
      initTree = _initTree;
      initValue = _initValue;
    }

    resetValue = () => {
      this.setState({
        tree: initTree, 
      });
    };

    changeSkin = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const skin = e.target.value;
      const config = loadConfig(e.target.value);
      this.setState({
        skin,
        config,
        tree: checkTree(this.state.tree, config)
      });
    };

    clearValue = () => {
      this.setState({
        tree: loadTree(emptyInitValue), 
      });
    };

    renderBuilder = (props: BuilderProps) => {
      this._actions = props.actions;
      return (
        <div className="query-builder-container" style={{padding: "10px"}}>
          <div className="query-builder qb-lite">
            <Builder {...props} />
          </div>
        </div>
      );
    }
    
    onChange = (immutableTree: ImmutableTree, config: Config, actionMeta?: ActionMeta) => {
      if (actionMeta)
        console.info(actionMeta);
      this.immutableTree = immutableTree;
      this.config = config;
      this.updateResult();
      
      const jsonTree = getTree(immutableTree); //can be saved to backend
    }

    updateResult = throttle(() => {
      this.setState({tree: this.immutableTree, config: this.config});
    }, 100)

    renderResult = ({tree: immutableTree, config} : {tree: ImmutableTree, config: Config}) => {
      const isValid = isValidTree(immutableTree);
      const {logic, data, errors} = jsonLogicFormat(immutableTree, config);
      return (
        <div>
          {isValid ? null : <pre style={preErrorStyle}>{"Tree has errors"}</pre>}
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
          elasticSearchFormat: 
            <pre style={preStyle}>
              {stringify(elasticSearchFormat(immutableTree, config), undefined, 2)}
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
          {/* <hr/>
        <div>
          queryBuilderFormat: 
            <pre style={preStyle}>
              {stringify(queryBuilderFormat(immutableTree, config), undefined, 2)}
            </pre>
        </div> */}
        </div>
      );
    }

}
