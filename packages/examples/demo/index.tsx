import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Query, Builder, Utils, 
  //types:
  BuilderProps, ImmutableTree, Config, JsonTree, JsonLogicTree, ActionMeta, Actions
} from "@react-awesome-query-builder/ui";
import ImportSkinStyles from "../skins";
import throttle from "lodash/throttle";
import omit from "lodash/omit";
import loadConfig from "./config";
import loadedInitValue from "./init_value";
import loadedInitLogic from "./init_logic";
import Immutable from "immutable";
import clone from "clone";

const {
  getTree, loadTree, isValidTree, validateTree, sanitizeTree, uuid,
  loadFromJsonLogic, loadFromSpel, 
  jsonLogicFormat, elasticSearchFormat, queryBuilderFormat, queryString, _mongodbFormat, _sqlFormat, _spelFormat,
} = Utils;
const stringify = JSON.stringify;

const preStyle = { backgroundColor: "darkgrey", margin: "10px", padding: "10px" };
const preErrorStyle = { backgroundColor: "lightpink", margin: "10px", padding: "10px" };
const sanitizeOptions = {
  // fix options:
  removeEmptyGroups: true,
  removeIncompleteRules: true,
  // translate options:
  translateErrors: true,
  includeStringifiedItems: true,
  includeItemsPositions: true,
};
const initialSkin = window._initialSkin || "mui";

const emptyInitValue: JsonTree = {id: uuid(), type: "group"};
//const emptyInitValue: JsonTree = {id: uuid(), type: "switch_group"};
const loadedConfig = loadConfig(initialSkin);
const initValue: JsonTree = loadedInitValue && Object.keys(loadedInitValue).length > 0
  ? loadedInitValue as JsonTree
  : emptyInitValue;
const initLogic: JsonLogicTree | undefined = loadedInitLogic && Object.keys(loadedInitLogic).length > 0
  ? loadedInitLogic as JsonLogicTree
  : undefined;
let initTree: ImmutableTree = loadTree(emptyInitValue);
initTree = loadTree(initValue);
//initTree = loadFromJsonLogic(initLogic, loadedConfig)!; // <- this will work same

const {fixedTree, fixedErrors, nonFixedErrors} = sanitizeTree(initTree, loadedConfig, sanitizeOptions);
initTree = fixedTree;
if (fixedErrors.length) {
  console.warn("Fixed tree errors on load: ", fixedErrors);
}
if (nonFixedErrors.length) {
  console.warn("Validation errors on load:", nonFixedErrors);
}

// Trick to hot-load new config when you edit `config.tsx`
// const updateEvent = new CustomEvent<CustomEventDetail>("update", { detail: {
//   config: loadedConfig,
//   _initTree: initTree,
//   _initValue: initValue,
// } });
// window.dispatchEvent(updateEvent);

// interface CustomEventDetail {
//   config: Config;
//   _initTree: ImmutableTree;
//   _initValue: JsonTree;
// }

declare global {
  interface Window {
    _initialSkin: string;
  }
}

interface DemoQueryBuilderState {
  tree: ImmutableTree;
  config: Config;
  skin: string,
  spelStr: string;
  spelErrors: Array<string>;
}

interface DemoQueryBuilderMemo {
  immutableTree?: ImmutableTree,
  config?: Config,
  actions?: Actions,
}

// Add translations
Utils.i18n.addResources("en", "custom", {
  "INVALID_SLIDER_VALUE": "Invalid slider value {{val}} translated with i18next",
  "BAD_LEN": "Bad length {{val}} translated with i18next"
});
// Override translations
Utils.i18n.addResources("en", "raqbvalidation", {
  "INCOMPLETE_LHS": "Incomplete left-hand side",
  "INCOMPLETE_RHS": "Incomplete right-hand side",
});

