import React, { useEffect } from "react";
import {
  Utils,
  ImmutableTree, Config, JsonTree, JsonLogicTree, SanitizeOptions, Actions
} from "@react-awesome-query-builder/ui";
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
  let importedTree: ImmutableTree | undefined;
  if (fileType === "logic") {
    const initLogic = initFiles[fileKey] as JsonLogicTree;
    importedTree = Utils.loadFromJsonLogic(initLogic, config);
  } else if (fileType === "tree") {
    const initValue = initFiles[fileKey] as JsonTree;
    importedTree = Utils.loadTree(initValue);
  } else {
    throw new Error(`Unknown file type ${fileType}`);
  }
  return importedTree;
};


export const initTreeWithValidation = (initFileKey: string, config: Config, validationOptions?: Partial<SanitizeOptions>) => {
  let initTree: ImmutableTree = importFromInitFile(initFileKey, config);
  const {fixedTree, fixedErrors, nonFixedErrors} = Utils.sanitizeTree(initTree, config, {
    ...(validationOptions ?? {}),
    removeEmptyGroups: false,
    removeEmptyRules: false,
    removeIncompleteRules: false,
  });
  initTree = fixedTree;
  if (fixedErrors.length) {
    console.warn("Fixed tree errors on load: ", fixedErrors);
  }
  if (nonFixedErrors.length) {
    console.warn("Validation errors on load:", nonFixedErrors);
  }
  return initTree;
};
