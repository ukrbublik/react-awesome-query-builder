import {immutableEqual} from "../utils/stuff";
import { Utils } from "@react-awesome-query-builder/core";
const { validateAndFixTree } = Utils.Validation;

export const createValidationMemo = () => {
  let originalTree;
  let validatedTree;
  let configId;

  return (config, tree, oldConfig = undefined, sanitizeTree = true) => {
    if (!tree) {
      return null;
    }
    if (config.__configId === configId && (immutableEqual(tree, originalTree) || immutableEqual(tree, validatedTree))) {
      return validatedTree;
    } else {
      configId = config.__configId;
      originalTree = tree;
      if (sanitizeTree === false) {
        validatedTree = validateAndFixTree(tree, null, config, oldConfig || config, false, false);
      } else {
        validatedTree = validateAndFixTree(tree, null, config, oldConfig || config);
      }
      return validatedTree;
    }
  };
};