const DemoQueryBuilder: React.FC = () => {
  const memo: React.MutableRefObject<DemoQueryBuilderMemo> = useRef({});

  const [state, setState] = useState<DemoQueryBuilderState>({
    tree: initTree, 
    config: loadedConfig,
    skin: initialSkin,
    spelStr: "",
    spelErrors: [] as Array<string>
  });

  // useEffect(() => {
  //   window.addEventListener("update", onConfigChanged);
  //   return () => {
  //     window.removeEventListener("update", onConfigChanged);
  //   };
  // });

  // const onConfigChanged = (e: Event) => {
  //   const {detail: {config, _initTree, _initValue}} = e as CustomEvent<CustomEventDetail>;
  //   console.log("Updating config...");
  //   setState({
  //     ...state,
  //     config,
  //   });
  //   initTree = _initTree;
  //   initValue = _initValue;
  // };

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

  const sanitize = () => {
    const { fixedErrors, fixedTree, nonFixedErrors } = sanitizeTree(state.tree, state.config, {
      ...sanitizeOptions,
      forceFix: false,
    });
    if (fixedErrors.length) {
      console.warn("> sanitizeTree fixed errors:", fixedErrors);
    }
    if (nonFixedErrors.length) {
      console.warn("> sanitizeTree non-fixed validation errors:", nonFixedErrors);
    }
    setState({
      ...state,
      tree: fixedTree,
    });
  };

  const sanitizeAndFix = () => {
    const { fixedErrors, fixedTree, nonFixedErrors } = sanitizeTree(state.tree, state.config, {
      ...sanitizeOptions,
      forceFix: true,
    });
    if (fixedErrors.length) {
      console.warn("> sanitizeTree fixed errors:", fixedErrors);
    }
    if (nonFixedErrors.length) {
      console.warn("> sanitizeTree non-fixed validation errors:", nonFixedErrors);
    }
    setState({
      ...state,
      tree: fixedTree,
    });
  };

  const validate = () => {
    const validationErrors = validateTree(state.tree, state.config, {
      translateErrors: true,
      includeItemsPositions: true,
      includeStringifiedItems: true,
    });
    console.warn(">>> validationErrors", validationErrors);
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
    const {fixedTree, fixedErrors} = sanitizeTree(tree!, state.config, sanitizeOptions);
    if (fixedErrors.length) {
      console.warn("Fixed errors after import from SpEL:", fixedErrors);
    }
    setState({
      ...state, 
      tree: fixedTree ?? state.tree,
      spelErrors
    });
  };

  const changeSkin = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const skin = e.target.value;
    const config = loadConfig(e.target.value);
    const {fixedTree, fixedErrors} = sanitizeTree(state.tree, config, sanitizeOptions);
    if (fixedErrors.length) {
      console.warn("Fixed errors after chanage UI framework:", fixedErrors);
    }
    setState({
      ...state,
      skin,
      config,
      tree: fixedTree
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
    return (
      <div className="query-builder-container" style={{padding: "10px"}}>
        <div className="query-builder qb-lite">
          <Builder {...bprops} />
        </div>
      </div>
    );
  }, []);

  const onChange = useCallback((immutableTree: ImmutableTree, config: Config, actionMeta?: ActionMeta, actions?: Actions) => {
    const isInit = !actionMeta;
    if (actionMeta)
      console.info(actionMeta);
    memo.current.immutableTree = immutableTree;
    memo.current.config = config;
    memo.current.actions = actions;
    updateResult();
  }, []);

  const updateResult = throttle(() => {
    setState(prevState => ({...prevState, tree: memo.current.immutableTree!, config: memo.current.config!}));
  }, 100);

  const removeNumFromConfig = () => {
    const currentConfig = memo.current.config as Config;
    const newConfig: Config = {
      ...currentConfig,
      fields: {
        ...omit(currentConfig.fields, ["num"]),
      }
    };
    setState(prevState => ({
      ...prevState,
      config: newConfig,
    }));
  };

  // Demonstrates how actions can be called programmatically
  const runActions = () => {
    const rootPath = [ state.tree.get("id") ];
    const childrenCount = state.tree.get("children1")?.size || 0;
    const firstItem = state.tree.get("children1")?.first()!;
    const lastItem = state.tree.get("children1")?.last()!;
    const firstPath = [
      state.tree.get("id"), 
      firstItem?.get("id")
    ];
    const lastPath = [
      state.tree.get("id"), 
      lastItem?.get("id")
    ];

    // Change root group to NOT OR
    memo.current.actions!.setNot(rootPath, true);
    memo.current.actions!.setConjunction(rootPath, "OR");

    // Move first item
    if (childrenCount > 1) {
      memo.current.actions!.moveItem(firstPath, lastPath, "before");
    }

    // Change first rule to `num between 2 and 4`
    if (childrenCount && firstItem.get("type") === "rule") {
      memo.current.actions!.setFieldSrc(firstPath, "field");
      memo.current.actions!.setField(firstPath, "num");
      memo.current.actions!.setOperator(firstPath, "between");
      memo.current.actions!.setValueSrc(firstPath, 0, "value");
      memo.current.actions!.setValue(firstPath, 0, 2, "number");
      memo.current.actions!.setValue(firstPath, 1, 4, "number");
    }

    // Remove last rule
    if (childrenCount > 1) {
      memo.current.actions!.removeRule(lastPath);
    }

    // Add rule `lower(aaa) == lower(AAA)`
    const newPath = [
      state.tree.get("id"), 
      Utils.uuid()
    ];
    memo.current.actions!.addRule(rootPath, {
      id: newPath[1], // use pre-generated id
      field: null,
      operator: null,
      value: [],
    });
    memo.current.actions!.setFieldSrc(newPath, "func");
    memo.current.actions!.setFuncValue(newPath, -1, [], null, "string.LOWER", "string");
    memo.current.actions!.setFuncValue(newPath, -1, [], "str", "aaa", "string");
    memo.current.actions!.setValueSrc(newPath, 0, "func");
    memo.current.actions!.setFuncValue(newPath, 0, [], null, "string.LOWER", "string");
    memo.current.actions!.setFuncValue(newPath, 0, [], "str", "AAA", "string");

    // Add rule `login == "denis"`
    memo.current.actions!.addRule(
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
    memo.current.actions!.addRule(
      rootPath,
      {
        field: "user.login",
        operator: "equal",
        value: ["user.firstName"],
        valueSrc: ["field"]
      },
    );

    // Add rule-group `cars` with `year == 2021`
    memo.current.actions!.addRule(
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
    memo.current.actions!.addGroup(
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
    const isValid = isValidTree(immutableTree, config);
    const treeJs = getTree(immutableTree);
    const {logic, data: logicData, errors: logicErrors} = jsonLogicFormat(immutableTree, config);
    const [spel, spelErrors] = _spelFormat(immutableTree, config);
    const queryStr = queryString(immutableTree, config);
    const humanQueryStr = queryString(immutableTree, config, true);
    const [sql, sqlErrors] = _sqlFormat(immutableTree, config);
    const [mongo, mongoErrors] = _mongodbFormat(immutableTree, config);
    const elasticSearch = elasticSearchFormat(immutableTree, config);

    const validationRes = validateTree(immutableTree, config, {
      includeItemsPositions: true,
      includeStringifiedItems: true,
      translateErrors: true,
    }).map(({
      errors, itemStr, itemPositionStr,
    }) => ({
      errors: errors.map(({
        side, delta, str, fixed
      }) => `${fixed ? "* " : ""}${side ? `[${[side, delta].filter(a => a != undefined).join(" ")}] ` : ""}${str!}`),
      itemStr,
      itemPositionStr,
    }));

    return (
      <div>
        {isValid ? null : <pre style={preErrorStyle}>{"Tree has errors"}</pre>}
        <hr/>
        <div>
        Validation errors: 
          { validationRes.length > 0
            ? <pre style={preErrorStyle}>
              {stringify(validationRes, undefined, 2)}
            </pre>
            : "no"
          }
        </div>
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
          { (logicErrors?.length || 0) > 0 
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
          <option key="fluent">fluent</option>
        </select>
        <button onClick={resetValue}>reset</button>
        <button onClick={clearValue}>clear</button>
        <button onClick={validate}>validate &gt; console</button>
        <button onClick={sanitize}>sanitize</button>
        <button onClick={sanitizeAndFix}>sanitize & fix</button>
        <button onClick={switchShowLock}>show lock: {state.config.settings.showLock ? "on" : "off"}</button>
        <button onClick={runActions}>run actions</button>
        <button onClick={removeNumFromConfig}>change config: remove num field</button>
      </div>

      <ImportSkinStyles skin={state.skin} />
      
      <Query
        {...state.config}
        value={state.tree}
        onInit={onChange}
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
