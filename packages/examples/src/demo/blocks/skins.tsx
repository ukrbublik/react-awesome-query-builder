import React, { Dispatch, SetStateAction } from "react";
import {
  Utils,
} from "@react-awesome-query-builder/ui";
import type { DemoQueryBuilderState } from "../types";
import loadConfig from "../config";
import { validationTranslateOptions } from "../options";


export const useSkins = (
  state: DemoQueryBuilderState,
  setState: Dispatch<SetStateAction<DemoQueryBuilderState>>,
) => {
  const changeSkin = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const skin = e.target.value;
    const config = loadConfig(e.target.value);
    const {fixedTree, fixedErrors, nonFixedErrors} = Utils.sanitizeTree(state.tree, config, {
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

  const renderSkinSelector = () => {
    return (
      <select value={state.skin} onChange={changeSkin}>
        <option key="vanilla">vanilla</option>
        <option key="antd">antd</option>
        <option key="material">material</option>
        <option key="mui">mui</option>
        <option key="bootstrap">bootstrap</option>
        <option key="fluent">fluent</option>
      </select>
    );
  };

  return {
    renderSkinSelector,
  };
};
