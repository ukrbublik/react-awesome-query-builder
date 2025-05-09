import initTreeComplex from "./tree/complex";
import initLogicComplex from "./logic/complex";
import initLogicSimple from "./logic/simple";
import initLogicWithNot from "./logic/with_not";
import initLogicAutocomplete from "./logic/autocomplete";
import initLogicWithNotInSome from "./logic/with_not_in_some";
import initLogicWithFuncInLhs from "./logic/with_func_in_lhs";
import initLogicGroupSomeInAny from "./logic/with_group_some_in_any";
import initLogicGroupSomeInLike from "./logic/with_group_some_in_like";
import initLogicSwitchWith2Cases from "./logic/switch_with_2_cases";
import initLogicSwitchWithDefaultCaseField from "./logic/switch_with_default_case_field";
import initLogicSwitchWithDefaultCaseFunc from "./logic/switch_with_default_case_func";

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
  "logic/autocomplete": initLogicAutocomplete,
  "logic/with_group_some_in_any": initLogicGroupSomeInAny,
  "logic/with_group_some_in_like": initLogicGroupSomeInLike,
  "logic/switch_with_2_cases": initLogicSwitchWith2Cases,
  "logic/switch_with_default_case_field": initLogicSwitchWithDefaultCaseField,
  "logic/switch_with_default_case_func": initLogicSwitchWithDefaultCaseFunc,

  "tree/complex": initTreeComplex,
  "tree/empty": emptyTree,
  "tree/empty_switch": emptySwitchTree,

  "sql/simple": initSqlSimple,
};
