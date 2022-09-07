import React, { useState, useCallback } from "react";
import {
  Query, Builder, Utils as QbUtils,
  JsonSwitchGroup,
  Config,
  ImmutableTree,
  BuilderProps
} from "@react-awesome-query-builder/core";
import "@react-awesome-query-builder/core/css/styles.scss";
import getConfig from "./config";

const config: Config = getConfig();

const preStyle = { backgroundColor: "darkgrey", margin: "10px", padding: "10px" };
const preErrorStyle = { backgroundColor: "lightpink", margin: "10px", padding: "10px" };

const emptyJsonTree: JsonSwitchGroup = {
  id: QbUtils.uuid(),
  type: "switch_group",
};
const emptyTree: ImmutableTree = QbUtils.checkTree(QbUtils.loadTree(emptyJsonTree), config);


const Demo: React.FC = () => {
  const [state, setState] = useState({
    tree: emptyTree,
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
    setState({
      ...state, 
      tree: tree ? QbUtils.checkTree(tree, state.config) : state.tree,
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

  const renderSpelOutput = () => (
    <div className="query-builder-result">
      Output SpEL:
      <pre>
        {QbUtils.spelFormat(state.tree, state.config)}
      </pre>
      Values:
      <pre>
        {JSON.stringify(QbUtils.getSwitchValues(state.tree), undefined, 2)}
      </pre>
    </div>
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

  return (
    <div>
      {renderSpelInput()}
      {renderQueryBuilder()}
      {renderSpelOutput()}
    </div>
  );
};

export default Demo;
