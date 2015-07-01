'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

exports['default'] = function (config) {
  return {
    value: new _immutable2['default'].List(),
    operatorOptions: new _immutable2['default'].Map(),
    valueOptions: new _immutable2['default'].Map()
  };
};

module.exports = exports['default'];