import moment from "moment";
import {
  SqlString,
  sqlEmptyValue,
  mongoEmptyValue,
  spelEscape,
  celEscape,
  spelFixList,
  stringifyForDisplay,
} from "../utils/export";
import { escapeRegExp } from "../utils/stuff";
import { getTitleInListValues } from "../utils/listValues";

// helpers for mongo format
export const mongoFormatOp1 = (
  mop,
  mc,
  not,
  field,
  _op,
  value,
  useExpr,
  valueSrc,
  valueType,
  opDef,
  operatorOptions,
  fieldDef
) => {
  const $field
    = typeof field == "string" && !field.startsWith("$") ? "$" + field : field;
  const mv = mc(value, fieldDef);
  if (mv === undefined) return undefined;
  if (not) {
    if (!useExpr && (!mop || mop == "$eq")) return { [field]: { $ne: mv } }; // short form
    return !useExpr
      ? { [field]: { $not: { [mop]: mv } } }
      : { $not: { [mop]: [$field, mv] } };
  } else {
    if (!useExpr && (!mop || mop == "$eq")) return { [field]: mv }; // short form
    return !useExpr ? { [field]: { [mop]: mv } } : { [mop]: [$field, mv] };
  }
};

export const mongoFormatOp2 = (
  mops,
  not,
  field,
  _op,
  values,
  useExpr,
  valueSrcs,
  valueTypes,
  opDef,
  operatorOptions,
  fieldDef
) => {
  const $field
    = typeof field == "string" && !field.startsWith("$") ? "$" + field : field;
  if (not) {
    return !useExpr
      ? { [field]: { $not: { [mops[0]]: values[0], [mops[1]]: values[1] } } }
      : {
        $not: {
          $and: [
            { [mops[0]]: [$field, values[0]] },
            { [mops[1]]: [$field, values[1]] },
          ],
        },
      };
  } else {
    return !useExpr
      ? { [field]: { [mops[0]]: values[0], [mops[1]]: values[1] } }
      : {
        $and: [
          { [mops[0]]: [$field, values[0]] },
          { [mops[1]]: [$field, values[1]] },
        ],
      };
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
    celEscape,
    spelFixList,
  },
};

export default ctx;
