'use strict';

exports.__esModule = true;
exports.getChild = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _uuid = require('./uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _defaultRuleProperties = require('./defaultRuleProperties');

var _defaultRuleProperties2 = _interopRequireDefault(_defaultRuleProperties);

var _defaultGroupProperties = require('./defaultGroupProperties');

var _defaultGroupProperties2 = _interopRequireDefault(_defaultGroupProperties);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var getChild = exports.getChild = function getChild(id, config) {
  return _defineProperty({}, id, new _immutable2.default.Map({
    type: 'rule',
    id: id,
    properties: (0, _defaultRuleProperties2.default)(config)
  }));
};

exports.default = function (config) {
  if (config.tree) {
    return new _immutable2.default.Map(config.tree);
  }

  return new _immutable2.default.Map({
    type: 'group',
    id: (0, _uuid2.default)(),
    children1: new _immutable2.default.OrderedMap(_extends({}, getChild((0, _uuid2.default)(), config))),
    properties: (0, _defaultGroupProperties2.default)(config)
  });
};