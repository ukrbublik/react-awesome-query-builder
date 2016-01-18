'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultConjunction = undefined;

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultConjunction = exports.defaultConjunction = function defaultConjunction(config) {
  return config.settings.defaultConjunction || Object.keys(config.conjunctions)[0];
};

exports.default = function (config) {
  return new _immutable2.default.Map({
    conjunction: defaultConjunction(config)
  });
};