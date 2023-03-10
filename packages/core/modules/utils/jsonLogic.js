import JL from "json-logic-js";

export function applyJsonLogic(logic, data) {
  return JL.apply(logic, data);
};

export function addJsonLogicOperation(name, op) {
  return JL.add_operation(name, op);
};

export function addRequiredJsonLogicOperations() {
  addJsonLogicOperation("CALL", (fn, ctx, ...args) => (fn.call(ctx, ...args)));
  addJsonLogicOperation("RE", (type, props) => ({type, props}));
  addJsonLogicOperation("MERGE", (obj1, obj2) => ({...obj1, ...obj2}));
  addJsonLogicOperation("MAP", (entries) => Object.fromEntries(entries));
  addJsonLogicOperation("strlen", (str) => (str?.length || 0));
  addJsonLogicOperation("test", (str, pattern, flags) => str?.match(new RegExp(pattern, flags)) != null);
};
