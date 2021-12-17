import Immutable, { Map } from "immutable";

// RegExp.quote = function (str) {
//     return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
// };

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

export const deepEqual = function(v1, v2) {
  if (v1 === v2) {
    return true;
  } else if (Map.isMap(v1)) {
    return v1.equals(v2);
  } else {
    return JSON.stringify(v1) == JSON.stringify(v2);
  }
};

//Do sets have same values?
export const eqSet = function (as, bs) {
  if (as.size !== bs.size) return false;
  for (var a of as) if (!bs.has(a)) return false;
  return true;
};


//Do arrays have same values?
export const eqArrSet = function (arr1, arr2) {
  return eqSet(new Set(arr1), new Set(arr2));
};

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
    var isEqual = deep ? shallowEqual(arrA[i], arrB[i]) : arrA[i] === arrB[i];
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

export const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&"); // $& means the whole matched string
};


const isObject = (v) => (typeof v == "object" && v !== null); // object or array
const listValue = (v, title) => (isObject(v) ? v : {value: v, title: (title !== undefined ? title : v)});

// convert {<value>: <title>, ..} or [value, ..] to normal [{value, title}, ..]
export const listValuesToArray = (listValuesObj) => {
  if (!isObject(listValuesObj))
    return listValuesObj;
  if (Array.isArray(listValuesObj))
    return listValuesObj.map(v => listValue(v));
  
  let listValuesArr = [];
  for (let v in listValuesObj) {
    const title = listValuesObj[v];
    listValuesArr.push(listValue(v, title));
  }
  return listValuesArr;
};

// listValues can be {<value>: <title>, ..} or [{value, title}, ..] or [value, ..]
export const getItemInListValues = (listValues, value) => {
  if (Array.isArray(listValues)) {
    const values = listValues.map(v => listValue(v));
    return values.find(v => (v.value === value)) || values.find(v => (`${v.value}` === value));
  } else {
    return listValues[value] !== undefined ? listValue(value, listValues[value]) : undefined;
  }
};

export const getTitleInListValues = (listValues, value) => {
  if (listValues == undefined)
    return value;
  const it = getItemInListValues(listValues, value);
  return it !== undefined ? it.title : value;
};

export const getValueInListValues = (listValues, value) => {
  if (listValues == undefined)
    return value;
  const it = getItemInListValues(listValues, value);
  return it !== undefined ? it.value : value;
};

export const mapListValues = (listValues, mapFn) => {
  let ret = [];
  if (Array.isArray(listValues)) {
    for (let v of listValues) {
      const lv = mapFn(listValue(v));
      if (lv != null)
        ret.push(lv);
    }
  } else {
    for (let value in listValues) {
      const lv = mapFn(listValue(value, listValues[value]));
      if (lv != null)
        ret.push(lv);
    }
  }
  return ret;
};

export const defaultTreeDataMap = {id: "value", pId: "parent", rootPId: undefined};

// converts from treeData to treeDataSimpleMode format (https://ant.design/components/tree-select/)
// ! modifies value of `treeData`
export const flatizeTreeData = (treeData) => {
  const tdm = defaultTreeDataMap;

  let rind;
  let len;

  const _flatize = (node, root, lev) => {
    if (node.children) {
      if (lev == 1)
        node[tdm.pId] = tdm.rootPId; //optional?
      const childrenCount = node.children.length;
      for (let c of node.children) {
        c[tdm.pId] = node[tdm.id];
        rind++;
        root.splice(rind, 0, c); //instead of just push
        len++;
        _flatize(c, root, lev + 1);
      }
      delete node.children;
      if (childrenCount == 0) {
        root.splice(rind, 1);
        rind--;
        len--;
      }
    }
  };

  if (Array.isArray(treeData)) {
    len = treeData.length;
    for (rind = 0 ; rind < len ; rind++) {
      const c = treeData[rind];
      if (!isObject(c))
        continue;
      if (c[tdm.pId] !== undefined && c[tdm.pId] != tdm.rootPId)
        continue; //not lev 1
      _flatize(c, treeData, 1);
    }
  }
  
  return treeData;
};

const getPathInListValues = (listValues, value) => {
  const tdm = defaultTreeDataMap;
  const it = getItemInListValues(listValues, value);
  const parentId = it ? it[tdm.pId] : undefined;
  const parent = parentId ? listValues.find(v => v[tdm.id] === parentId) : undefined;
  return parent ? [parent.value, ...getPathInListValues(listValues, parent.value)] : [];
};

const getChildrenInListValues = (listValues, value) => {
  const tdm = defaultTreeDataMap;
  const it = getItemInListValues(listValues, value);
  return it ? listValues.filter(v => v[tdm.pId] === it[tdm.id]).map(v => v.value) : [];
};

// ! modifies value of `treeData`
const extendTreeData = (treeData, fieldSettings, isMulti) => {
  for (let node of treeData) {
    node.path = getPathInListValues(treeData, node.value);
    if (fieldSettings.treeSelectOnlyLeafs != false) {
      const childrenValues = getChildrenInListValues(treeData, node.value);
      if (!isMulti) {
        node.selectable = (childrenValues.length == 0);
      }
    }
  }
  return treeData;
};

export const normalizeListValues = (listValues, type, fieldSettings) => {
  const isTree = ["treeselect", "treemultiselect"].includes(type);
  const isMulti = ["multiselect", "treemultiselect"].includes(type);
  if (isTree) {
    listValues = listValuesToArray(listValues);
    listValues = flatizeTreeData(listValues);
    listValues = extendTreeData(listValues, fieldSettings, isMulti);
  }
  return listValues;
};

export const removePrefixPath = (selectedPath, parentPath) => {
  if (!selectedPath)
    return selectedPath;
  let isPrefix = true;
  for (let i = 0 ; i < parentPath.length ; i++) {
    const part = parentPath[i];
    if (selectedPath[i] !== undefined && part == selectedPath[i]) {
      //ok
    } else {
      isPrefix = false;
      break;
    }
  }
  return isPrefix ? selectedPath.slice(parentPath.length) : selectedPath;
};

export const isJsonLogic = (logic) => (
  typeof logic === "object" // An object
  && logic !== null // but not null
  && !Array.isArray(logic) // and not an array
  && Object.keys(logic).length === 1 // with exactly one key
);

export function sleep(delay) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

export const isImmutable = (v) => {
  return typeof v === "object" && v !== null && typeof v.toJS === "function";
};

export function applyToJS(v) {
  return (isImmutable(v) ? v.toJS() : v);
}

export function toImmutableList(v) {
  return (isImmutable(v) ? v : new Immutable.List(v));
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
