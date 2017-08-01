'use strict';

exports.__esModule = true;
exports.removeGroup = exports.removeGroupOld = exports.addGroup = exports.addGroupOld = exports.removeRule = exports.removeRuleOld = exports.addRule = exports.setTree = undefined;

var _uuid = require('../utils/uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _expandTreePath = require('../utils/expandTreePath');

var _expandTreePath2 = _interopRequireDefault(_expandTreePath);

var _defaultRuleProperties = require('../utils/defaultRuleProperties');

var _defaultRuleProperties2 = _interopRequireDefault(_defaultRuleProperties);

var _defaultGroupProperties = require('../utils/defaultGroupProperties');

var _defaultGroupProperties2 = _interopRequireDefault(_defaultGroupProperties);

var _constants = require('../constants');

var constants = _interopRequireWildcard(_constants);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hasChildren = function hasChildren(tree, path) {
  return tree.getIn((0, _expandTreePath2.default)(path, 'children1')).size > 0;
};

/**
 * @param {object} config
 * @param {Immutable.Map} tree
 */
var setTree = exports.setTree = function setTree(config, tree) {
  return {
    type: constants.SET_TREE,
    tree: tree
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {object} properties
 */
var addRule = exports.addRule = function addRule(config, path, properties) {
  return {
    type: constants.ADD_RULE,
    path: path,
    id: (0, _uuid2.default)(),
    properties: (0, _defaultRuleProperties2.default)(config).merge(properties || {})
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 */
var removeRuleOld = exports.removeRuleOld = function removeRuleOld(config, path) {
  return function (dispatch, getState) {
    dispatch({
      type: constants.REMOVE_RULE,
      path: path,
      config: config
    });

    var _getState = getState(),
        tree = _getState.tree;

    var parentPath = path.slice(0, -1);
    if (!hasChildren(tree, parentPath)) {
      dispatch(addRule(config, parentPath));
    }
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 */
var removeRule = exports.removeRule = function removeRule(config, path) {
  return {
    type: constants.REMOVE_RULE,
    path: path,
    config: config
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {object} properties
 */
var addGroupOld = exports.addGroupOld = function addGroupOld(config, path, properties) {
  return function (dispatch) {
    var groupUuid = (0, _uuid2.default)();

    dispatch({
      type: constants.ADD_GROUP,
      path: path,
      id: groupUuid,
      properties: (0, _defaultGroupProperties2.default)(config).merge(properties || {}),
      config: config
    });

    var groupPath = path.push(groupUuid);
    dispatch(addRule(config, groupPath));
    dispatch(addRule(config, groupPath));
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {object} properties
 */
var addGroup = exports.addGroup = function addGroup(config, path, properties) {
  return {
    type: constants.ADD_NEW_GROUP,
    path: path,
    properties: (0, _defaultGroupProperties2.default)(config).merge(properties || {}),
    config: config
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 */
var removeGroupOld = exports.removeGroupOld = function removeGroupOld(config, path) {
  return function (dispatch, getState) {
    dispatch({
      type: constants.REMOVE_GROUP,
      path: path,
      config: config
    });

    var _getState2 = getState(),
        tree = _getState2.tree;

    var parentPath = path.slice(0, -1);
    if (!hasChildren(tree, parentPath)) {
      dispatch(addRule(config, parentPath));
    }
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 */
var removeGroup = exports.removeGroup = function removeGroup(config, path) {
  return {
    type: constants.REMOVE_GROUP,
    path: path,
    config: config
  };
};