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
const validationTranslateOptions = {
  translateErrors: true,
  includeStringifiedItems: true,
  includeItemsPositions: true,
};
const initialSkin = window._initialSkin || "mui";

const emptyInitValue: JsonTree = {id: uuid(), type: "group"};
//const emptyInitValue: JsonTree = {id: uuid(), type: "switch_group"};
const loadedConfig = loadConfig(initialSkin);
let initValue = loadedInitValue && Object.keys(loadedInitValue).length > 0
  ? loadedInitValue as JsonTree
  : emptyInitValue;
const initLogic: JsonLogicTree | undefined = loadedInitLogic && Object.keys(loadedInitLogic).length > 0
  ? loadedInitLogic as JsonLogicTree
  : undefined;
let initTree: ImmutableTree = loadTree(emptyInitValue);
initTree = loadTree(initValue);
//initTree = loadFromJsonLogic(initLogic, loadedConfig)!; // <- this will work same

const {fixedTree, fixedErrors, nonFixedErrors} = sanitizeTree(initTree, loadedConfig, {
  ...validationTranslateOptions,
  removeEmptyGroups: false,
  removeEmptyRules: false,
  removeIncompleteRules: false,
});
initTree = fixedTree;
if (fixedErrors.length) {
  console.warn("Fixed tree errors on load: ", fixedErrors);
}
if (nonFixedErrors.length) {
  console.warn("Validation errors on load:", nonFixedErrors);
}

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

declare global {
  interface Window {
    _initialSkin: string;
  }
}

interface DemoQueryBuilderState {
  tree: ImmutableTree;
  config: Config;
  skin: string,
  renderBocks: Record<string, boolean>;
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
    spelErrors: [] as Array<string>,
    renderBocks: {
      validation: true,
      jsonlogic: true,
      elasticSearch: true,
      mongo: true,
      jsTree: true,
      spel: true,
      strings: true,
      sql: true,
    },
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

  const switchShowErrors = () => {
    const newConfig: Config = clone(state.config);
    newConfig.settings.showErrorMessage = !newConfig.settings.showErrorMessage;
    setState({...state, config: newConfig});
  };

  const switchRenderBlock = (blockName: string) => {
    setState({...state, renderBocks: {...state.renderBocks, [blockName]: !state.renderBocks[blockName]}});
  };


  const resetValue = () => {
    setState({
      ...state,
      tree: initTree, 
    });
  };

  const validateToConsole = () => {
    const validationErrors = validateTree(state.tree, state.config, {
      ...validationTranslateOptions,
    });
    console.warn(">>> Utils.validateTree()", validationErrors);
  };

