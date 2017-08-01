'use strict';

exports.__esModule = true;
exports.defaultOperatorOptions = exports.defaultOperator = exports.defaultField = undefined;

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

var _range = require('lodash/range');

var _range2 = _interopRequireDefault(_range);

var _configUtils = require('./configUtils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultField = exports.defaultField = function defaultField(config) {
  var canGetFirst = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  return typeof config.settings.defaultField === 'function' ? config.settings.defaultField() : config.settings.defaultField || (canGetFirst ? (0, _configUtils.getFirstField)(config) : null);
};

var defaultOperator = exports.defaultOperator = function defaultOperator(config, field) {
  var canGetFirst = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  var fieldConfig = (0, _configUtils.getFieldConfig)(field, config);
  var fieldDefaultOperator = fieldConfig.defaultOperator || (canGetFirst ? getFirstOperator(config, field) : null);
  var op = typeof config.settings.defaultOperator === 'function' ? config.settings.defaultOperator(field, fieldConfig) : fieldDefaultOperator;
  return op;
};

//used for complex operators like proximity
var defaultOperatorOptions = exports.defaultOperatorOptions = function defaultOperatorOptions(config, operator, field) {
  if (!operator) return new _immutable2.default.Map();
  return new _immutable2.default.Map(config.operators[operator].options && config.operators[operator].options.defaults || {});
};

exports.default = function (config) {
  var field = null,
      operator = null;
  if (config.settings.setDefaultFieldAndOp) {
    field = defaultField(config);
    operator = defaultOperator(config, field);
  }

  return new _immutable2.default.Map({
    field: field,
    operator: operator,
    value: new _immutable2.default.List(),
    //used for complex operators like proximity
    operatorOptions: defaultOperatorOptions(config, operator, field)
  });
};