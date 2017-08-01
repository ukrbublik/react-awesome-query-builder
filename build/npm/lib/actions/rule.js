'use strict';

exports.__esModule = true;
exports.setOperatorOption = exports.setValue = exports.setOperator = exports.setField = undefined;

var _constants = require('../constants');

var constants = _interopRequireWildcard(_constants);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {string} field
 */
var setField = exports.setField = function setField(config, path, field) {
  return {
    type: constants.SET_FIELD,
    path: path,
    field: field,
    config: config
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {string} operator
 */
var setOperator = exports.setOperator = function setOperator(config, path, operator) {
  return {
    type: constants.SET_OPERATOR,
    path: path,
    operator: operator,
    config: config
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {integer} delta
 * @param {*} value
 */
var setValue = exports.setValue = function setValue(config, path, delta, value) {
  return {
    type: constants.SET_VALUE,
    path: path,
    delta: delta,
    value: value,
    config: config
  };
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {string} name
 * @param {*} value
 */
var setOperatorOption = exports.setOperatorOption = function setOperatorOption(config, path, name, value) {
  return {
    type: constants.SET_OPERATOR_OPTION,
    path: path,
    name: name,
    value: value,
    config: config
  };
};