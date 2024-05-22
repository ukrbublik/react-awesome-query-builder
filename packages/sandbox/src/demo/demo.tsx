/*eslint @typescript-eslint/no-unused-vars: ["off", {"varsIgnorePattern": "^_"}]*/
import React from "react";
import {
  Utils, Query, Builder,
  //types:
  BuilderProps, ImmutableTree, Config, JsonTree, JsonLogicTree
} from "@react-awesome-query-builder/mui";
import throttle from "lodash/throttle";
import loadedConfigMui from "./config_mui";
import loadedConfigAntd from "./config_antd";
import loadedInitValue from "./init_value";
import loadedInitLogic from "./init_logic";
const stringify = JSON.stringify;
const {jsonLogicFormat, queryString, mongodbFormat, sqlFormat, getTree, loadTree, uuid, loadFromJsonLogic} = Utils;
const preStyle = { backgroundColor: "darkgrey", margin: "10px", padding: "10px" };
const preErrorStyle = { backgroundColor: "lightpink", margin: "10px", padding: "10px" };

const emptyInitValue: JsonTree = {"id": uuid(), "type": "group"};
// get init value in JsonTree format:
const initValue: JsonTree = loadedInitValue && Object.keys(loadedInitValue).length > 0 ? loadedInitValue as JsonTree : emptyInitValue;
const initTree: ImmutableTree = loadTree(initValue);

// -OR- alternativaly get init value in JsonLogic format:
//const initLogic: JsonLogicTree = loadedInitLogic && Object.keys(loadedInitLogic).length > 0 ? loadedInitLogic : undefined;
//const initTree: ImmutableTree = loadFromJsonLogic(initLogic, loadedConfig);

interface DemoQueryBuilderProps {
  skin: string;
}
interface DemoQueryBuilderState {
  tree: ImmutableTree;
  config: Config;
}
interface DemoQueryBuilderMemo {
  tree: ImmutableTree;
  config: Config;
}

const DemoQueryBuilder: React.FC<DemoQueryBuilderProps> = ({
  skin,
}) => {
  const loadedConfig = React.useMemo(() => (skin === "mui" ? loadedConfigMui : loadedConfigAntd), [skin]);
  const [state, setState] = React.useState<DemoQueryBuilderState>({
    tree: initTree,
    config: loadedConfig, 
  });
  const memo: React.MutableRefObject<DemoQueryBuilderMemo> = React.useRef({
    tree: state.tree,
    config: state.config,
  });

  React.useEffect(() => {
    setState(state => ({ ...state, config: loadedConfig }));
  }, [loadedConfig]);

  const resetValue = React.useCallback(() => {
    setState({
      ...state,
      tree: initTree, 
    });
  }, []);

  const clearValue = React.useCallback(() => {
    setState({
      ...state,
      tree: loadTree(emptyInitValue), 
    });
  }, []);

  const renderBuilder = React.useCallback((props: BuilderProps) => (
    <div className="query-builder-container" style={{padding: "10px"}}>
      <div className="query-builder qb-lite">
        <Builder {...props} />
      </div>
    </div>
  ), []);

  const onChange = React.useCallback((immutableTree: ImmutableTree, config: Config) => {
    // `jsonTree` or `logic` can be saved to backend
    // (and then loaded with `loadTree` or `loadFromJsonLogic` as seen above)
    const jsonTree = getTree(immutableTree);
    const {logic, data, errors} = jsonLogicFormat(immutableTree, config);

    memo.current.tree = immutableTree;
    memo.current.config = config;
    updateResult();
  }, []);

  const updateResult = throttle(() => {
    setState({
      ...state,
      tree: memo.current.tree,
      config: memo.current.config,
    });
  }, 100);

  const renderResult = ({tree: immutableTree, config} : {tree: ImmutableTree, config: Config}) => {
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
          { (errors?.length || 0) > 0 
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
  };


  return (
    <div>
      <Query 
        {...state.config} 
        value={state.tree}
        onChange={onChange}
        renderBuilder={renderBuilder}
      />

      <button onClick={resetValue}>reset</button>
      <button onClick={clearValue}>clear</button>

      <div className="query-builder-result">
        {renderResult(state)}
      </div>
    </div>
  );

};

export default DemoQueryBuilder;