  const sanitize = () => {
    const { fixedErrors, fixedTree, nonFixedErrors } = sanitizeTree(state.tree, state.config, {
      ...validationTranslateOptions,
      removeEmptyGroups: true, // default
      removeEmptyRules: true, // default
      removeIncompleteRules: true, // default
      forceFix: false, // default
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

  const sanitizeLight = () => {
    const { fixedTree, allErrors } = sanitizeTree(state.tree, state.config, {
      ...validationTranslateOptions,
      removeEmptyGroups: false,
      removeEmptyRules: false,
      removeIncompleteRules: false,
      forceFix: false, // default
    });
    if (allErrors.length) {
      console.warn("> sanitizeTree validation errors:", allErrors);
    }
    setState({
      ...state,
      tree: fixedTree,
    });
  };

  const sanitizeAndFix = () => {
    const { fixedErrors, fixedTree, nonFixedErrors } = sanitizeTree(state.tree, state.config, {
      ...validationTranslateOptions,
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

  const onChangeSpelStr = (e: React.ChangeEvent<HTMLInputElement>) => {
    const spelStr = e.target.value;
    setState({
      ...state,
      spelStr
    });
  };

  const importFromSpel = () => {
    const [tree, spelErrors] = loadFromSpel(state.spelStr, state.config);
    const {fixedTree, fixedErrors} = sanitizeTree(tree!, state.config, validationTranslateOptions);
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
    const {fixedTree, fixedErrors, nonFixedErrors} = sanitizeTree(state.tree, config, {
      ...validationTranslateOptions,
      removeEmptyGroups: false,
      removeEmptyRules: false,
      removeIncompleteRules: false,
    });
    if (fixedErrors.length) {
      console.warn("Fixed errors after change UI framework:", fixedErrors);
    }
    if (nonFixedErrors.length) {
      console.warn("Not fixed errors after change UI framework:", nonFixedErrors);
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

  const renderValidationBlock = ({tree: immutableTree, config, renderBocks}: DemoQueryBuilderState) => {
    if (!renderBocks.validation) {
      return null;
    }

    const isValid = isValidTree(immutableTree, config);
    const validationRes = validateTree(immutableTree, config, {
      ...validationTranslateOptions,
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
      <>
        {isValid ? null : <pre style={preErrorStyle}>{"Tree has errors"}</pre>}
        <div>
          Validation errors: 
          { validationRes.length > 0
            ? <pre style={preErrorStyle}>
              {stringify(validationRes, undefined, 2)}
            </pre>
            : "no"
          }
        </div>
        <hr/>
      </>
    );
  };

  const renderJsonLogicBlock = ({tree: immutableTree, config, renderBocks}: DemoQueryBuilderState) => {
    if (!renderBocks.jsonlogic) {
      return null;
    }

    const {logic, data: logicData, errors: logicErrors} = jsonLogicFormat(immutableTree, config);

    return (
      <>
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
      </>
    );
  };

  const renderMongoBlock = ({tree: immutableTree, config, renderBocks}: DemoQueryBuilderState) => {
    if (!renderBocks.mongo) {
      return null;
    }

    const [mongo, mongoErrors] = _mongodbFormat(immutableTree, config);

    return (
      <>
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
      </>
    );
  };

  const renderElasticSearchBlock = ({tree: immutableTree, config, renderBocks}: DemoQueryBuilderState) => {
    if (!renderBocks.elasticSearch) {
      return null;
    }

    const elasticSearch = elasticSearchFormat(immutableTree, config);

    return (
      <>
        <div>
          elasticSearchFormat: 
          <pre style={preStyle}>
            {stringify(elasticSearch, undefined, 2)}
          </pre>
        </div>
        <hr/>
      </>
    );
  };

  const renderJsTreeBlock = ({tree: immutableTree, config, renderBocks}: DemoQueryBuilderState) => {
    if (!renderBocks.jsTree) {
      return null;
    }

    const treeJs = getTree(immutableTree);

    return (
      <>
        <div>
          Tree: 
          <pre style={preStyle}>
            {stringify(treeJs, undefined, 2)}
          </pre>
        </div>
        <hr/>
      </>
    );
  };

  const renderSpelBlock = ({tree: immutableTree, config, renderBocks}: DemoQueryBuilderState) => {
    if (!renderBocks.spel) {
      return null;
    }

    const [spel, spelErrors] = _spelFormat(immutableTree, config);

    return (
      <>
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
      </>
    );
  };

  const renderStringsBlock = ({tree: immutableTree, config, renderBocks}: DemoQueryBuilderState) => {
    if (!renderBocks.strings) {
      return null;
    }

    const queryStr = queryString(immutableTree, config);
    const humanQueryStr = queryString(immutableTree, config, true);

    return (
      <>
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
      </>
    );
  };

  const renderSqlBlock = ({tree: immutableTree, config, renderBocks}: DemoQueryBuilderState) => {
    if (!renderBocks.sql) {
      return null;
    }

    const [sql, sqlErrors] = _sqlFormat(immutableTree, config);

    return (
      <>
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
      </>
    );
  };

  const renderSpelInputBlock = ({renderBocks} : DemoQueryBuilderState) => {
    if (!renderBocks.spel) {
      return null;
    }

    return (
      <>
        <br />
        <div className="query-import-spel">
          SpEL: &nbsp;
          <input type="text" size={150} value={state.spelStr} onChange={onChangeSpelStr} />
          <button onClick={importFromSpel}>import</button>
          <br />
          { state.spelErrors.length > 0 
              && <pre style={preErrorStyle}>
                {stringify(state.spelErrors, undefined, 2)}
              </pre> 
          }
        </div>
      </>
    );
  };

  const renderResult = (state : DemoQueryBuilderState) => {
    return (
      <div>
        <hr/>
        {renderValidationBlock(state)}
        {renderSpelBlock(state)}
        {renderStringsBlock(state)}
        {renderSqlBlock(state)}
        {renderJsonLogicBlock(state)}
        {renderMongoBlock(state)}
        {renderElasticSearchBlock(state)}
        {renderJsTreeBlock(state)}
      </div>
    );
  };

  return (
    <div>
      <div>
        Settings: &nbsp;
        <select value={state.skin} onChange={changeSkin}>
          <option key="vanilla">vanilla</option>
          <option key="antd">antd</option>
          <option key="material">material</option>
          <option key="mui">mui</option>
          <option key="bootstrap">bootstrap</option>
          <option key="fluent">fluent</option>
        </select>
        &nbsp;
        <button onClick={switchShowLock}>show lock: {state.config.settings.showLock ? "on" : "off"}</button>
        <button onClick={switchShowErrors}>show errors: {state.config.settings.showErrorMessage ? "on" : "off"}</button>
      </div>
      <div>
        Output: &nbsp;
        <button onClick={switchRenderBlock.bind(null, "validation")}>Validation: {state.renderBocks.validation ? "on" : "off"}</button>
        <button onClick={switchRenderBlock.bind(null, "jsTree")}>Tree: {state.renderBocks.jsTree ? "on" : "off"}</button>
        <button onClick={switchRenderBlock.bind(null, "jsonlogic")}>JsonLogic: {state.renderBocks.jsonlogic ? "on" : "off"}</button>
        <button onClick={switchRenderBlock.bind(null, "spel")}>SpEL: {state.renderBocks.spel ? "on" : "off"}</button>
        <button onClick={switchRenderBlock.bind(null, "strings")}>Strings: {state.renderBocks.strings ? "on" : "off"}</button>
        <button onClick={switchRenderBlock.bind(null, "sql")}>SQL: {state.renderBocks.sql ? "on" : "off"}</button>
        <button onClick={switchRenderBlock.bind(null, "mongo")}>Mongo: {state.renderBocks.mongo ? "on" : "off"}</button>
        <button onClick={switchRenderBlock.bind(null, "elasticSearch")}>ElasticSearch: {state.renderBocks.elasticSearch ? "on" : "off"}</button>
      </div>
      <div>
        Data: &nbsp;
        <button onClick={resetValue}>reset</button>
        <button onClick={clearValue}>clear</button>
        <button onClick={runActions}>run actions</button>
        <button onClick={removeNumFromConfig}>change config: remove num field</button>
      </div>
      <div>
        Validation: &nbsp;
        <button onClick={validateToConsole}>show errors in console</button>
        <button onClick={sanitizeLight}>validate</button>
        <button onClick={sanitize}>sanitize</button>
        <button onClick={sanitizeAndFix}>sanitize & fix</button>
      </div>

      {renderSpelInputBlock(state)}

      <ImportSkinStyles skin={state.skin} />
      
      <Query
        {...state.config}
        value={state.tree}
        onInit={onChange}
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
