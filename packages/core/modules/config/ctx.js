import moment from "moment";
import {
  SqlString, sqlEmptyValue, mongoEmptyValue, spelEscape, spelFixList,
  stringifyForDisplay
} from "../utils/export";
import JL from "json-logic-js";
import {escapeRegExp, isJSX} from "../utils/stuff";
import {getTitleInListValues} from "../utils/listValues";

// helpers for mongo format
export const mongoFormatOp1 = (mop, mc, not,  field, _op, value, useExpr, valueSrc, valueType, opDef, operatorOptions, fieldDef) => {
  const $field = typeof field == "string" && !field.startsWith("$") ? "$"+field : field;
  const mv = mc(value, fieldDef);
  if (mv === undefined)
    return undefined;
  if (not) {
    if (!useExpr && (!mop || mop == "$eq"))
      return { [field]: { "$ne": mv } }; // short form
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

export const mongoFormatOp2 = (mops, not,  field, _op, values, useExpr, valueSrcs, valueTypes, opDef, operatorOptions, fieldDef) => {
  const $field = typeof field == "string" && !field.startsWith("$") ? "$"+field : field;
  if (not) {
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

export const applyJsonLogic = (logic, data) => {
  return JL.apply(logic, data);
};

export const addJsonLogicOperation = (name, op) => {
  return JL.add_operation(name, op);
};

export function renderReactElement(jsx, opts, path, key = undefined) {
  if (isJSX(jsx)) {
    if (jsx instanceof Array) {
      return jsx.map((el, i) => renderReactElement(el, opts, path, i));
    }
    let { type, props } = jsx;
    if (typeof type !== "string") {
      throw new Error(`renderReactElement for ${path.join(".")}: type should be string`);
    }
    const Cmp = opts.components[type] || type.toLowerCase();
    if (props.children) {
      props = { ...props, children: renderReactElement(props.children, opts, path) };
    }
    if (key !== undefined) {
      props = { ...props, key };
    }
    return typeof Cmp === "function" ? Cmp(props) : opts.RCE(Cmp, props);
  }
  return jsx;
}

const ctx = {
  applyJsonLogic,
  addJsonLogicOperation,
  renderReactElement,
  moment,
  SqlString,
  mongoFormatOp1,
  mongoFormatOp2,
  mongoEmptyValue,
  escapeRegExp,
  sqlEmptyValue,
  stringifyForDisplay,
  getTitleInListValues,
  spelEscape,
  spelFixList,
};

export default ctx;
