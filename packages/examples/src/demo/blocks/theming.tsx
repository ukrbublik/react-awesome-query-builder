import React, { Dispatch, SetStateAction } from "react";
import {
  Config, RenderSize,
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
    document.body.setAttribute("data-theme", themeMode);
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
          }
        },
        themeMode: themeMode,
      }
    });
    window._configChanges = state.configChanges;
    newConfig = merge(newConfig, state.configChanges);
    setState({...state, config: newConfig, themeMode});
  };

  const changeCompactMode = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const compactMode = e.target.value === "compact";
    let newConfig: Config = clone(state.config);
    state.configChanges = merge(state.configChanges, {
      settings: {
        compactMode,
      }
    });
    window._configChanges = state.configChanges;
    newConfig = merge(newConfig, state.configChanges);
    setState({...state, config: newConfig, compactMode});
  };

  const changeRenderSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const renderSize = e.target.value as RenderSize;
    let newConfig: Config = clone(state.config);
    state.configChanges = merge(state.configChanges, {
      settings: {
        renderSize,
      }
    });
    window._configChanges = state.configChanges;
    newConfig = merge(newConfig, state.configChanges);
    setState({...state, config: newConfig, renderSize});
  };

  const renderThemeModeSelector = () => {
    return (
      <select value={state.themeMode} onChange={changeThemeMode}>
        <option key="light">light</option>
        <option key="dark">dark</option>
      </select>
    );
  };

  const renderCompactModeSelector = () => {
    return (
      <select value={state.compactMode ? "compact" : "normal"} onChange={changeCompactMode}>
        <option key="normal">normal</option>
        <option key="compact">compact</option>
      </select>
    );
  };

  const renderSizeSelector = () => {
    return (
      <select value={state.renderSize} onChange={changeRenderSize}>
        <option key="small">small</option>
        <option key="medium">medium</option>
        <option key="large">large</option>
      </select>
    );
  };

  return {
    renderThemeModeSelector,
    renderCompactModeSelector,
    renderSizeSelector,
  };
};
