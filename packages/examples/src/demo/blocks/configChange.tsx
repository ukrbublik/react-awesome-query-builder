import React, { Dispatch, SetStateAction } from "react";
import {
  Config
} from "@react-awesome-query-builder/ui";
import type { DemoQueryBuilderState } from "../types";
import clone from "clone";


export const useConfigChange = (
  state: DemoQueryBuilderState,
  setState: Dispatch<SetStateAction<DemoQueryBuilderState>>,
) => {
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
