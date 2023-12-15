import Immutable, { fromJS, Map } from "immutable";
import {sanitizeTree} from "../utils/validation";
import {getTreeBadFields, getLightTree, _fixImmutableValue} from "../utils/treeUtils";
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
    return jsToImmutable(serTree);
  } else if (typeof serTree == "string" && serTree.startsWith('["~#iM"')) {
    //tip: old versions of RAQB were saving tree with `transit.toJSON()`
    // https://github.com/ukrbublik/react-awesome-query-builder/issues/69
    throw "You are trying to load query in obsolete serialization format (Immutable string) which is not supported in versions starting from 2.1.17";
  } else if (typeof serTree == "string") {
    return jsToImmutable(JSON.parse(serTree));
  } else throw "Can't load tree!";
};

// @deprecated
export const checkTree = sanitizeTree;

export const isValidTree = (tree, config) => {
  return getTreeBadFields(tree, config).length == 0;
};

export const isImmutableTree = (tree) => {
  return Map.isMap(tree);
};

export const isTree = (tree) => {
  return typeof tree == "object" && (tree.type == "group" || tree.type == "switch_group");
};

export {isJsonLogic};

export function jsToImmutable(tree) {
  const imm = fromJS(tree, function (key, value, path) {
    const isFuncArg = path
      && path.length > 3
      && path[path.length-1] === "value"
      && path[path.length-3] === "args";
    const isRuleValue = path
      && path.length > 3
      && path[path.length-1] === "value"
      && path[path.length-2] === "properties";

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
    } else if (isFuncArg) {
      outValue = _fixImmutableValue(value);
    } else if ((path ? isRuleValue : key == "value") && Immutable.Iterable.isIndexed(value)) {
      outValue = value.map(_fixImmutableValue).toList();
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
  return imm;
}

