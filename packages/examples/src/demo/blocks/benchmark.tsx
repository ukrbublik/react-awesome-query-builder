import React, { Dispatch, SetStateAction, MutableRefObject } from "react";
import {
  Utils,
} from "@react-awesome-query-builder/ui";
import type { DemoQueryBuilderState, DemoQueryBuilderMemo } from "../types";
import { useActions } from "./actions";
import { initFiles } from "../init_data";
import { importFromInitFile } from "../utils";
import { validationTranslateOptions } from "../options";


export const useBenchmark = (
  state: DemoQueryBuilderState,
  setState: Dispatch<SetStateAction<DemoQueryBuilderState>>,
  memo: MutableRefObject<DemoQueryBuilderMemo>,
) => {
  const { runActions } = useActions(state, setState, memo);

  const timeValidation = () => {
    const tree = state.tree;
    const config = state.config;
    const run = () => {
      Utils.validateTree(tree, config, {
        ...validationTranslateOptions,
      });
    };

    // cold
    run();

    if (state.renderBocks.withProfile) {
      console.profile();
    }
    console.time("validation");

    // hot
    const cnt = state.renderBocks.withProfile ? 1 : 10;
    for (let i = 0 ; i < cnt ; i++) {
      run();
    }

    console.timeEnd("validation");
    if (state.renderBocks.withProfile) {
      console.profileEnd();
    }
  };

  const timeExport = () => {
    const tree = state.tree;
    const config = state.config;
    const run = () => {
      Utils._spelFormat(tree, config);
      Utils._mongodbFormat(tree, config);
      Utils._sqlFormat(tree, config);
      Utils.jsonLogicFormat(tree, config);
      Utils.elasticSearchFormat(tree, config);
      Utils.queryString(tree, config);
    };

    // cold
    run();

    if (state.renderBocks.withProfile) {
      console.profile();
    }
    console.time("export");

    // hot
    const cnt = state.renderBocks.withProfile ? 1 : 10;
    for (let i = 0 ; i < cnt ; i++) {
      run();
    }

    console.timeEnd("export");
    if (state.renderBocks.withProfile) {
      console.profileEnd();
    }
  };

  const timeImport = () => {
    const config = state.config;
    const run = () => {
      for (const fileKey in initFiles) {
        importFromInitFile(fileKey, config);
      }
    };

    // cold
    run();

    if (state.renderBocks.withProfile) {
      console.profile();
    }
    console.time("import");

    // hot
    const cnt = state.renderBocks.withProfile ? 1 : 10;
    for (let i = 0 ; i < cnt ; i++) {
      run();
    }

    console.timeEnd("import");
    if (state.renderBocks.withProfile) {
      console.profileEnd();
    }
  };

  const timeActions = () => {
    const run = () => {
      runActions();
    };

    if (state.renderBocks.withProfile) {
      console.profile();
    }
    console.time("actions");

    run();

    console.timeEnd("actions");
    if (state.renderBocks.withProfile) {
      console.profileEnd();
    }
  };

  const switchRenderBlock = (blockName: string) => {
    setState({...state, renderBocks: {...state.renderBocks, [blockName]: !state.renderBocks[blockName]}});
  };

  const renderBenchmarkHeader = () => {
    return (
      <>
        <button onClick={timeExport}>Export</button>
        <button onClick={timeImport}>Import</button>
        <button onClick={timeValidation}>Validation</button>
        <button onClick={timeActions}>Actions</button>
        <button onClick={switchRenderBlock.bind(null, "withProfile")}>with profile: {state.renderBocks.withProfile ? "on" : "off"}</button>
      </>
    );
  };

  return {
    renderBenchmarkHeader,
  };
};
