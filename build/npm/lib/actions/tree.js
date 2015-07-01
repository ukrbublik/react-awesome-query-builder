'use strict';

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

exports.__esModule = true;

var _constants = require('../constants');

var constants = _interopRequireWildcard(_constants);

/**
 * @param {Immutable.Map} tree
 */
var setTree = function setTree(tree) {
  return {
    type: constants.SET_TREE,
    tree: tree
  };
};

exports.setTree = setTree;
/**
 * @param {Immutable.List} path
 * @param {object} properties
 */
var addRule = function addRule(path, properties) {
  return {
    type: constants.ADD_RULE,
    path: path,
    rule: properties
  };
};

exports.addRule = addRule;
/**
 * @param {Immutable.List} path
 */
var removeRule = function removeRule(path) {
  return {
    type: constants.REMOVE_RULE,
    path: path
  };
};

exports.removeRule = removeRule;
/**
 * @param {Immutable.List} path
 * @param {object} properties
 */
var addGroup = function addGroup(path, properties) {
  return {
    type: constants.ADD_GROUP,
    path: path,
    group: properties
  };
};

exports.addGroup = addGroup;
/**
 * @param {Immutable.List} path
 */
var removeGroup = function removeGroup(path) {
  return {
    type: constants.REMOVE_GROUP,
    path: path
  };
};
exports.removeGroup = removeGroup;