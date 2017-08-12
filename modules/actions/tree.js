import uuid from '../utils/uuid';
import {expandTreePath} from '../utils/treeUtils';
import {defaultRuleProperties, defaultGroupProperties} from '../utils/defaultUtils';

import * as constants from '../constants';
import Immutable from 'immutable';

const hasChildren = (tree, path) =>
  tree.getIn(expandTreePath(path, 'children1')).size > 0;

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

// /**
//  * @param {object} config
//  * @param {Immutable.List} path
//  */
// export const removeRuleOld = (config, path) => {
//   return (dispatch, getState) => {
//     dispatch({
//       type: constants.REMOVE_RULE,
//       path: path,
//       config: config
//     });

//     const { tree } = getState();
//     const parentPath = path.slice(0, -1);
//     if (!hasChildren(tree, parentPath)) {
//       dispatch(addRule(config, parentPath));
//     }
//   };
// };

/**
 * @param {object} config
 * @param {Immutable.List} path
 */
export const removeRule = (config, path) => ({
  type: constants.REMOVE_RULE,
  path: path,
  config: config
});


// /**
//  * @param {object} config
//  * @param {Immutable.List} path
//  * @param {object} properties
//  */
// export const addGroupOld = (config, path, properties) => {
//   return (dispatch) => {
//     const groupUuid = uuid();

//     dispatch({
//       type: constants.ADD_GROUP,
//       path: path,
//       id: groupUuid,
//       properties: defaultGroupProperties(config).merge(properties || {}),
//       config: config
//     });

//     const groupPath = path.push(groupUuid);
//     dispatch(addRule(config, groupPath));
//     dispatch(addRule(config, groupPath));
//   };
// };

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {object} properties
 */
export const addGroup = (config, path, properties) => ({
    type: constants.ADD_NEW_GROUP,
    path: path,
    properties: defaultGroupProperties(config).merge(properties || {}),
    config: config
});



// /**
//  * @param {object} config
//  * @param {Immutable.List} path
//  */
// export const removeGroupOld = (config, path) => {
//   return (dispatch, getState) => {
//     dispatch({
//       type: constants.REMOVE_GROUP,
//       path: path,
//       config: config
//     });

//     const { tree } = getState();
//     const parentPath = path.slice(0, -1);
//     if (!hasChildren(tree, parentPath)) {
//       dispatch(addRule(config, parentPath));
//     }
//   };
// };

/**
 * @param {object} config
 * @param {Immutable.List} path
 */
export const removeGroup = (config, path) => ({
    type: constants.REMOVE_GROUP,
    path: path,
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
  fromPath: new Immutable.List(fromPath),
  toPath: new Immutable.List(toPath),
  placement: placement,
  config: config,
});
