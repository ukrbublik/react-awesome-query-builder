import React, { Dispatch, SetStateAction } from "react";
import {
  Utils,
} from "@react-awesome-query-builder/ui";
import type { DemoQueryBuilderState } from "../types";
import { validationTranslateOptions } from "../options";

const stringify = JSON.stringify;
const preErrorStyle = { backgroundColor: "lightpink", margin: "10px", padding: "10px" };


export const useInput = (
  state: DemoQueryBuilderState,
  setState: Dispatch<SetStateAction<DemoQueryBuilderState>>,
) => {
  const onChangeSpelStr = (e: React.ChangeEvent<HTMLInputElement>) => {
    const spelStr = e.target.value;
    setState({
      ...state,
      spelStr
    });
  };

  const importFromSpel = () => {
    const [tree, spelErrors] = Utils.loadFromSpel(state.spelStr, state.config);
    const {fixedTree, fixedErrors} = Utils.sanitizeTree(tree!, state.config, validationTranslateOptions);
    if (fixedErrors.length) {
      console.warn("Fixed errors after import from SpEL:", fixedErrors);
    }
    setState({
      ...state, 
      tree: fixedTree ?? state.tree,
      spelErrors
    });
  };

  const renderSpelInputBlock = () => {
    if (!state.renderBocks.spel) {
      return null;
    }

    return (
      <div className="query-import-spel">
        SpEL: &nbsp;
        <input type="text" size={150} value={state.spelStr} onChange={onChangeSpelStr} />
        <button onClick={importFromSpel}>import</button>
        <br />
        { state.spelErrors.length > 0 
            && <pre style={preErrorStyle}>
              {stringify(state.spelErrors, undefined, 2)}
            </pre> 
        }
      </div>
    );
  };

  return {
    renderSpelInputBlock,
  };
};
