import React, { useState, useCallback, useRef } from "react";
import {
  Query, Builder, Utils, 
  //types:
  BuilderProps, ImmutableTree, Config, ActionMeta, Actions
} from "@react-awesome-query-builder/ui";
import throttle from "lodash/throttle";
import merge from "lodash/merge";
import ImportSkinStyles from "../skins";
import loadConfig from "./config";
import {
  useActions, useValidation, useBenchmark, useOutput, useInput, useInitFiles, useConfigChange, useSkins, useBlocksSwitcher,
  useThemeing,
} from "./blocks";
import { initTreeWithValidation, dispatchHmrUpdate, useHmrUpdate } from "./utils";
import type { DemoQueryBuilderState, DemoQueryBuilderMemo } from "./types";
import { emptyTree } from "./init_data";
import { defaultInitFile, initialSkin, validationTranslateOptions, defaultRenderBlocks } from "./options";
import type { LazyStyleModule } from "../skins/utils";
import "./i18n";

// @ts-ignore
import mainStyles from "../skins/styles.scss";
(mainStyles as LazyStyleModule).use();

// Load config and initial tree
const loadedConfig = merge(loadConfig(window._initialSkin || initialSkin), window._configChanges ?? {});
const {tree: initTree, errors: initErrors} = initTreeWithValidation(window._initFile || defaultInitFile, loadedConfig, validationTranslateOptions);

// Trick for HMR: triggers callback put in useHmrUpdate on every update from HMR
dispatchHmrUpdate(loadedConfig, initTree);

//
// Demo component
//
const DemoQueryBuilder: React.FC = () => {
  const memo: React.MutableRefObject<DemoQueryBuilderMemo> = useRef({});

  const [state, setState] = useState<DemoQueryBuilderState>({
    tree: initTree,
    initErrors: initErrors,
    config: loadedConfig,
    skin: initialSkin,
    spelStr: "",
    sqlStr: "",
    spelErrors: [] as Array<string>,
    sqlErrors: [] as Array<string>,
    sqlWarnings: [] as Array<string>,
    renderBocks: defaultRenderBlocks,
    initFile: defaultInitFile,
    themeMode: "light",
    renderSize: "small",
    compactMode: false,
    configChanges: {},
  });

  // Trick for HMR
  useHmrUpdate(useCallback(({config}) => {
    setState(state => ({ ...state, config }));
  }, []));

  const { renderRunActions } = useActions(state, setState, memo);
  const { renderValidationHeader, renderValidationBlock } = useValidation(state, setState);
  const { renderBenchmarkHeader } = useBenchmark(state, setState, memo);
  const { renderOutput } = useOutput(state);
  const { renderInputs } = useInput(state, setState);
  const { renderConfigChangeHeader } = useConfigChange(state, setState);
  const { renderInitFilesHeader, renderInitErrors } = useInitFiles(state, setState);
  const { renderSkinSelector } = useSkins(state, setState);
  const { renderBlocksSwitcher } = useBlocksSwitcher(state, setState);
  const { renderThemeModeSelector, renderCompactModeSelector, renderSizeSelector } = useThemeing(state, setState);


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
    setState(prevState => {
      const tree = memo.current.immutableTree!;
      const config = Utils.ConfigUtils.areConfigsSame(memo.current.config, prevState.config) ? prevState.config : memo.current.config;
      return {
        ...prevState,
        tree,
        config,
      };
    });
  }, 100);

  const clearValue = () => {
    setState({
      ...state,
      tree: Utils.loadTree(emptyTree), 
      initErrors: [],
    });
  };

  return (
    <div>
      <div>
        Theme: &nbsp;
        {renderSkinSelector()}
        {renderThemeModeSelector()}
        {renderCompactModeSelector()}
        {renderSizeSelector()}
      </div>
      <div>
        Settings: &nbsp;
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
        {renderInitErrors()}
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

      {renderInputs()}

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
