import Immutable, { Map } from "immutable";
import {default as uuid} from "./uuid";

export {uuid};

export const widgetDefKeysToOmit = [
  "formatValue", "mongoFormatValue", "sqlFormatValue", "jsonLogic", "elasticSearchFormatValue", "spelFormatValue", "spelImportFuncs", "spelImportValue"
];

export const opDefKeysToOmit = [
  "formatOp", "mongoFormatOp", "sqlFormatOp", "jsonLogic", "spelFormatOp"
];

export const isObject = (v) => {
  return typeof v === "object" && v !== null && Object.prototype.toString.call(v) === "[object Object]";
};

export const shallowCopy = (v) => {
  if (typeof v === "object" && v !== null) {
    if (Array.isArray(v)) {
      return [...v];
    } else if (isObject(v)) {
      return {...v};
    }
  }
  return v;
};

export const omit = (obj, keys) => {
  return Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));
};

// RegExp.quote = function (str) {
//     return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
// };

export const getOpCardinality = (opDef) => {
  return opDef?.cardinality ?? 1;
};

// const immutableEqual = function(v1, v2) {
//   if (v1 === v2) {
//     return true;
//   } else {
//     return v1.equals(v2);
//   }
// };

export const deepEqual = function(v1, v2) {
  if (v1 === v2) {
    return true;
  } else if (Map.isMap(v1)) {
    return v1.equals(v2);
  } else {
    return JSON.stringify(v1) == JSON.stringify(v2);
  }
};

// //Do sets have same values?
// const eqSet = function (as, bs) {
//   if (as.size !== bs.size) return false;
//   for (var a of as) if (!bs.has(a)) return false;
//   return true;
// };


// //Do arrays have same values?
// const eqArrSet = function (arr1, arr2) {
//   return eqSet(new Set(arr1), new Set(arr2));
// };

export const shallowEqual = (a, b, deep = false) => {
  if (a === b) {
    return true;
  } else if (Array.isArray(a))
    return shallowEqualArrays(a, b, deep);
  else if (Map.isMap(a))
    return a.equals(b);
  else if (typeof a == "object")
    return shallowEqualObjects(a, b, deep);
  else
    return a === b;
};

function shallowEqualArrays(arrA, arrB, deep = false) {
  if (arrA === arrB) {
    return true;
  }

  if (!arrA || !arrB) {
    return false;
  }

  var len = arrA.length;

  if (arrB.length !== len) {
    return false;
  }

  for (var i = 0; i < len; i++) {
    var isEqual = deep ? shallowEqual(arrA[i], arrB[i], deep) : arrA[i] === arrB[i];
    if (!isEqual) {
      return false;
    }
  }

  return true;
}

function shallowEqualObjects(objA, objB, deep = false) {
  if (objA === objB) {
    return true;
  }

  if (!objA || !objB) {
    return false;
  }

  var aKeys = Object.keys(objA);
  var bKeys = Object.keys(objB);
  var len = aKeys.length;

  if (bKeys.length !== len) {
    return false;
  }

  for (var i = 0; i < len; i++) {
    var key = aKeys[i];
    var isEqual = deep ? shallowEqual(objA[key], objB[key], deep) : objA[key] === objB[key];
    if (!isEqual) {
      return false;
    }
  }

  return true;
}

export const isImmutable = (v) => {
  return typeof v === "object" && v !== null && typeof v.toJS === "function";
};

export const isImmutableList = (v) => {
  return isImmutable(v) && Immutable.isList(v); // Immutable.isIndexed(v)
};

export function toImmutableList(v) {
  return (isImmutableList(v) ? v : new Immutable.List(v));
}

export function applyToJS(v) {
  return (isImmutable(v) ? v.toJS() : v);
}

export const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&"); // $& means the whole matched string
};

export const mergeCustomizerNoArrays = (objValue, srcValue, _key, _object, _source, _stack) => {
  if (Array.isArray(objValue)) {
    return srcValue;
  }
};

export const cleanJSX = (jsx) => {
  const jsxKeys = ["$$typeof", "_owner", "_store", "ref", "key"];

  const getName = (val) => {
    if (typeof val === "string") {
      return val;
    } else if (typeof val === "function") {
      return val.name;
    }
    return val;
  };

  if (jsx instanceof Array) {
    return jsx.map((el, _i) => cleanJSX(el));
  } else if (typeof jsx === "object" && jsx !== null) {
    if (isDirtyJSX(jsx)) {
      const cleaned = omit(jsx, jsxKeys);
      if (cleaned.type) {
        cleaned.type = getName(cleaned.type);
      }
      if (cleaned?.props?.children) {
        cleaned.props.children = cleanJSX(cleaned.props.children);
      }
      return cleaned;
    }
  }
  return jsx;
};

