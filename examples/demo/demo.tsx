import React, { useEffect, useState } from "react";
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
  skin: string,
}

type ImmOMap = Immutable.OrderedMap<string, any>;

interface DemoQueryBuilderMemo {
  immutableTree?: ImmutableTree,
  config?: Config,
  _actions?: Actions,
}

const DemoQueryBuilder: React.FC = () => {
  const memo: DemoQueryBuilderMemo = {};

  const [state, setState] = useState<DemoQueryBuilderState>({
    tree: initTree, 
    config: loadedConfig,
    skin: initialSkin
  });

  useEffect(() => {
    window.addEventListener("update", onConfigChanged);
    return () => {
      window.removeEventListener("update", onConfigChanged);
    };
  });


  const onConfigChanged = (e: Event) => {
    const {detail: {config, _initTree, _initValue}} = e as CustomEvent<CustomEventDetail>;
    console.log("Updating config...");
    setState({
      ...state,
      config,
    });
    initTree = _initTree;
    initValue = _initValue;
  };

  const switchShowLock = () => {
    const newConfig: Config = clone(state.config);
    newConfig.settings.showLock = !newConfig.settings.showLock;
    setState({...state, config: newConfig});
  };

  const resetValue = () => {
    setState({
      ...state,
      tree: initTree, 
    });
  };

  const validate = () => {
    setState({
      ...state,
      tree: checkTree(state.tree, state.config)
    });
  };

  const changeSkin = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const skin = e.target.value;
    const config = loadConfig(e.target.value);
    setState({
      ...state,
      skin,
      config,
      tree: checkTree(state.tree, config)
    });
    window._initialSkin = skin;
  };

  const clearValue = () => {
    setState({
      ...state,
      tree: loadTree(emptyInitValue), 
    });
  };

  const renderBuilder = (bprops: BuilderProps) => {
    memo._actions = bprops.actions;
    return (
      <div className="query-builder-container" style={{padding: "10px"}}>
        <div className="query-builder qb-lite">
          <Builder {...bprops} />
        </div>
      </div>
    );
  };
  
  const onChange = (immutableTree: ImmutableTree, config: Config, actionMeta?: ActionMeta) => {
    if (actionMeta)
      console.info(actionMeta);
    memo.immutableTree = immutableTree;
    memo.config = config;
    updateResult();
    
    const jsonTree = getTree(immutableTree); //can be saved to backend
  };

  const updateResult = throttle(() => {
    setState({...state, tree: memo.immutableTree, config: memo.config});
  }, 100);

  // Demonstrates how actions can be called programmatically
  const runActions = () => {
    const rootPath = [ state.tree.get("id") as string ];
    const isEmptyTree = !state.tree.get("children1");
    const firstPath = [
      state.tree.get("id"), 
      ((state.tree.get("children1") as ImmOMap)?.first() as ImmOMap)?.get("id")
    ];
    const lastPath = [
      state.tree.get("id"), 
      ((state.tree.get("children1") as ImmOMap)?.last() as ImmOMap)?.get("id")
    ];

    // Change root group to NOT OR
    memo._actions.setNot(rootPath, true);
    memo._actions.setConjunction(rootPath, "OR");

    // Move first item
    if (!isEmptyTree) {
      memo._actions.moveItem(firstPath, lastPath, "before");
    }

    // Remove last rule
    if (!isEmptyTree) {
      memo._actions.removeRule(lastPath);
    }

    // Change first rule to `num between 2 and 4`
    if (!isEmptyTree) {
      memo._actions.setField(firstPath, "num");
      memo._actions.setOperator(firstPath, "between");
      memo._actions.setValueSrc(firstPath, 0, "value");
      memo._actions.setValue(firstPath, 0, 2, "number");
      memo._actions.setValue(firstPath, 1, 4, "number");
    }

    // Add rule `login == "denis"`
    memo._actions.addRule(
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
    memo._actions.addRule(
      rootPath,
      {
        field: "user.login",
        operator: "equal",
        value: ["user.firstName"],
        valueSrc: ["field"]
      },
    );

    // Add rule-group `cars` with `year == 2021`
    memo._actions.addRule(
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
    memo._actions.addGroup(
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
  };

  const renderResult = ({tree: immutableTree, config} : {tree: ImmutableTree, config: Config}) => {
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
  };

  return (
    <div>
      <div>
        <select value={state.skin} onChange={changeSkin}>
          <option key="vanilla">vanilla</option>
          <option key="antd">antd</option>
          <option key="material">material</option>
          <option key="mui">mui</option>
          <option key="bootstrap">bootstrap</option>
        </select>
        <button onClick={resetValue}>reset</button>
        <button onClick={clearValue}>clear</button>
        <button onClick={runActions}>run actions</button>
        <button onClick={validate}>validate</button>
        <button onClick={switchShowLock}>show lock: {state.config.settings.showLock ? "on" : "off"}</button>
      </div>
      
      <Query
        {...state.config}
        value={state.tree}
        onChange={onChange}
        renderBuilder={renderBuilder}
      />

      <div className="query-builder-result">
        {renderResult(state)}
      </div>
    </div>
  );
};


export default DemoQueryBuilder;
