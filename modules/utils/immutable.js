'use strict';
import Immutable, { fromJS, Map } from 'immutable';
const transit = require('transit-immutable-js');

export const getTree = (immutableTree) => {
  return immutableTree.toJS();
};

export const loadTree = (serTree) => {
  if (Map.isMap(serTree)) {
    return serTree;
  } else if (typeof serTree == "object") {
    return _fromJS(serTree);
  } else if (typeof serTree == "string" && serTree.startsWith('["~#iM"')) {
    //tip: old versions of RAQB were saving tree with `transit.toJSON()`
    // https://github.com/ukrbublik/react-awesome-query-builder/issues/69
    return transit.fromJSON(serTree);
  } else if (typeof serTree == "string") {
    return _fromJS(JSON.parse(serTree));
  } else throw "Can't load tree!";
};

function _fromJS(tree) {
  return fromJS(tree, function (key, value) {
    let outValue;
    if (key == 'value' && value.get(0) && value.get(0).toJS !== undefined)
      outValue = Immutable.List.of(value.get(0).toJS());
    else
      outValue = Immutable.Iterable.isIndexed(value) ? value.toList() : value.toOrderedMap();
    return outValue;
  });
};
