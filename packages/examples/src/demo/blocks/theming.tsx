import React, { Dispatch, SetStateAction } from "react";
import {
  Config,
} from "@react-awesome-query-builder/ui";
import type { DemoQueryBuilderState } from "../types";
import clone from "clone";
import merge from "lodash/merge";


export const useThemeing = (
  state: DemoQueryBuilderState,
  setState: Dispatch<SetStateAction<DemoQueryBuilderState>>,
) => {
  const changeThemeMode = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const themeMode = e.target.value as DemoQueryBuilderState["themeMode"];
    let newConfig: Config = clone(state.config);
    state.configChanges = merge(state.configChanges, {
      settings: {
        theme: {
          mui: {
            palette: {
              mode: themeMode
            }
          },
          antd: {
            darkMode: themeMode === "dark"
          }
        }
      }
    });
    newConfig = merge(newConfig, state.configChanges);
    setState({...state, config: newConfig, themeMode});
  };

  const renderThemeModeSelector = () => {
    return (
      <select value={state.themeMode} onChange={changeThemeMode}>
        <option key="light">light</option>
        <option key="dark">dark</option>
      </select>
    );
  };

  return {
    renderThemeModeSelector,
  };
};
