'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

exports.__esModule = true;

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _utilsDefaultRoot = require('../utils/defaultRoot');

var _utilsDefaultRoot2 = _interopRequireDefault(_utilsDefaultRoot);

var _utilsUuid = require('../utils/uuid');

var _utilsUuid2 = _interopRequireDefault(_utilsUuid);

var _constants = require('../constants');

var constants = _interopRequireWildcard(_constants);

/**
 * @param {Immutable.List} path
 * @param {...string} suffix
 */
var expandTreePath = function expandTreePath(path) {
  for (var _len = arguments.length, suffix = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    suffix[_key - 1] = arguments[_key];
  }

  return path.interpose('children').withMutations(function (list) {
    list.skip(1);
    list.push.apply(list, suffix);
    return list;
  });
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} conjunction
 */
var setConjunction = function setConjunction(state, path, conjunction) {
  return state.setIn(expandTreePath(path, 'properties', 'conjunction'), conjunction);
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {Immutable.Map} item
 */
var addItem = function addItem(state, path, item) {
  var _ref;

  return state.mergeIn(expandTreePath(path, 'children'), new _immutable2['default'].OrderedMap((_ref = {}, _ref[item.get('id')] = item, _ref)));
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 */
var removeItem = function removeItem(state, path) {
  return state.deleteIn(expandTreePath(path));
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} field
 */
var setField = function setField(state, path, field) {
  return state.withMutations(function (map) {
    var expandedPath = expandTreePath(path, 'properties');
    return map.deleteIn(expandedPath.push('operator')).setIn(expandedPath.push('field'), field).setIn(expandedPath.push('options'), new _immutable2['default'].Map()).setIn(expandedPath.push('value'), new _immutable2['default'].List());
  });
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} operator
 */
var setOperator = function setOperator(state, path, operator) {
  return state.withMutations(function (map) {
    return map.setIn(expandTreePath(path, 'properties').push('operator'), operator);
  });
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {integer} delta
 * @param {*} value
 */
var setValue = function setValue(state, path, delta, value) {
  return state.setIn(expandTreePath(path, 'properties', 'value', delta + ''), value);
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} name
 * @param {*} value
 */
var setOperatorOption = function setOperatorOption(state, path, name, value) {
  return state.setIn(expandTreePath(path, 'properties', 'operatorOptions', name), value);
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} name
 * @param {*} value
 */
var setValueOption = function setValueOption(state, path, delta, name, value) {
  return state.setIn(expandTreePath(path, 'properties', 'valueOptions', delta + '', name), value);
};

/**
 * @param {Immutable.Map} state
 * @param {object} action
 */

exports['default'] = function (config) {
  return function (state, action) {
    if (state === undefined) state = _utilsDefaultRoot2['default'](config);

    switch (action.type) {
      case constants.SET_TREE:
        return action.tree;

      case constants.ADD_GROUP:
        return addItem(state, action.path, new _immutable2['default'].Map({
          type: 'group',
          id: _utilsUuid2['default'](),
          properties: new _immutable2['default'].Map(action.group)
        }));

      case constants.REMOVE_GROUP:
        return removeItem(state, action.path);

      case constants.ADD_RULE:
        return addItem(state, action.path, new _immutable2['default'].Map({
          type: 'rule',
          id: _utilsUuid2['default'](),
          properties: new _immutable2['default'].Map(action.rule)
        }));

      case constants.REMOVE_RULE:
        return removeItem(state, action.path);

      case constants.SET_CONJUNCTION:
        return setConjunction(state, action.path, action.conjunction);

      case constants.SET_FIELD:
        return setField(state, action.path, action.field);

      case constants.SET_OPERATOR:
        return setOperator(state, action.path, action.operator);

      case constants.SET_VALUE:
        return setValue(state, action.path, action.delta, action.value);

      case constants.SET_OPERATOR_OPTION:
        return setOperatorOption(state, action.path, action.name, action.value);

      case constants.SET_VALUE_OPTION:
        return setValueOption(state, action.path, action.delta, action.name, action.value);

      default:
        return state;
    }
  };
};

module.exports = exports['default'];