export const isDirtyJSX = (jsx) => {
  return typeof jsx === "object"
    && jsx !== null
    && !Array.isArray(jsx)
    && Object.keys(jsx).includes("type")
    && Object.keys(jsx).includes("props") // even if {}
    && Object.keys(jsx).includes("key") // even if null
    && Object.keys(jsx).includes("ref") // even if null
    && Object.keys(jsx).includes("$$typeof"); // Symbol(react.element)
};

export const isJSX = (jsx) => (
  typeof jsx === "object"
  && jsx !== null
  && !Array.isArray(jsx)
  && typeof jsx["type"] === "string"
  && Object.keys(jsx).includes("props")
);

export const isJsonLogic = (logic) => {
  let isJL = typeof logic === "object" // An object
    && logic !== null // but not null
    && !Array.isArray(logic) // and not an array
    && Object.keys(logic).length === 1; // with exactly one key
  if (isJL) {
    // additional checks ?
  }
  return isJL;
};

export const isValidFieldObject = (obj, conv) => {
  // Check if the input is an object and not null
  if (typeof obj !== "object" || obj === null) return false;

  // Get the keys of the object
  const keys = Object.keys(obj);

  // Check if it has exactly one key and that key is "var"
  if (keys.length !== 1 || !conv.varKeys.includes(keys[0])) return false;

  // Check if the value of the "var" key is a non-empty string
  const varValue = obj[keys[0]];
  return typeof varValue === "string" && varValue.trim() !== "";
};

export const isVarEmptyObject = (obj) => {
  // Check if the input is an object and not null
  if (typeof obj !== "object" || obj === null) return false;

  // Ensure the object has exactly one key, and it is "var" with an empty string value
  return Object.keys(obj).length === 1 && obj.var === "";
};

export function sleep(delay) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}


// [1, 4, 9] + [1, 5, 9] => [1, 4, 5, 9]
// Used for merging arrays of operators for different widgets of 1 type
export function mergeArraysSmart(arr1, arr2) {
  if (!arr1) arr1 = [];
  if (!arr2) arr2 = [];
  return arr2
    .map(op => [op, arr1.indexOf(op)])
    .map(([op, ind], i, orig) => {
      if (ind == -1) {
        const next = orig.slice(i+1);
        const prev = orig.slice(0, i);
        const after = prev.reverse().find(([_cop, ci]) => ci != -1);
        const before = next.find(([_cop, ci]) => ci != -1);
        if (before)
          return [op, "before", before[0]];
        else if (after)
          return [op, "after", after[0]];
        else
          return [op, "append", null];
      } else {
      // already exists
        return null;
      }
    })
    .filter(x => x !== null)
    .reduce((acc, [newOp, rel, relOp]) => {
      const ind = acc.indexOf(relOp);
      if (acc.indexOf(newOp) == -1) {
        if (ind > -1) {
        // insert after or before
          acc.splice( ind + (rel == "after" ? 1 : 0), 0, newOp );
        } else {
        // insert to end or start
          acc.splice( (rel == "append" ? Infinity : 0), 0, newOp );
        }
      }
      return acc;
    }, arr1.slice());
}

export const deepFreeze = obj => {
  if (typeof obj === "object" && obj !== null && !isDirtyJSX(obj)) {
    Object.keys(obj).forEach(prop => {
      if (prop !== "__cache") {
        deepFreeze(obj[prop]);
      }
    });
    Object.freeze(obj);
  }
};

export const isJsonCompatible = (tpl, obj, bag = {}, path = []) => {
  if (isObject(tpl)) {
    if (tpl.var) {
      bag[tpl.var] = obj;
      return true;
    }
    if (!isObject(obj))
      return false;
    for (const k in tpl) {
      const tv = tpl[k];
      const ov = obj[k];
      if (!isJsonCompatible(tv, ov, bag, [...path, k]))
        return false;
    }
    return true;
  } else if (Array.isArray(tpl)) {
    if (!Array.isArray(obj))
      return false;
    for (let i = 0 ; i < tpl.length ; i++) {
      const tv = tpl[i];
      const ov = obj[i];
      if (!isJsonCompatible(tv, ov, bag, [...path, i]))
        return false;
    }
    return true;
  } else {
    return tpl === obj;
  }
};

const isDev = () => (typeof process !== "undefined" && process.env && process.env.NODE_ENV == "development");

export const getLogger = (devMode = false) => {
  const verbose = devMode != undefined ? devMode : isDev(); 
  return verbose ? console : {
    error: () => {},
    log: () => {},
    warn: () => {},
    debug: () => {},
    info: () => {},
  };
};

export const getFirstDefined = (arr = []) => {
  let ret;
  for (let i = 0 ; i < arr.length ; i++) {
    const v = arr[i];
    if (v !== undefined) {
      ret = v;
      break;
    }
  }
  return ret;
};

export const logger = getLogger();
