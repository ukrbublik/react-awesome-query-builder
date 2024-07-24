import React, { Dispatch, SetStateAction } from "react";
import {
  ImmutableTree,
} from "@react-awesome-query-builder/ui";
import type { DemoQueryBuilderState } from "../types";
import { importFromInitFile } from "../utils";
import { initFiles } from "../init_data";


export const useInitFiles = (
  state: DemoQueryBuilderState,
  setState: Dispatch<SetStateAction<DemoQueryBuilderState>>,
) => {
  const changeInitFile = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newInitFile = e.target.value;
    const importedTree: ImmutableTree = importFromInitFile(newInitFile,  state.config);
    setState({
      ...state,
      initFile: newInitFile,
      tree: importedTree,
    });
    window._initFile = newInitFile;
  };

  const loadFromInitFile = () => {
    const importedTree: ImmutableTree = importFromInitFile(state.initFile,  state.config);
    setState({
      ...state,
      tree: importedTree,
    });
  };

  const renderInitFilesHeader = () => {
    return (
      <>
        <select value={state.initFile} onChange={changeInitFile}>
          {Object.keys(initFiles).map((fileKey) => {
            return (
              <option key={fileKey}>{fileKey}</option>
            );
          })}
        </select>
        <button onClick={loadFromInitFile}>Reload</button>
      </>
    );
  };

  return {
    renderInitFilesHeader,
  };
};
