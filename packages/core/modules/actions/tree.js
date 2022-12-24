import Immutable from "immutable";
import {toImmutableList} from "../utils/stuff";
import * as constants from "../stores/constants";
import { defaultRuleProperties, defaultGroupProperties } from "../utils/defaultUtils";
import uuid from "../utils/uuid";


/**
 * @param {object} config
 * @param {Immutable.Map} tree
 */
export const setTree = (config, tree) => ({
  type: constants.SET_TREE,
  tree: tree,
  config: config
});

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {Immutable.Map} properties
 */
export const addRule = (config, path, properties, ruleType = "rule", children = null) => ({
  type: constants.ADD_RULE,
  ruleType: ruleType,
  children: children,
  path: toImmutableList(path),
  id: uuid(),
  properties: defaultRuleProperties(config).merge(properties || {}),
  config: config
});

/**
 * @param {object} config
 * @param {Immutable.List} path
 */
export const removeRule = (config, path) => ({
  type: constants.REMOVE_RULE,
  path: toImmutableList(path),
  config: config
});

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {Immutable.Map} properties
 */
export const addDefaultCaseGroup = (config, path, properties, children = null) => ({
  type: constants.ADD_CASE_GROUP,
  path: toImmutableList(path),
  children: children,
  id: uuid(),
  properties: defaultGroupProperties(config).merge(properties || {}),
  config: config,
  meta: {
    isDefaultCase: true
  }
});

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {Immutable.Map} properties
 */
export const addCaseGroup = (config, path, properties, children = null) => ({
  type: constants.ADD_CASE_GROUP,
  path: toImmutableList(path),
  children: children,
  id: uuid(),
  properties: defaultGroupProperties(config).merge(properties || {}),
  config: config
});

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {Immutable.Map} properties
 */
export const addGroup = (config, path, properties, children = null) => ({
  type: constants.ADD_GROUP,
  path: toImmutableList(path),
  children: children,
  id: uuid(),
  properties: defaultGroupProperties(config).merge(properties || {}),
  config: config
});

/**
 * @param {object} config
 * @param {Immutable.List} path
 */
export const removeGroup = (config, path) => ({
  type: constants.REMOVE_GROUP,
  path: toImmutableList(path),
  config: config
});

/**
 * @param {object} config
 * @param {Array} fromPath
 * @param {Array} toPath
 * @param {String} placement, see constants PLACEMENT_*
 */
export const moveItem = (config, fromPath, toPath, placement) => ({
  type: constants.MOVE_ITEM,
  fromPath: toImmutableList(fromPath),
  toPath: toImmutableList(toPath),
  placement: placement,
  config: config,
});
