import moment from "moment";
import {
  SqlString, sqlEmptyValue, mongoEmptyValue, spelEscape, spelFixList,
  stringifyForDisplay, wrapWithBrackets,
} from "../utils/export";
import {escapeRegExp} from "../utils/stuff";
import {getTitleInListValues} from "../utils/listValues";

// helpers for mongo format
export const mongoFormatOp1 = (mop, mc, opNot,  field, _op, value, not, useExpr, valueSrc, valueType, opDef, operatorOptions, fieldDef) => {
  const $field = typeof field == "string" && !field.startsWith("$") ? "$"+field : field;
  const mv = mc(value, fieldDef);
  if (mv === undefined)
    return undefined;
  if (not ^ opNot) {
    // if (!useExpr && (!mop || mop == "$eq"))
    //   return { [field]: { "$ne": mv } }; // short form
    return !useExpr
      ? { [field]: { "$not": { [mop]: mv } } } 
      : { "$not": { [mop]: [$field, mv] } };
  } else {
    if (!useExpr && (!mop || mop == "$eq"))
      return { [field]: mv }; // short form
    return !useExpr
      ? { [field]: { [mop]: mv } } 
      : { [mop]: [$field, mv] };
  }
};

export const mongoFormatOp2 = (mops, opNot,  field, _op, values, not, useExpr, valueSrcs, valueTypes, opDef, operatorOptions, fieldDef) => {
  const $field = typeof field == "string" && !field.startsWith("$") ? "$"+field : field;
  if (not ^ opNot) {
    return !useExpr
      ? { [field]: { "$not": { [mops[0]]: values[0], [mops[1]]: values[1] } } } 
      : {"$not":
                {"$and": [
                  { [mops[0]]: [ $field, values[0] ] },
                  { [mops[1]]: [ $field, values[1] ] },
                ]}
      };
  } else {
    return !useExpr
      ? { [field]: { [mops[0]]: values[0], [mops[1]]: values[1] } } 
      : {"$and": [
        { [mops[0]]: [ $field, values[0] ] },
        { [mops[1]]: [ $field, values[1] ] },
      ]};
  }
};

const ctx = {
  utils: {
    SqlString,
    moment,
    mongoFormatOp1,
    mongoFormatOp2,
    mongoEmptyValue,
    escapeRegExp,
    sqlEmptyValue,
    stringifyForDisplay,
    getTitleInListValues,
    spelEscape,
    spelFixList,
    wrapWithBrackets,
  },
};

export default ctx;
