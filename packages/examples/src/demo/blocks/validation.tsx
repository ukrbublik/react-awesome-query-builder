import React, { Dispatch, SetStateAction } from "react";
import {
  Utils, SanitizeOptions
} from "@react-awesome-query-builder/ui";
import type { DemoQueryBuilderState } from "../types";
import { validationTranslateOptions } from "../options";

const stringify = JSON.stringify;
const preErrorStyle = { backgroundColor: "lightpink", margin: "10px", padding: "10px" };


export const useValidation = (
  state: DemoQueryBuilderState,
  setState: Dispatch<SetStateAction<DemoQueryBuilderState>>,
) => {
  const validateToConsole = () => {
    const validationErrors = Utils.validateTree(state.tree, state.config, {
      ...validationTranslateOptions,
    });
    console.warn(">>> Utils.validateTree()", validationErrors);
  };
  
  const sanitize = () => {
    const { fixedErrors, fixedTree, nonFixedErrors } = Utils.sanitizeTree(state.tree, state.config, {
      ...validationTranslateOptions,
      removeEmptyGroups: true, // default
      removeEmptyRules: true, // default
      removeIncompleteRules: true, // default
      forceFix: false, // default
    });
    if (fixedErrors.length) {
      console.warn("> sanitizeTree fixed errors:", fixedErrors);
    }
    if (nonFixedErrors.length) {
      console.warn("> sanitizeTree non-fixed validation errors:", nonFixedErrors);
    }
    setState({
      ...state,
      tree: fixedTree,
    });
  };
  
  const sanitizeLight = () => {
    const { fixedTree, allErrors } = Utils.sanitizeTree(state.tree, state.config, {
      ...validationTranslateOptions,
      removeEmptyGroups: false,
      removeEmptyRules: false,
      removeIncompleteRules: false,
      forceFix: false, // default
    });
    if (allErrors.length) {
      console.warn("> sanitizeTree validation errors:", allErrors);
    }
    setState({
      ...state,
      tree: fixedTree,
    });
  };
  
  const sanitizeAndFix = () => {
    const { fixedErrors, fixedTree, nonFixedErrors } = Utils.sanitizeTree(state.tree, state.config, {
      ...validationTranslateOptions,
      forceFix: true,
    });
    if (fixedErrors.length) {
      console.warn("> sanitizeTree fixed errors:", fixedErrors);
    }
    if (nonFixedErrors.length) {
      console.warn("> sanitizeTree non-fixed validation errors:", nonFixedErrors);
    }
    setState({
      ...state,
      tree: fixedTree,
    });
  };

  const renderValidationBlock = () => {
    const {tree: immutableTree, config, renderBocks} = state;
    if (!renderBocks.validation) {
      return null;
    }

    const isValid = Utils.isValidTree(immutableTree, config);
    const validationRes = Utils.validateTree(immutableTree, config, {
      ...validationTranslateOptions,
    }).map(({
      errors, itemStr, itemPositionStr,
    }) => ({
      errors: errors.map(({
        side, delta, str, fixed
      }) => `${fixed ? "* " : ""}${side ? `[${[side, delta].filter(a => a != undefined).join(" ")}] ` : ""}${str!}`),
      itemStr,
      itemPositionStr,
    }));

    return (
      <>
        <hr/>
        {isValid ? null : <pre style={preErrorStyle}>{"Tree has errors"}</pre>}
        <div>
          Validation errors: 
          { validationRes.length > 0
            ? <pre style={preErrorStyle}>
              {stringify(validationRes, undefined, 2)}
            </pre>
            : "no"
          }
        </div>
      </>
    );
  };

  const renderValidationHeader = () => {
    return (
      <>
        <button onClick={validateToConsole}>Show errors in console</button>
        <button onClick={sanitizeLight}>Validate</button>
        <button onClick={sanitize}>Sanitize</button>
        <button onClick={sanitizeAndFix}>Sanitize & fix</button>
      </>
    );
  };

  return {
    renderValidationHeader,
    renderValidationBlock,
  };
};

