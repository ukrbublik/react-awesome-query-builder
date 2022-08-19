import React, { useEffect, useState, useCallback, useRef } from "react";
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
const {elasticSearchFormat, queryBuilderFormat, jsonLogicFormat, queryString, _mongodbFormat, _sqlFormat, _spelFormat, getTree, checkTree, loadTree, uuid, loadFromJsonLogic, loadFromSpel, isValidTree} = Utils;
const preStyle = { backgroundColor: "darkgrey", margin: "10px", padding: "10px" };
const preErrorStyle = { backgroundColor: "lightpink", margin: "10px", padding: "10px" };

const initialSkin = window._initialSkin || "mui";
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
  spelStr: string;
  spelErrors: Array<string>;
}

type ImmOMap = Immutable.OrderedMap<string, any>;

interface DemoQueryBuilderMemo {
  immutableTree?: ImmutableTree,
  config?: Config,
  _actions?: Actions,
}

const DemoQueryBuilder: React.FC = () => {
  const memo: React.MutableRefObject<DemoQueryBuilderMemo> = useRef({});

  const [state, setState] = useState<DemoQueryBuilderState>({
    tree: initTree, 
    config: loadedConfig,
    skin: initialSkin,
    spelStr: "",
    spelErrors: [] as Array<string>
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

  const onChangeSpelStr = (e: React.ChangeEvent<HTMLInputElement>) => {
    const spelStr = e.target.value;
    setState({
      ...state,
      spelStr
    });
  };

  const importFromSpel = () => {
    const [tree, spelErrors] = loadFromSpel(state.spelStr, state.config);
    setState({
      ...state, 
      tree: tree ? checkTree(tree, state.config) : state.tree,
      spelErrors
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

  const renderBuilder = useCallback((bprops: BuilderProps) => {
    memo.current._actions = bprops.actions;
    return (
      <div className="query-builder-container" style={{padding: "10px"}}>
        <div className="query-builder qb-lite">
          <Builder {...bprops} />
        </div>
      </div>
    );
  }, []);
  
  const onChange = useCallback((immutableTree: ImmutableTree, config: Config, actionMeta?: ActionMeta) => {
    if (actionMeta)
      console.info(actionMeta);
    memo.current.immutableTree = immutableTree;
    memo.current.config = config;
    updateResult();
  }, []);

  const updateResult = throttle(() => {
    setState(prevState => ({...prevState, tree: memo.current.immutableTree, config: memo.current.config}));
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
    memo.current._actions.setNot(rootPath, true);
    memo.current._actions.setConjunction(rootPath, "OR");

    // Move first item
    if (!isEmptyTree) {
      memo.current._actions.moveItem(firstPath, lastPath, "before");
    }

    // Remove last rule
    if (!isEmptyTree) {
      memo.current._actions.removeRule(lastPath);
    }

    // Change first rule to `num between 2 and 4`
    if (!isEmptyTree) {
      memo.current._actions.setField(firstPath, "num");
      memo.current._actions.setOperator(firstPath, "between");
      memo.current._actions.setValueSrc(firstPath, 0, "value");
      memo.current._actions.setValue(firstPath, 0, 2, "number");
      memo.current._actions.setValue(firstPath, 1, 4, "number");
    }

    // Add rule `login == "denis"`
    memo.current._actions.addRule(
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
    memo.current._actions.addRule(
      rootPath,
      {
        field: "user.login",
        operator: "equal",
        value: ["user.firstName"],
        valueSrc: ["field"]
      },
    );

    // Add rule-group `cars` with `year == 2021`
    memo.current._actions.addRule(
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
    memo.current._actions.addGroup(
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
    const treeJs = getTree(immutableTree);
    const {logic, data: logicData, errors: logicErrors} = jsonLogicFormat(immutableTree, config);
    const [spel, spelErrors] = _spelFormat(immutableTree, config);
    const queryStr = queryString(immutableTree, config);
    const humanQueryStr = queryString(immutableTree, config, true);
    const [sql, sqlErrors] = _sqlFormat(immutableTree, config);
    const [mongo, mongoErrors] = _mongodbFormat(immutableTree, config);
    const elasticSearch = elasticSearchFormat(immutableTree, config);

    return (
      <div>
        {isValid ? null : <pre style={preErrorStyle}>{"Tree has errors"}</pre>}
        <br />
        <div>
        spelFormat: 
          { spelErrors.length > 0 
            && <pre style={preErrorStyle}>
              {stringify(spelErrors, undefined, 2)}
            </pre> 
          }
          <pre style={preStyle}>
            {stringify(spel, undefined, 2)}
          </pre>
        </div>
        <hr/>
        <div>
        stringFormat: 
          <pre style={preStyle}>
            {stringify(queryStr, undefined, 2)}
          </pre>
        </div>
        <hr/>
        <div>
        humanStringFormat: 
          <pre style={preStyle}>
            {stringify(humanQueryStr, undefined, 2)}
          </pre>
        </div>
        <hr/>
        <div>
        sqlFormat: 
          { sqlErrors.length > 0 
            && <pre style={preErrorStyle}>
              {stringify(sqlErrors, undefined, 2)}
            </pre> 
          }
          <pre style={preStyle}>
            {stringify(sql, undefined, 2)}
          </pre>
        </div>
        <hr/>
        <div>
          <a href="http://jsonlogic.com/play.html" target="_blank" rel="noopener noreferrer">jsonLogicFormat</a>: 
          { logicErrors.length > 0 
            && <pre style={preErrorStyle}>
              {stringify(logicErrors, undefined, 2)}
            </pre> 
          }
          { !!logic
            && <pre style={preStyle}>
              {"// Rule"}:<br />
              {stringify(logic, undefined, 2)}
              <br />
              <hr />
              {"// Data"}:<br />
              {stringify(logicData, undefined, 2)}
            </pre>
          }
        </div>
        <hr/>
        <div>
        mongodbFormat: 
          { mongoErrors.length > 0 
            && <pre style={preErrorStyle}>
              {stringify(mongoErrors, undefined, 2)}
            </pre> 
          }
          <pre style={preStyle}>
            {stringify(mongo, undefined, 2)}
          </pre>
        </div>
        <hr/>
        <div>
        elasticSearchFormat: 
          <pre style={preStyle}>
            {stringify(elasticSearch, undefined, 2)}
          </pre>
        </div>
        <hr/>
        <div>
        Tree: 
          <pre style={preStyle}>
            {stringify(treeJs, undefined, 2)}
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

      <div className="query-import-spel">
        SpEL:
        <input type="text" size={150} value={state.spelStr} onChange={onChangeSpelStr} />
        <button onClick={importFromSpel}>import</button>
        <br />
        { state.spelErrors.length > 0 
            && <pre style={preErrorStyle}>
              {stringify(state.spelErrors, undefined, 2)}
            </pre> 
        }
      </div>

      <div className="query-builder-result">
        {renderResult(state)}
      </div>
    </div>
  );
};


export default DemoQueryBuilder;
