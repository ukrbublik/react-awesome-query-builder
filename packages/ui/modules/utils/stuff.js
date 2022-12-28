
export const defaultValue = (value, _default) => {
  return (typeof value === "undefined") ? _default : value;
};

export const truncateString = (str, n, useWordBoundary) => {
  if (!n || str.length <= n) { return str; }
  var subString = str.substr(0, n-1);
  return (useWordBoundary 
    ? subString.substr(0, subString.lastIndexOf(" ")) 
    : subString) + "...";
};

export const immutableEqual = function(v1, v2) {
  if (v1 === v2) {
    return true;
  } else {
    return v1.equals(v2);
  }
};

// const deepEqual = function(v1, v2) {
//   if (v1 === v2) {
//     return true;
//   } else if (Map.isMap(v1)) {
//     return v1.equals(v2);
//   } else {
//     return JSON.stringify(v1) == JSON.stringify(v2);
//   }
// };


export const shallowEqual = (a, b, deep = false) => {
  if (a === b) {
    return true;
  } else if (Array.isArray(a))
    return shallowEqualArrays(a, b, deep);
  else if (a && typeof a.equals === "function")
    return a.equals(b);
  else if (typeof a === "object")
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


const isImmutable = (v) => {
  return typeof v === "object" && v !== null && typeof v.toJS === "function";
};


// export function toImmutableList(v) {
//   return (isImmutable(v) ? v : new Immutable.List(v));
// }


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


export const logger = getLogger();

