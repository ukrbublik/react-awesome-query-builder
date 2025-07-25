import React, { Dispatch, SetStateAction } from "react";
import {
  Utils,
  JsonLogicTree,
} from "@react-awesome-query-builder/ui";
import { SqlUtils } from "@react-awesome-query-builder/sql";
import type { DemoQueryBuilderState } from "../types";
import { validationTranslateOptions } from "../options";

const stringify = JSON.stringify;


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

  const openJsonEditor = () => {
    setState({
      ...state,
      isJsonEditorOpen: true
    });
  };

  const closeJsonEditor = () => {
    setState({
      ...state,
      isJsonEditorOpen: false
    });
  };

  const importFromJsonLogic = (jsonLogicStr: string) => {
    try {
      const jsonLogic = JSON.parse(jsonLogicStr) as JsonLogicTree;
      const [tree, jsonLogicErrors] = Utils._loadFromJsonLogic(jsonLogic, state.config);
      
      if (tree) {
        const {fixedTree, fixedErrors} = Utils.sanitizeTree(tree, state.config, validationTranslateOptions);
        if (fixedErrors.length) {
          console.warn("Fixed errors after import from JsonLogic:", fixedErrors);
        }
        setState({
          ...state,
          tree: fixedTree ?? state.tree,
          jsonLogicStr,
          jsonLogicErrors: jsonLogicErrors || [],
          isJsonEditorOpen: false
        });
      } else {
        setState({
          ...state,
          jsonLogicStr,
          jsonLogicErrors: ["Failed to parse JsonLogic"],
          isJsonEditorOpen: false
        });
      }
    } catch (error) {
      setState({
        ...state,
        jsonLogicStr,
        jsonLogicErrors: ["Invalid JSON: " + (error as Error).message],
        isJsonEditorOpen: false
      });
    }
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
            && <pre className="qb-demo-error-pre">
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
            && <pre className="qb-demo-error-pre">
              {stringify(state.sqlErrors, undefined, 2)}
            </pre> 
        }
        { state.sqlWarnings.length > 0 
            && <pre className="qb-demo-warning-pre">
              {stringify(state.sqlWarnings, undefined, 2)}
            </pre> 
        }
      </div>
    );
  };

  const renderJsonLogicInputBlock = () => {
    if (!state.renderBocks.jsonlogic) {
      return null;
    }

    return (
      <div className="query-import-jsonlogic">
        JsonLogic: &nbsp;
        <button onClick={openJsonEditor}>Open JSON Editor</button>
        <br />
        { state.jsonLogicErrors.length > 0 
            && <pre className="qb-demo-error-pre">
              {stringify(state.jsonLogicErrors, undefined, 2)}
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
        {renderJsonLogicInputBlock()}
      </div>
    );
  };

  return {
    renderInputs,
    openJsonEditor,
    closeJsonEditor,
    importFromJsonLogic,
  };
};
