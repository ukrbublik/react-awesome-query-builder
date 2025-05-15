import JL from "json-logic-js";
import moment from "moment";

export function applyJsonLogic(logic, data) {
  return JL.apply(logic, data);
}

export function addJsonLogicOperation(name, op, jl = JL) {
  return jl.add_operation(name, op);
}

export const customJsonLogicOperations = {
  CALL: (fn, ctx, ...args) => (fn.call(ctx, ...args)),
  JSX: (type, props) => ({type, props}),
  mergeObjects: (obj1, obj2) => ({...obj1, ...obj2}),
  fromEntries: (entries) => Object.fromEntries(entries),
  //
  // string
  //
  toLowerCase: (str) => str.toLowerCase(),
  toUpperCase: (str) => str.toUpperCase(),
  strlen: (str) => (str?.length || 0),
  regexTest: (str, pattern, flags) => str?.match(new RegExp(pattern, flags)) != null,
  //
  // date / datetime
  //
  "date==": (a, b) => {
    if (a == null || b == null) {
      return false;
    }
    const dateA = moment(a).startOf("day");
    const dateB = moment(b).startOf("day");
    return dateA.isSame(dateB); 
  },
  "date!=": (a, b) => { return !customJsonLogicOperations["date=="](a, b); },
  "datetime==": (a, b) => {
    if (a == null || b == null) {
      return false;
    }
    const dateA = moment(a);
    const dateB = moment(b);
    return dateA.isSame(dateB); 
  },
  "datetime!=": (a, b) => { return !customJsonLogicOperations["datetime=="](a, b); },
  now: () => new Date(),
  today: () => {
    const start = moment().startOf("day");
    const y = start.year();
    const m = start.month();
    const d = start.date();
    // tip: we use UTC to return same result as eg. new Date("2025-05-16")
    const startUtc = moment.utc([y, m, d]);
    return startUtc.toDate();
  },
  start_of_today: () => { return moment().startOf("day").toDate(); },
  date_add: (date, val, dim) => { return moment(date).add(val, dim).toDate(); },
  datetime_add: (datetime, val, dim) => { return moment(datetime).add(val, dim).toDate(); },
  datetime_truncate: (datetime, dim) => { return moment(datetime).startOf(dim).toDate(); },
};

export function addRequiredJsonLogicOperations(jl = JL) {
  for (let k in customJsonLogicOperations) {
    addJsonLogicOperation(k, customJsonLogicOperations[k], jl);
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