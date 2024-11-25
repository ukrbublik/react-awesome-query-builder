import React, { useEffect } from "react";
import {
  Utils,
  ImmutableTree, Config, JsonTree, JsonLogicTree, SanitizeOptions, Actions
} from "@react-awesome-query-builder/ui";
import { SqlUtils } from "@react-awesome-query-builder/sql";
import { initFiles } from "./init_data";


// Trick for HMR
export const dispatchHmrUpdate = (loadedConfig: Config, initTree: ImmutableTree) => {
  const updateEvent = new CustomEvent<CustomEventDetail>("update", { detail: {
    config: loadedConfig,
    initTree: initTree,
  } });
  window.dispatchEvent(updateEvent);
};

export interface CustomEventDetail {
  config: Config;
  initTree: ImmutableTree;
}

export const useHmrUpdate = (callback: (detail: CustomEventDetail) => void) => {
  useEffect(() => {
    window.addEventListener("update", onHotUpdate);
    return () => {
      window.removeEventListener("update", onHotUpdate);
    };
  });

  const onHotUpdate = (e: Event) => {
    const {detail} = e as CustomEvent<CustomEventDetail>;
    console.log("Updating...");
    callback(detail);
  };
};

////////

export const importFromInitFile = (fileKey: string, config?: Config) => {
  const fileType = fileKey.split("/")[0];
  let tree: ImmutableTree | undefined;
  let errors: string[] = [];
  if (fileType === "logic") {
    const initLogic = initFiles[fileKey] as JsonLogicTree;
    tree = Utils.loadFromJsonLogic(initLogic, config);
  } else if (fileType === "sql") {
    const initValue = initFiles[fileKey] as string;
    ({tree, errors} = SqlUtils.loadFromSql(initValue, config));
  } else if (fileType === "spel") {
    const initValue = initFiles[fileKey] as string;
    [tree, errors] = Utils.loadFromSpel(initValue, config);
  } else if (fileType === "tree") {
    const initValue = initFiles[fileKey] as JsonTree;
    tree = Utils.loadTree(initValue);
  } else {
    throw new Error(`Unknown file type ${fileType}`);
  }
  if (errors.length) {
    console.warn(`Errors while importing from ${fileKey} as ${fileType}:`, errors);
  }
  return {tree, errors};
};


export const initTreeWithValidation = (initFileKey: string, config: Config, validationOptions?: Partial<SanitizeOptions>) => {
  let tree: ImmutableTree;
  let errors: string[];
  ({tree, errors} = importFromInitFile(initFileKey, config));
  const {fixedTree, fixedErrors, nonFixedErrors} = Utils.sanitizeTree(tree, config, {
    ...(validationOptions ?? {}),
    removeEmptyGroups: false,
    removeEmptyRules: false,
    removeIncompleteRules: false,
  });
  tree = fixedTree;
  if (fixedErrors.length) {
    console.warn("Fixed tree errors on load: ", fixedErrors);
  }
  if (nonFixedErrors.length) {
    console.warn("Validation errors on load:", nonFixedErrors);
  }
  return {tree, errors};
};
