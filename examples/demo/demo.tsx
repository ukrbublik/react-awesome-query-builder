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
import clone from "clone";

const stringify = JSON.stringify;
const {elasticSearchFormat, queryBuilderFormat, jsonLogicFormat, queryString, mongodbFormat, sqlFormat, getTree, checkTree, loadTree, uuid, loadFromJsonLogic, isValidTree} = Utils;
const preStyle = { backgroundColor: "darkgrey", margin: "10px", padding: "10px" };
const preErrorStyle = { backgroundColor: "lightpink", margin: "10px", padding: "10px" };

const initialSkin = window._initialSkin || "antd";
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

declare global {
  interface Window {
    _initialSkin: string;
  }
}

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

type ImmOMap = Immutable.OrderedMap<string, any>;

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
        <div>
          <select value={this.state.skin} onChange={this.changeSkin}>
            <option key="vanilla">vanilla</option>
            <option key="antd">antd</option>
            <option key="material">material</option>
            <option key="bootstrap">bootstrap</option>
          </select>
          <button onClick={this.resetValue}>reset</button>
          <button onClick={this.clearValue}>clear</button>
          <button onClick={this.runActions}>run actions</button>
          <button onClick={this.validate}>validate</button>
          <button onClick={this.switchShowLock}>show lock: {this.state.config.settings.showLock ? "on" : "off"}</button>
        </div>
        
        <Query
          {...this.state.config}
          value={this.state.tree}
          onChange={this.onChange}
          renderBuilder={this.renderBuilder}
        />

        <div className="query-builder-result">
          {this.renderResult(this.state)}
        </div>
      </div>
    )

    onConfigChanged = (e: Event) => {
      const {detail: {config, _initTree, _initValue}} = e as CustomEvent<CustomEventDetail>;
      console.log("Updating config...");
      this.setState({
        config,
      });
      initTree = _initTree;
      initValue = _initValue;
    }

    switchShowLock = () => {
      const newConfig: Config = clone(this.state.config);
      newConfig.settings.showLock = !newConfig.settings.showLock;
      this.setState({config: newConfig});
    }

    resetValue = () => {
      this.setState({
        tree: initTree, 
      });
    };

    validate = () => {
      this.setState({
        tree: checkTree(this.state.tree, this.state.config)
      });
    }

    changeSkin = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const skin = e.target.value;
      const config = loadConfig(e.target.value);
      this.setState({
        skin,
        config,
        tree: checkTree(this.state.tree, config)
      });
      window._initialSkin = skin;
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

    // Demonstrates how actions can be called programmatically
    runActions = () => {
      const rootPath = [ this.state.tree.get("id") as string ];
      const isEmptyTree = !this.state.tree.get("children1");
      const firstPath = [
        this.state.tree.get("id"), 
        ((this.state.tree.get("children1") as ImmOMap)?.first() as ImmOMap)?.get("id")
      ];
      const lastPath = [
        this.state.tree.get("id"), 
        ((this.state.tree.get("children1") as ImmOMap)?.last() as ImmOMap)?.get("id")
      ];

      // Change root group to NOT OR
      this._actions.setNot(rootPath, true);
      this._actions.setConjunction(rootPath, "OR");

      // Move first item
      if (!isEmptyTree) {
        this._actions.moveItem(firstPath, lastPath, "before");
      }

      // Remove last rule
      if (!isEmptyTree) {
        this._actions.removeRule(lastPath);
      }

      // Change first rule to `num between 2 and 4`
      if (!isEmptyTree) {
        this._actions.setField(firstPath, "num");
        this._actions.setOperator(firstPath, "between");
        this._actions.setValueSrc(firstPath, 0, "value");
        this._actions.setValue(firstPath, 0, 2, "number");
        this._actions.setValue(firstPath, 1, 4, "number");
      }

      // Add rule `login == "denis"`
      this._actions.addRule(
        rootPath,
        {
          field: "user.login",
          operator: "equal",
          value: ["denis"],
          valueSrc: ["value"],
          valueType: ["text"]
        },
      );

      // Add rule `login == firstName`
      this._actions.addRule(
        rootPath,
        {
          field: "user.login",
          operator: "equal",
          value: ["user.firstName"],
          valueSrc: ["field"]
        },
      );

      // Add rule-group `cars` with `year == 2021`
      this._actions.addRule(
        rootPath,
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

      // Add group with `slider == 40` and subgroup `slider < 20`
      this._actions.addGroup(
        rootPath,
        {
          conjunction: "AND"
        },
        [
          {
            type: "rule",
            properties: {
              field: "slider",
              operator: "equal",
              value: [40]
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
          mongodbFormat: 
            <pre style={preStyle}>
              {stringify(mongodbFormat(immutableTree, config), undefined, 2)}
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
