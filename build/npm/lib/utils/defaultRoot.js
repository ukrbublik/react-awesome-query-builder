'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _uuid = require('./uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _defaultRuleProperties = require('./defaultRuleProperties');

var _defaultRuleProperties2 = _interopRequireDefault(_defaultRuleProperties);

var _defaultGroupProperties = require('./defaultGroupProperties');

var _defaultGroupProperties2 = _interopRequireDefault(_defaultGroupProperties);

var getChild = function getChild(id, config) {
  var _ref;

  return (_ref = {}, _ref[id] = new _immutable2['default'].Map({
    type: 'rule',
    id: id,
    properties: new _immutable2['default'].Map(_defaultRuleProperties2['default'](config))
  }), _ref);
};

exports['default'] = function (config) {
  return new _immutable2['default'].Map({
    type: 'group',
    id: _uuid2['default'](),
    children: new _immutable2['default'].OrderedMap(getChild(_uuid2['default'](), config)),
    properties: new _immutable2['default'].Map(_defaultGroupProperties2['default'](config))
  });
};

module.exports = exports['default'];