import React, { Dispatch, SetStateAction } from "react";
import {
  ImmutableTree,
} from "@react-awesome-query-builder/ui";
import type { DemoQueryBuilderState } from "../types";
import { importFromInitFile, initTreeWithValidation } from "../utils";
import { initFiles } from "../init_data";

const stringify = JSON.stringify;


export const useInitFiles = (
  state: DemoQueryBuilderState,
  setState: Dispatch<SetStateAction<DemoQueryBuilderState>>,
) => {
  const changeInitFile = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newInitFile = e.target.value;
    const {tree: importedTree, errors} = initTreeWithValidation(newInitFile,  state.config);
    setState({
      ...state,
      initFile: newInitFile,
      tree: importedTree,
      initErrors: errors,
    });
    window._initFile = newInitFile;
  };

  const loadFromInitFile = () => {
    const {tree: importedTree, errors} = initTreeWithValidation(state.initFile,  state.config);
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
          && <pre className="qb-demo-error-pre">
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
