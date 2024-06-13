import React, { useState, useCallback } from "react";
import {
  Query, Builder, BuilderProps,
  Utils as QbUtils,
  JsonSwitchGroup,
  Config,
  ImmutableTree
} from "@react-awesome-query-builder/ui";
import { LazyStyleModule } from "../utils";
// @ts-ignore
import styles from "@react-awesome-query-builder/mui/css/styles.scss";
import getConfig from "./config";

(styles as LazyStyleModule).use();

const config: Config = getConfig();

const preStyle = { backgroundColor: "darkgrey", margin: "10px", padding: "10px" };
const preErrorStyle = { backgroundColor: "lightpink", margin: "10px", padding: "10px" };

const emptyJsonTree: JsonSwitchGroup = {
  id: QbUtils.uuid(),
  type: "switch_group",
};
const emptyTree: ImmutableTree = QbUtils.loadTree(emptyJsonTree);

const ternaryJsonLogic = {
  "if": [
    {
      "and": [
        {
          "==": [
            { "var": "color" },
            "blue"
          ]
        },
        {
          "==": [
            { "var": "color" },
            "yellow"
          ]
        }
      ]
    },
    "Ukraine",
    null
  ]
};
const initialTreeFromJsonLogic: ImmutableTree = QbUtils.loadFromJsonLogic(ternaryJsonLogic, config);

const ternarySpel = "((color == 'blue' && color == 'yellow') ? 'Ukraine' : null)";
const [initialTreeFromSpel, _] = QbUtils.loadFromSpel(ternarySpel, config);

const Demo: React.FC = () => {
  const [state, setState] = useState({
    tree: initialTreeFromJsonLogic,
    // tree: initialTreeFromSpel,
    // tree: emptyTree,
    config: config,
    spelStr: "",
    spelErrors: [] as string[],
  });

  const onChange = useCallback((tree: ImmutableTree, config: Config) => {
    setState(prevState => ({ ...prevState, tree, config }));
  }, []);

  const renderBuilder = useCallback((props: BuilderProps) => (
    <div className="query-builder-container" style={{ padding: "10px" }}>
      <div className="query-builder qb-lite">
        <Builder {...props} />
      </div>
    </div>
  ), []);

  const onChangeSpelStr = (e: React.ChangeEvent<HTMLInputElement>) => {
    const spelStr = e.target.value;
    setState({
      ...state, 
      spelStr
    });
  };

  const importFromSpel = () => {
    const [tree, spelErrors] = QbUtils.loadFromSpel(state.spelStr, state.config);
    const {fixedTree, fixedErrors} = QbUtils.sanitizeTree(tree!, state.config);
    if (fixedErrors.length) {
      console.warn("Fixed errors after import from SpEL:", fixedErrors);
    }
    setState({
      ...state, 
      tree: fixedTree ?? state.tree,
      spelErrors
    });
  };

  const renderQueryBuilder = () => (
    <Query
      {...config}
      value={state.tree}
      onChange={onChange}
      renderBuilder={renderBuilder}
    />
  );

  const renderSpelInput = () => (
    <div className="query-import-spel">
      Input SpEL:
      <input type="text" size={150} value={state.spelStr} onChange={onChangeSpelStr} />
      <button onClick={importFromSpel}>import</button>
      <br />
      { state.spelErrors.length > 0 
          && <pre style={preErrorStyle}>
            {JSON.stringify(state.spelErrors, undefined, 2)}
          </pre> 
      }
    </div>
  );

  const renderSpelBlock = () => {
    const [spel, spelErrors] = QbUtils._spelFormat(state.tree, state.config);

    return (
      <>
        <div>
          spelFormat: 
          { spelErrors.length > 0 
            && <pre style={preErrorStyle}>
              {JSON.stringify(spelErrors, undefined, 2)}
            </pre> 
          }
          <pre style={preStyle}>
            {JSON.stringify(spel, undefined, 2)}
          </pre>
          Values:
          <pre>
            {JSON.stringify(QbUtils.getSwitchValues(state.tree), undefined, 2)}
          </pre>
        </div>
        <hr/>
      </>
    );
  };

  const renderJsTreeBlock = () => {
    const treeJs = QbUtils.getTree(state.tree);

    return (
      <>
        Tree:
        <pre>
          {JSON.stringify(treeJs, undefined, 2)}
        </pre>
        <br/>
        <hr/>
        <br/>
      </>
    );
  };

  const renderJsonLogicBlock = () => {
    const {logic, data: logicData, errors: logicErrors} = QbUtils.jsonLogicFormat(state.tree, state.config);

    return (
      <>
        <div>
          <a href="http://jsonlogic.com/play.html" target="_blank" rel="noopener noreferrer">jsonLogicFormat</a>: 
          { (logicErrors?.length || 0) > 0 
            && <pre style={preErrorStyle}>
              {JSON.stringify(logicErrors, undefined, 2)}
            </pre> 
          }
          { !!logic
            && <pre style={preStyle}>
              {"// Rule"}:<br />
              {JSON.stringify(logic, undefined, 2)}
              <br />
              <hr />
              {"// Data"}:<br />
              {JSON.stringify(logicData, undefined, 2)}
            </pre>
          }
        </div>
        <hr/>
      </>
    );
  };

  return (
    <div>
      {renderSpelInput()}
      {renderQueryBuilder()}
      <div className="query-builder-result">
        {renderSpelBlock()}
        {renderJsonLogicBlock()}
        {renderJsTreeBlock()}
      </div>
    </div>
  );
};

export default Demo;
