import * as constants from '../constants';

/**
 * @param {Immutable.Map} tree
 */
export const setTree = (tree) => ({
	type: constants.SET_TREE,
  tree: tree
});

/**
 * @param {Immutable.List} path
 * @param {object} properties
 */
export const addRule = (path, properties) => ({
  type: constants.ADD_RULE,
  path: path,
  rule: properties
});

/**
 * @param {Immutable.List} path
 */
export const removeRule = (path) => ({
  type: constants.REMOVE_RULE,
  path: path
});

/**
 * @param {Immutable.List} path
 * @param {object} properties
 */
export const addGroup = (path, properties) => ({
  type: constants.ADD_GROUP,
  path: path,
  group: properties
});

/**
 * @param {Immutable.List} path
 */
export const removeGroup = (path) => ({
  type: constants.REMOVE_GROUP,
  path: path
});
