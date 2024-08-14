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

// todo: 
// funcs: LENGTH("sql"), LCASE("")/LOWER(""), CONCAT("1", "2"), CONCAT_WS(",", "1", "2"), SUBSTRING("", 1, 1), SUBSTR(), ADDDATE/DATE_ADD
// json funcs: JSON_VALUE(a, "$.info.address.town")
// CASE mode: https://www.w3schools.com/sql/sql_case.asp
// 
const initSqlSimple = "LOWER(bio) = 'aa' AND DATE_ADD(NOW(), INTERVAL 2 DAY) > TO_DATE('2024-07-26 00:00:00.000', 'yyyy-mi-dd hh:mm:ss.mmm') "; //"NOT (text = 'Long\\nText' AND num <> 2 OR DATE_ADD(NOW(), INTERVAL 2 DAY) > '2024-07-26 00:00:00.000' OR LOWER(user.firstName) = UPPER('gg') OR CONTAINS(prox1, 'NEAR((a, b), 2)'))";


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
