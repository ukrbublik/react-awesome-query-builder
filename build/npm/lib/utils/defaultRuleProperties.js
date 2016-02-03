'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultValueOptions = exports.defaultOperatorOptions = exports.defaultOperator = exports.defaultField = undefined;

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

var _range = require('lodash/range');

var _range2 = _interopRequireDefault(_range);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultField = exports.defaultField = function defaultField(config) {
  return typeof config.settings.defaultField === 'function' ? config.settings.defaultField(config) : config.settings.defaultField || Object.keys(config.fields)[0];
};

var defaultOperator = exports.defaultOperator = function defaultOperator(config, field) {
  return typeof config.settings.defaultOperator === 'function' ? config.settings.defaultOperator(field, config) : config.settings.defaultOperator || config.fields[field].operators[0];
};

var defaultOperatorOptions = exports.defaultOperatorOptions = function defaultOperatorOptions(config, operator) {
  return new _immutable2.default.Map(config.operators[operator].options && config.operators[operator].options.defaults || {});
};

var defaultValueOptions = exports.defaultValueOptions = function defaultValueOptions(config, operator) {
  return new _immutable2.default.List((0, _map2.default)((0, _range2.default)(0, config.operators[operator].cardinality), function () {
    return new _immutable2.default.Map(config.operators[operator].valueOptions && config.operators[operator].valueOptions.defaults || {});
  }));
};

exports.default = function (config) {
  var field = defaultField(config, field);
  var operator = defaultOperator(config, field);

  return new _immutable2.default.Map({
    field: field,
    operator: operator,
    value: new _immutable2.default.List(),
    operatorOptions: defaultOperatorOptions(config, operator),
    valueOptions: defaultValueOptions(config, operator)
  });
};