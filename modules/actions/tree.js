import uuid from '../utils/uuid';
import * as constants from '../constants';

/**
 * @param {Immutable.Map} tree
 */
export const setTree = (tree, config) => ({
	type: constants.SET_TREE,
  tree: tree,
  config: config
});

/**
 * @param {Immutable.List} path
 * @param {object} properties
 */
export const addRule = (path, config, properties) => ({
  type: constants.ADD_RULE,
  path: path,
  id: uuid(),
  properties: properties,
  config: config
});

/**
 * @param {Immutable.List} path
 */
export const removeRule = (path, config) => ({
  type: constants.REMOVE_RULE,
  path: path,
  config: config
});

/**
 * @param {Immutable.List} path
 * @param {object} properties
 */
export const addGroup = (path, config, properties) => ({
  type: constants.ADD_GROUP,
  path: path,
  id: uuid(),
  properties: properties,
  config: config
});

/**
 * @param {Immutable.List} path
 */
export const removeGroup = (path, config) => ({
  type: constants.REMOVE_GROUP,
  path: path,
  config: config
});
