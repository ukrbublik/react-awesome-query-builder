import initTreeComplex from "./tree/complex";
import initLogicComplex from "./logic/complex";
import initLogicSimple from "./logic/simple";
import initLogicWithNot from "./logic/with_not";
import initLogicWithNotInSome from "./logic/with_not_in_some";
import initLogicWithFuncInLhs from "./logic/with_func_in_lhs";

import {
  Utils, JsonTree,
} from "@react-awesome-query-builder/ui";
const { uuid } = Utils;

export const emptyTree: JsonTree = {id: uuid(), type: "group"};
export const emptySwitchTree: JsonTree = {id: uuid(), type: "switch_group"};

export const initFiles: Record<string, any> = {
  "logic/complex": initLogicComplex,
  "logic/simple": initLogicSimple,
  // tip: try to change `reverseOperatorsForNot` config to test next 2 files
  "logic/with_not": initLogicWithNot,
  "logic/with_not_in_some": initLogicWithNotInSome,
  "logic/with_func_in_lhs": initLogicWithFuncInLhs,

  "tree/complex": initTreeComplex,
  "tree/empty": emptyTree,
  "tree/empty_switch": emptySwitchTree,
};
