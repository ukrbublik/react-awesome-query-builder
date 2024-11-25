import React, { Dispatch, SetStateAction } from "react";
import {
  Utils,
} from "@react-awesome-query-builder/ui";
import { SqlUtils } from "@react-awesome-query-builder/sql";
import type { DemoQueryBuilderState } from "../types";
import { validationTranslateOptions } from "../options";

const stringify = JSON.stringify;
const preErrorStyle = { backgroundColor: "lightpink", margin: "10px", padding: "10px" };
const preWarningStyle = { backgroundColor: "lightyellow", margin: "10px", padding: "10px" };


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

  const onChangeSqlStr = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sqlStr = e.target.value;
    setState({
      ...state,
      sqlStr
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

  const importFromSql = () => {
    const {tree, errors: sqlErrors, warnings: sqlWarnings} = SqlUtils.loadFromSql(state.sqlStr, state.config);
    const {fixedTree, fixedErrors} = Utils.sanitizeTree(tree!, state.config, validationTranslateOptions);
    if (fixedErrors.length) {
      console.warn("Fixed errors after import from SQL:", fixedErrors);
    }
    setState({
      ...state, 
      tree: fixedTree ?? state.tree,
      sqlErrors,
      sqlWarnings,
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

  const renderSqlInputBlock = () => {
    if (!state.renderBocks.sql) {
      return null;
    }

    return (
      <div className="query-import-sql">
        SQL: &nbsp;
        <input type="text" size={150} value={state.sqlStr} onChange={onChangeSqlStr} />
        <button onClick={importFromSql}>import</button>
        <br />
        { state.sqlErrors.length > 0 
            && <pre style={preErrorStyle}>
              {stringify(state.sqlErrors, undefined, 2)}
            </pre> 
        }
        { state.sqlWarnings.length > 0 
            && <pre style={preWarningStyle}>
              {stringify(state.sqlWarnings, undefined, 2)}
            </pre> 
        }
      </div>
    );
  };

  const renderInputs = () => {
    return (
      <div>
        <br />
        {renderSpelInputBlock()}
        {renderSqlInputBlock()}
      </div>
    );
  };

  return {
    renderInputs,
  };
};
