'use strict';

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

exports.__esModule = true;

var _constants = require('../constants');

var constants = _interopRequireWildcard(_constants);

/**
 * @param {Immutable.List} path
 * @param {string} field
 */
var setField = function setField(path, field) {
  return {
    type: constants.SET_FIELD,
    path: path,
    field: field
  };
};

exports.setField = setField;
/**
 * @param {Immutable.List} path
 * @param {string} operator
 */
var setOperator = function setOperator(path, operator) {
  return {
    type: constants.SET_OPERATOR,
    path: path,
    operator: operator
  };
};

exports.setOperator = setOperator;
/**
 * @param {Immutable.List} path
 * @param {integer} delta
 * @param {*} value
 */
var setValue = function setValue(path, delta, value) {
  return {
    type: constants.SET_VALUE,
    path: path,
    delta: delta,
    value: value
  };
};

exports.setValue = setValue;
/**
 * @param {Immutable.List} path
 * @param {string} name
 * @param {*} value
 */
var setOperatorOption = function setOperatorOption(path, name, value) {
  return {
    type: constants.SET_OPERATOR_OPTION,
    path: path,
    name: name,
    value: value
  };
};

exports.setOperatorOption = setOperatorOption;
/**
 * @param {Immutable.List} path
 * @param {integer} delta
 * @param {string} name
 * @param {*} value
 */
var setValueOption = function setValueOption(path, delta, name, value) {
  return {
    type: constants.SET_VALUE_OPTION,
    path: path,
    delta: delta,
    name: name,
    value: value
  };
};
exports.setValueOption = setValueOption;