import React, { Dispatch, SetStateAction, useState } from "react";
import {
  Utils,
} from "@react-awesome-query-builder/ui";
import { SqlUtils } from "@react-awesome-query-builder/sql";
import type { DemoQueryBuilderState } from "../types";
import { validationTranslateOptions } from "../options";

// Try to import the correct type
import type { JsonLogicTree, JsonLogicFunction } from "@react-awesome-query-builder/ui";

const stringify = JSON.stringify;

export const useInput = (
  state: DemoQueryBuilderState,
  setState: Dispatch<SetStateAction<DemoQueryBuilderState>>,
) => {
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [jsonLogicStr, setJsonLogicStr] = useState("");
  const [jsonLogicErrors, setJsonLogicErrors] = useState<string[]>([]);

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

  const onChangeJsonLogicStr = (value: string) => {
    setJsonLogicStr(value);
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

  const importFromJsonLogic = () => {
    try {
      // Parse the JSON string with proper typing
      const jsonLogicObj: unknown = JSON.parse(jsonLogicStr);
      
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const tree = Utils.loadFromJsonLogic(jsonLogicObj as JsonLogicFunction, state.config);
      
      const {fixedTree, fixedErrors} = Utils.sanitizeTree(tree!, state.config, validationTranslateOptions);
      if (fixedErrors.length) {
        console.warn("Fixed errors after import from JsonLogic:", fixedErrors);
      }
      
      setState({
        ...state,
        tree: fixedTree ?? state.tree,
      });
      
      setJsonLogicErrors([]);
      setShowJsonEditor(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid JSON format";
      setJsonLogicErrors([errorMessage]);
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
        <button onClick={() => setShowJsonEditor(true)}>Open JSON Editor</button>
        <br />
        
        {showJsonEditor && (
          <div className="json-editor-modal" style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "20px",
            zIndex: 1000,
            width: "80%",
            maxWidth: "800px",
            maxHeight: "80%",
            overflow: "auto",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h3>Import from JsonLogic</h3>
              <button onClick={() => setShowJsonEditor(false)} style={{ fontSize: "18px", cursor: "pointer" }}>×</button>
            </div>
            
            <textarea
              value={jsonLogicStr}
              onChange={(e) => onChangeJsonLogicStr(e.target.value)}
              placeholder='Enter JsonLogic JSON here, e.g.: {"==": [{"var": "name"}, "John"]}'
              style={{
                width: "100%",
                height: "300px",
                fontFamily: "monospace",
                fontSize: "14px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                resize: "vertical"
              }}
            />
            
            <div style={{ marginTop: "10px", display: "flex", gap: "10px" }}>
              <button onClick={importFromJsonLogic} style={{ padding: "8px 16px" }}>
                Import
              </button>
              <button onClick={() => setShowJsonEditor(false)} style={{ padding: "8px 16px" }}>
                Cancel
              </button>
            </div>
            
            {jsonLogicErrors.length > 0 && (
              <pre className="qb-demo-error-pre" style={{ marginTop: "10px" }}>
                {stringify(jsonLogicErrors, undefined, 2)}
              </pre>
            )}
          </div>
        )}
        
        {showJsonEditor && (
          <div 
            className="json-editor-backdrop"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 999
            }}
            onClick={() => setShowJsonEditor(false)}
          />
        )}
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
  };
};