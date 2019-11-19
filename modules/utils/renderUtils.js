import Immutable, { Map } from 'immutable';

export const liteShouldComponentUpdate = (self, config) => (nextProps, nextState) => {
  const prevProps = self.props;
  const prevState = self.state;

  let should = nextProps != prevProps || nextState != prevState;
  if (should) {
    if (prevState == nextState && prevProps != nextProps) {
      let chs = [];
      for (let k in nextProps) {
          let changed = (nextProps[k] != prevProps[k]);
          if (changed) {
            if (config[k] == 'ignore')
              changed = false;
            else if (config[k] == 'shallow_deep')
              changed = !shallowEqual(nextProps[k], prevProps[k], true);
            else if (config[k] == 'shallow')
              changed = !shallowEqual(nextProps[k], prevProps[k]);
            else if (typeof config[k] == 'function')
              changed = config[k](nextProps[k], prevProps[k], nextState);
          }
          if (changed)
            chs.push(k);
      }
      if (!chs.length)
          should = false;
    }
  }
  return should;
};

export const shallowEqual = (a, b, deep = false) => {
  if (Array.isArray(a))
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
