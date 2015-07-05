import uuid from '../utils/uuid';
import expandTreePath from '../utils/expandTreePath';
import defaultRuleProperties from '../utils/defaultRuleProperties';
import * as constants from '../constants';

const hasChildren = (tree, path) =>
  tree.getIn(expandTreePath(path, 'children')).size > 0;

/**
 * @param {object} config
 * @param {Immutable.Map} tree
 */
export const setTree = (config, tree) => ({
	type: constants.SET_TREE,
  tree: tree
});

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {object} properties
 */
export const addRule = (config, path, properties) => ({
  type: constants.ADD_RULE,
  path: path,
  id: uuid(),
  properties: defaultRuleProperties(config).merge(properties || {})
});

/**
 * @param {object} config
 * @param {Immutable.List} path
 */
export const removeRule = (config, path) => {
  return (dispatch, getState) => {
    dispatch({
      type: constants.REMOVE_RULE,
      path: path,
      config: config
    });

    const { tree } = getState();
    const parentPath = path.slice(0, -1);
    if (!hasChildren(tree, parentPath)) {
      dispatch(addRule(config, parentPath));
    }
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {object} properties
 */
export const addGroup = (config, path, properties) => {
  return (dispatch) => {
    const groupUuid = uuid();

    dispatch({
      type: constants.ADD_GROUP,
      path: path,
      id: groupUuid,
      properties: properties,
      config: config
    });

    const groupPath = path.push(groupUuid);
    dispatch(addRule(config, groupPath));
    dispatch(addRule(config, groupPath));
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 */
export const removeGroup = (config, path) => {
  return (dispatch, getState) => {
    dispatch({
      type: constants.REMOVE_GROUP,
      path: path,
      config: config
    });

    const { tree } = getState();
    const parentPath = path.slice(0, -1);
    if (!hasChildren(tree, parentPath)) {
      dispatch(addRule(config, parentPath));
    }
  };
};
