import mapValues from 'lodash/mapValues';
import Immutable, { Map } from 'immutable';
import React from 'react';


export const SELECT_WIDTH_OFFSET_RIGHT = 48;
const DEFAULT_FONT = '14px';

// RegExp.quote = function (str) {
//     return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
// };


export const defaultValue = (value, _default) => {
    return (typeof value === "undefined") ? _default : value;
}


export const bindActionCreators = (actionCreators, config, dispatch) =>
  mapValues(actionCreators, (actionCreator) =>
    (...args) => dispatch(actionCreator(config, ...args))
  );


export const calcTextWidth = function(str, font) {
  var f = font || DEFAULT_FONT;
  var div = document.createElement("div");
  div.innerHTML = str;
  var css = {
    'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f
  };
  for (let k in css) {
    div.style[k] = css[k];
  }
  div = document.body.appendChild(div);
  var w = div.offsetWidth;
  document.body.removeChild(div);
  return w;
}

export const truncateString = (str, n, useWordBoundary) => {
    if (!n || str.length <= n) { return str; }
    var subString = str.substr(0, n-1);
    return (useWordBoundary 
       ? subString.substr(0, subString.lastIndexOf(' ')) 
       : subString) + "...";
}

export const BUILT_IN_PLACEMENTS = {
  bottomLeft: {
    points: ['tl', 'bl'],
    offset: [0, 4],
    overflow: {
      adjustX: 0,
      adjustY: 1,
    },
  },
  bottomRight: {
    points: ['tr', 'br'],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  topLeft: {
    points: ['bl', 'tl'],
    offset: [0, -4],
    overflow: {
      adjustX: 0,
      adjustY: 1,
    },
  },
  topRight: {
    points: ['br', 'tr'],
    offset: [0, -4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
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
  else if (typeof a == 'object')
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
    var isEqual = deep ? shallowEqual(objA[key], objB[key]) : objA[key] === objB[key];
    if (!isEqual) {
      return false;
    }
  }

  return true;
}

export const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&'); // $& means the whole matched string
}


const canUseUnsafe = () => {
  const v = React.version.split('.').map(parseInt.bind(null, 10));
  return v[0] >= 16 && v[1] >= 3;
};

export const useOnPropsChanged = (obj) => {
  if (canUseUnsafe) {
    obj.UNSAFE_componentWillReceiveProps = (nextProps) => {
      obj.onPropsChanged(nextProps);
    };
  } else {
    obj.componentWillReceiveProps = (nextProps) => {
      obj.onPropsChanged(nextProps);
    };
  }
};


const isObject = (v) => (typeof v == 'object' && v !== null);
const listValue = (v, title) => (isObject(v) ? v : {value: v, title: (title !== undefined ? title : v)});

// listValues can be {<value>: <title>, ..} or [{value, title}, ..] or [value, ..]
export const getItemInValueList = (listValues, value) => {
  if (Array.isArray(listValues)) {
    return listValues.map(v => listValue(v)).find(v => v.value === value);
  } else {
    return listValues[value] !== undefined ? listValue(value, listValues[value]) : undefined;
  }
};

export const getTitleInValueList = (listValues, value) => {
  const it = getItemInValueList(listValues, value);
  return it !== undefined ? it.title : undefined;
};

export const mapListValues = (listValues, fun) => {
  let ret = [];
  if (Array.isArray(listValues)) {
    for (let v of listValues) {
      ret.push(fun(listValue(v)));
    }
  } else {
    for (let value in listValues) {
      ret.push(fun(listValue(value, listValues[value])));
    }
  }
  return ret;
};


// converts from treeData to treeDataSimpleMode
// ! modifies value of `treeData`
export const flatizeTreeData = (treeData, mp) => {
  if (typeof mp != 'object') {
    mp = {id: "value", pId: "parent", rootPId: undefined};
  }

  let rind = 0;

  const _flatize = (node, root, lev) => {
    if (lev == 1)
      node[mp.pId] = mp.rootPId; //optional?
    if (node.children) {
      for (let c of node.children) {
        c[mp.pId] = node[mp.id];
        root.splice(rind++, 0, c); //instead of just push
        _flatize(c, root, lev + 1);
      }
      delete node.children;
    }
  };

  if (Array.isArray(treeData)) {
    for (let c of treeData) {
      if (!isObject(c))
        continue;
      if (c[mp.pId] !== undefined && c[mp.pId] != mp.rootPId)
        continue; //because we pushed
      rind++;
      _flatize(c, treeData, 1);
    }
  }

  return treeData;
};

