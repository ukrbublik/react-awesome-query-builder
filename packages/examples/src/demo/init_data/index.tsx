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


const initSqlSimple = "LOWER(user.firstName) = UPPER('gg') AND (DATE_ADD(NOW(), INTERVAL 2 DAY) > TO_DATE('2024-07-26 00:00:00.000', 'yyyy-mi-dd hh:mm:ss.mmm') OR DATE_SUB(NOW(), INTERVAL 4 MONTH ) > '2024-05-10 00:00:00.000') AND num <> 2 AND bio = 'Long\\nText'" ;


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

  "sql/simple": initSqlSimple,
};
