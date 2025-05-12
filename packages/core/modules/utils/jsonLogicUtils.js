import JL from "json-logic-js";
import moment from "moment";

export function applyJsonLogic(logic, data) {
  return JL.apply(logic, data);
}

export function addJsonLogicOperation(name, op) {
  return JL.add_operation(name, op);
}

export const customJsonLogicOperations = {
  CALL: (fn, ctx, ...args) => (fn.call(ctx, ...args)),
  JSX: (type, props) => ({type, props}),
  mergeObjects: (obj1, obj2) => ({...obj1, ...obj2}),
  fromEntries: (entries) => Object.fromEntries(entries),
  strlen: (str) => (str?.length || 0),
  regexTest: (str, pattern, flags) => str?.match(new RegExp(pattern, flags)) != null,
  now: () => new Date(),
  date_add: (date, val, dim) => { return moment(date).add(val, dim).toDate(); },
  toLowerCase: (str) => str.toLowerCase(),
  toUpperCase: (str) => str.toUpperCase(),
};

export function addRequiredJsonLogicOperations() {
  for (let k in customJsonLogicOperations) {
    addJsonLogicOperation(k, customJsonLogicOperations[k]);
  }
}

/**
 * @deprecated
 */
export const jsonLogicFormatConcat = (parts) => {
  if (parts && Array.isArray(parts) && parts.length) {
    return parts
      .map(part => part?.value ?? part)
      .filter(r => r != undefined);
  } else {
    return undefined;
  }
};

/**
 * @deprecated
 */
export const jsonLogicImportConcat = (val) => {
  if (val == undefined)
    return undefined;
  const errors = [];
  const parts = Array.isArray(val) ? val : [val];
  const res = parts.filter(v => v != undefined).map(v => {
    return {
      type: "property", 
      value: val
    };
  });
  if (errors.length) {
    throw new Error(errors.join("\n"));
  }
  return res;
};