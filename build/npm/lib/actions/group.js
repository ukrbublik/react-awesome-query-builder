'use strict';

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

exports.__esModule = true;

var _constants = require('../constants');

var constants = _interopRequireWildcard(_constants);

/**
 * @param {Immutable.List} path
 * @param {string} conjunction
 */
var setConjunction = function setConjunction(path, conjunction) {
  return {
    type: constants.SET_CONJUNCTION,
    path: path,
    conjunction: conjunction
  };
};
exports.setConjunction = setConjunction;