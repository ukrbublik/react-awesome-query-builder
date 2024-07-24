import React, { useState, useCallback, useRef } from "react";
import {
  Query, Builder, Utils, 
  //types:
  BuilderProps, ImmutableTree, Config, ActionMeta, Actions
} from "@react-awesome-query-builder/ui";
import throttle from "lodash/throttle";
import ImportSkinStyles from "../skins";
import loadConfig from "./config";
import {
  useActions, useValidation, useBenchmark, useOutput, useInput, useInitFiles, useConfigChange, useSkins, useBlocksSwitcher,
} from "./blocks";
import { initTreeWithValidation, dispatchHmrUpdate, useHmrUpdate } from "./utils";
import type { DemoQueryBuilderState, DemoQueryBuilderMemo } from "./types";
import { emptyTree } from "./init_data";
import { defaultInitFile, initialSkin, validationTranslateOptions, defaultRenderBlocks } from "./options";
import "./i18n";

// Load config and initial tree
const loadedConfig = loadConfig(initialSkin);
const initTree = initTreeWithValidation(defaultInitFile, loadedConfig, validationTranslateOptions);

// Trick for HMR: triggers callback put in useHmrUpdate on every update from HMR
dispatchHmrUpdate(loadedConfig, initTree);

//
// Demo component
//
const DemoQueryBuilder: React.FC = () => {
  const memo: React.MutableRefObject<DemoQueryBuilderMemo> = useRef({});

  const [state, setState] = useState<DemoQueryBuilderState>({
    tree: initTree, 
    config: loadedConfig,
    skin: initialSkin,
    spelStr: "",
    spelErrors: [] as Array<string>,
    renderBocks: defaultRenderBlocks,
    initFile: defaultInitFile,
  });

  // Trick for HMR
  useHmrUpdate(useCallback(({config}) => {
    setState(state => ({ ...state, config }));
  }, []));

  const { renderRunActions } = useActions(state, setState, memo);
  const { renderValidationHeader, renderValidationBlock } = useValidation(state, setState);
  const { renderBenchmarkHeader } = useBenchmark(state, setState, memo);
  const { renderOutput } = useOutput(state);
  const { renderSpelInputBlock } = useInput(state, setState);
  const { renderConfigChangeHeader } = useConfigChange(state, setState);
  const { renderInitFilesHeader } = useInitFiles(state, setState);
  const { renderSkinSelector } = useSkins(state, setState);
  const { renderBlocksSwitcher } = useBlocksSwitcher(state, setState);


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
    if (actionMeta && state.renderBocks.actions) {
      console.info(actionMeta);
    }
    memo.current.immutableTree = immutableTree;
    memo.current.config = config;
    memo.current.actions = actions;
    updateResult();
  }, [state.renderBocks]);

  const updateResult = throttle(() => {
    setState(prevState => ({
      ...prevState,
      tree: memo.current.immutableTree!,
      config: memo.current.config!
    }));
  }, 100);

  const clearValue = () => {
    setState({
      ...state,
      tree: Utils.loadTree(emptyTree), 
    });
  };

  return (
    <div>
      <div>
        Settings: &nbsp;
        {renderSkinSelector()}
        &nbsp;
        {renderConfigChangeHeader()}
      </div>
      <div>
        Output: &nbsp;
        {renderBlocksSwitcher()}
      </div>
      <div>
        Data: &nbsp;
        {renderInitFilesHeader()}
        <button onClick={clearValue}>Clear</button>
        {renderRunActions()}
      </div>
      <div>
        Validation: &nbsp;
        {renderValidationHeader()}
      </div>
      <div>
        Benchmark: &nbsp;
        {renderBenchmarkHeader()}
      </div>

      <br />
      {renderSpelInputBlock()}

      <ImportSkinStyles skin={state.skin} />

      {state.renderBocks.queryBuilder && <Query
        {...state.config}
        value={state.tree}
        onInit={onChange}
        onChange={onChange}
        renderBuilder={renderBuilder}
      />}

      <div className="query-builder-result">
        <div>
          {renderValidationBlock()}
          {renderOutput()}
        </div>
      </div>
    </div>
  );
};


export default DemoQueryBuilder;
