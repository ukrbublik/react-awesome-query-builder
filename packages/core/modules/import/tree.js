import Immutable, { Map } from "immutable";
import {getLightTree, _fixImmutableValue, fixPathsInTree, jsToImmutable} from "../utils/treeUtils";
import {isJsonLogic} from "../utils/stuff";

export {
  isJsonLogic, jsToImmutable,
};

export const getTree = (immutableTree, light = true, children1AsArray = true) => {
  if (!immutableTree) return undefined;
  let tree = immutableTree;
  tree = tree.toJS();
  tree = getLightTree(tree, light, children1AsArray);
  return tree;
};

export const loadTree = (serTree) => {
  if (isImmutableTree(serTree)) {
    return serTree;
  } else if (isTree(serTree)) {
    return fixPathsInTree(jsToImmutable(serTree));
  } else if (typeof serTree == "string" && serTree.startsWith('["~#iM"')) {
    //tip: old versions of RAQB were saving tree with `transit.toJSON()`
    // https://github.com/ukrbublik/react-awesome-query-builder/issues/69
    throw new Error("You are trying to load query in obsolete serialization format (Immutable string) which is not supported in versions starting from 2.1.17");
  } else if (typeof serTree === "string") {
    return fixPathsInTree(jsToImmutable(JSON.parse(serTree)));
  } else throw new Error("Can't load tree!");
};

export const isImmutableTree = (tree) => {
  return Map.isMap(tree);
};

export const isTree = (tree) => {
  return typeof tree == "object" && (tree.type == "group" || tree.type == "switch_group");
};


