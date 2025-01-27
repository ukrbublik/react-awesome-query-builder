import React, { Dispatch, SetStateAction } from "react";
import {
  Config
} from "@react-awesome-query-builder/ui";
import type { DemoQueryBuilderState } from "../types";
import clone from "clone";
import merge from "lodash/merge";


export const useConfigChange = (
  state: DemoQueryBuilderState,
  setState: Dispatch<SetStateAction<DemoQueryBuilderState>>,
) => {
  const switchShowLock = () => {
    let newConfig: Config = clone(state.config);
    state.configChanges = merge(state.configChanges, {
      settings: {
        showLock: !(state.configChanges?.settings?.showLock ?? false),
      }
    });
    newConfig = merge(newConfig, state.configChanges);
    setState({...state, config: newConfig});
  };

  const switchShowErrors = () => {
    let newConfig: Config = clone(state.config);
    state.configChanges = merge(state.configChanges, {
      settings: {
        showErrorMessage: !(state.configChanges?.settings?.showErrorMessage ?? false),
      }
    });
    newConfig = merge(newConfig, state.configChanges);
    setState({...state, config: newConfig});
  };

  const renderConfigChangeHeader = () => {
    return (
      <>
        <button onClick={switchShowLock}>show lock: {state.config.settings.showLock ? "on" : "off"}</button>
        <button onClick={switchShowErrors}>show errors: {state.config.settings.showErrorMessage ? "on" : "off"}</button>
      </>
    );
  };

  return {
    renderConfigChangeHeader,
  };
};
