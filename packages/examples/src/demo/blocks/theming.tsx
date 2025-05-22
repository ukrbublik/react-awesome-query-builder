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
  const changeBodyIsDark = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isBodyDark = e.target.checked;
    const themeMode = isBodyDark ? "dark" : "light";
    document.body.setAttribute("data-theme", themeMode);
    setState({...state, isBodyDark});
  };

  const changeUseOldDesign = (e: React.ChangeEvent<HTMLInputElement>) => {
    const useOldDesign = e.target.checked;
    let newConfig: Config = clone(state.config);
    state.configChanges = merge(state.configChanges, {
      settings: {
        designSettings: {
          generateCssVarsFromThemeLibrary: !useOldDesign,
        },
      }
    });
    window._configChanges = state.configChanges;
    newConfig = merge(newConfig, state.configChanges);
    setState({...state, config: newConfig, useOldDesign});
  };
    
  const changeThemeMode = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const themeMode = e.target.value as DemoQueryBuilderState["themeMode"];
    // document.body.setAttribute("data-theme", themeMode);
    let newConfig: Config = clone(state.config);
    state.configChanges = merge(state.configChanges, {
      settings: {
        themeMode: themeMode === "auto" ? null : themeMode,
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

  const changeLiteMode = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const liteMode = e.target.value === "lite";
    let newConfig: Config = clone(state.config);
    state.configChanges = merge(state.configChanges, {
      settings: {
        liteMode,
      }
    });
    window._configChanges = state.configChanges;
    newConfig = merge(newConfig, state.configChanges);
    setState({...state, config: newConfig, liteMode});
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

  const renderBodyIsDarkSelector = () => {
    return (
      <>
        <input id="dark-page" type="checkbox" checked={state.isBodyDark} onChange={changeBodyIsDark} />
        <label htmlFor="dark-page">dark page</label>
      </>
    );
  };

  const renderUseOldDesignSelector = () => {
    return (
      <>
        <input id="use-old-design" type="checkbox" checked={state.useOldDesign} onChange={changeUseOldDesign} />
        <label htmlFor="use-old-design">use old design</label>
      </>
    );
  };

  const renderThemeModeSelector = () => {
    return (
      <select value={state.themeMode ?? "light"} onChange={changeThemeMode}>
        {/* <option key="auto">auto</option> */}
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

  const renderLiteModeSelector = () => {
    return (
      <select value={state.liteMode ? "lite" : "full"} onChange={changeLiteMode}>
        <option key="full">full</option>
        <option key="lite">lite</option>
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
    renderBodyIsDarkSelector,
    renderUseOldDesignSelector,
    renderCompactModeSelector,
    renderLiteModeSelector,
    renderSizeSelector,
  };
};
