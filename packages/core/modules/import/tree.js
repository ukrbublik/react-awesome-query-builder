import Immutable, { fromJS, Map } from "immutable";
import {validateTree} from "../utils/validation";
import {extendConfig} from "../utils/configUtils";
import {getTreeBadFields, getLightTree} from "../utils/treeUtils";
import {isJsonLogic} from "../utils/stuff";

export const getTree = (immutableTree, light = true, children1AsArray = true) => {
  if (!immutableTree) return undefined;
  let tree = immutableTree;
  tree = tree.toJS();
  if (light)
    tree = getLightTree(tree, children1AsArray);
  return tree;
};

export const loadTree = (serTree) => {
  if (isImmutableTree(serTree)) {
    return serTree;
  } else if (isTree(serTree)) {
    return jsTreeToImmutable(serTree);
  } else if (typeof serTree == "string" && serTree.startsWith('["~#iM"')) {
    //tip: old versions of RAQB were saving tree with `transit.toJSON()`
    // https://github.com/ukrbublik/react-awesome-query-builder/issues/69
    throw "You are trying to load query in obsolete serialization format (Immutable string) which is not supported in versions starting from 2.1.17";
  } else if (typeof serTree == "string") {
    return jsTreeToImmutable(JSON.parse(serTree));
  } else throw "Can't load tree!";
};

export const checkTree = (tree, config) => {
  if (!tree) return undefined;
  const extendedConfig = extendConfig(config);
  return validateTree(tree, null, extendedConfig, extendedConfig);
};

export const isValidTree = (tree) => {
  return getTreeBadFields(tree).length == 0;
};

export const isImmutableTree = (tree) => {
  return Map.isMap(tree);
};

export const isTree = (tree) => {
  return typeof tree == "object" && (tree.type == "group" || tree.type == "switch_group");
};

export {isJsonLogic};

function jsTreeToImmutable(tree) {
  return fromJS(tree, function (key, value) {
    let outValue;
    if (key == "properties") {
      outValue = value.toOrderedMap();

      // `value` should be undefined instead of null
      // JSON doesn't support undefined and replaces undefined -> null
      // So fix: null -> undefined
      for (let i = 0 ; i < 2 ; i++) {
        if (outValue.get("value")?.get(i) === null) {
          outValue = outValue.setIn(["value", i], undefined);
        }
      }
    } else if (key == "value" && value.get(0) && value.get(0).toJS !== undefined) {
      const valueJs = value.get(0).toJS();
      if (valueJs.func) {
        outValue = value.toOrderedMap();
      } else {
        // only for raw values keep JS representation
        outValue = Immutable.List.of(valueJs);
      }
    } else if (key == "asyncListValues") {
      // keep in JS format
      outValue = value.toJS();
    } else if (key == "children1" && Immutable.Iterable.isIndexed(value)) {
      outValue = new Immutable.OrderedMap(value.map(child => [child.get("id"), child]));
    } else {
      outValue = Immutable.Iterable.isIndexed(value) ? value.toList() : value.toOrderedMap();
    }
    return outValue;
  });
}

