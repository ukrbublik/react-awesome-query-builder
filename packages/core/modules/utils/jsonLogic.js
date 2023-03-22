import JL from "json-logic-js";
import moment from "moment";

function applyJsonLogic(logic, data) {
  return JL.apply(logic, data);
};

function addJsonLogicOperation(name, op) {
  return JL.add_operation(name, op);
};

export const customJsonLogicOperations = {
  CALL: (fn, ctx, ...args) => (fn.call(ctx, ...args)),
  REACT: (type, props) => ({type, props}),
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
};
