import Immutable, { fromJS, Map } from "immutable";
const transit = require("transit-immutable-js");
import {validateTree} from "../utils/validation";
import {extendConfig} from "../utils/configUtils";
import {getTreeBadFields} from "../utils/treeUtils";

export const getTree = (immutableTree, light = true) => {
  if (!immutableTree) return undefined;
  let tree = immutableTree;
  tree = tree.toJS();
  if (light)
    tree = _lightTree(tree);
  return tree;
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

export const checkTree = (tree, config) => {
  if (!tree) return undefined;
  const extendedConfig = extendConfig(config);
  return validateTree(tree, null, extendedConfig, extendedConfig, true, true);
};

export const isValidTree = (tree) => {
  return getTreeBadFields(tree).length == 0;
};

function _fromJS(tree) {
  return fromJS(tree, function (key, value) {
    let outValue;
    if (key == "value" && value.get(0) && value.get(0).toJS !== undefined) {
      const valueJs = value.get(0).toJS();
      if (valueJs.func) {
        outValue = value.toOrderedMap();
      } else {
        // only for raw values keep JS representation
        outValue = Immutable.List.of(valueJs);
      }
    } else
      outValue = Immutable.Iterable.isIndexed(value) ? value.toList() : value.toOrderedMap();
    return outValue;
  });
}


// Remove fields that can be calced: "id", "path"
// Remove empty fields: "operatorOptions"
function _lightTree (tree) {
  let newTree = tree;

  function _processNode (item, itemId) {
    if (item.path)
      delete item.path;
    if (itemId)
      delete item.id;
    let properties = item.properties;
    if (properties) {
      if (properties.operatorOptions == null)
        delete properties.operatorOptions;
    }

    const children = item.children1;
    if (children) {
      for (let id in children) {
        _processNode(children[id], id);
      }
    }
  }

  _processNode(tree, null);

  return newTree;
}
