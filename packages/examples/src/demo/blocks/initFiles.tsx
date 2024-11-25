import React, { Dispatch, SetStateAction } from "react";
import {
  ImmutableTree,
} from "@react-awesome-query-builder/ui";
import type { DemoQueryBuilderState } from "../types";
import { importFromInitFile } from "../utils";
import { initFiles } from "../init_data";

const stringify = JSON.stringify;
const preErrorStyle = { backgroundColor: "lightpink", margin: "10px", padding: "10px" };


export const useInitFiles = (
  state: DemoQueryBuilderState,
  setState: Dispatch<SetStateAction<DemoQueryBuilderState>>,
) => {
  const changeInitFile = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newInitFile = e.target.value;
    const {tree: importedTree, errors} = importFromInitFile(newInitFile,  state.config);
    setState({
      ...state,
      initFile: newInitFile,
      tree: importedTree,
      initErrors: errors,
    });
    window._initFile = newInitFile;
  };

  const loadFromInitFile = () => {
    const {tree: importedTree, errors} = importFromInitFile(state.initFile,  state.config);
    setState({
      ...state,
      tree: importedTree,
      initErrors: errors,
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

  const renderInitErrors = () => {
    return (
      <>
        { state.initErrors.length > 0 
          && <pre style={preErrorStyle}>
            {stringify(state.initErrors, undefined, 2)}
          </pre> 
        }
      </>
    );
  };

  return {
    renderInitFilesHeader,
    renderInitErrors,
  };
};
