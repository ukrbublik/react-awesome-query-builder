'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _expandTreePath = require('../utils/expandTreePath');

var _expandTreePath2 = _interopRequireDefault(_expandTreePath);

var _defaultRoot = require('../utils/defaultRoot');

var _defaultRoot2 = _interopRequireDefault(_defaultRoot);

var _defaultRuleProperties = require('../utils/defaultRuleProperties');

var _defaultRuleProperties2 = _interopRequireDefault(_defaultRuleProperties);

var _constants = require('../constants');

var constants = _interopRequireWildcard(_constants);

var _uuid = require('../utils/uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _defaultGroupProperties = require('../utils/defaultGroupProperties');

var _defaultGroupProperties2 = _interopRequireDefault(_defaultGroupProperties);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var stringify = require('json-stringify-safe');

var hasChildren = function hasChildren(tree, path) {
  return tree.getIn((0, _expandTreePath2.default)(path, 'children1')).size > 0;
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {object} properties
 */
var addNewGroup = function addNewGroup(state, path, properties, config) {
  console.log("Adding group");
  var groupUuid = (0, _uuid2.default)();
  state = addItem(state, path, 'group', groupUuid, (0, _defaultGroupProperties2.default)(config).merge(properties || {}));

  var groupPath = path.push(groupUuid);
  // If we don't set the empty map, then the following merge of addItem will create a Map rather than an OrderedMap for some reason
  state = state.setIn((0, _expandTreePath2.default)(groupPath, 'children1'), new _immutable2.default.OrderedMap());
  state = addItem(state, groupPath, 'rule', (0, _uuid2.default)(), (0, _defaultRuleProperties2.default)(config).merge(properties || {}));
  state = addItem(state, groupPath, 'rule', (0, _uuid2.default)(), (0, _defaultRuleProperties2.default)(config).merge(properties || {}));
  return state;
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {object} properties
 */
var removeGroup = function removeGroup(state, path, config) {
  state = removeItem(state, path);

  var parentPath = path.slice(0, -1);
  if (!hasChildren(state, parentPath)) {
    state = addItem(state, parentPath, 'rule', (0, _uuid2.default)(), (0, _defaultRuleProperties2.default)(config));
  }
  return state;
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 */
var removeRule = function removeRule(state, path, config) {
  state = removeItem(state, path);

  var parentPath = path.slice(0, -1);
  if (!hasChildren(state, parentPath)) {
    state = addItem(state, parentPath, 'rule', (0, _uuid2.default)(), (0, _defaultRuleProperties2.default)(config));
  }
  return state;
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} conjunction
 */
var setConjunction = function setConjunction(state, path, conjunction) {
  return state.setIn((0, _expandTreePath2.default)(path, 'properties', 'conjunction'), conjunction);
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} type
 * @param {string} id
 * @param {Immutable.OrderedMap} properties
 */
var addItem = function addItem(state, path, type, id, properties) {
  return state.mergeIn((0, _expandTreePath2.default)(path, 'children1'), new _immutable2.default.OrderedMap(_defineProperty({}, id, new _immutable2.default.Map({ type: type, id: id, properties: properties }))));
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 */
var removeItem = function removeItem(state, path) {
  return state.deleteIn((0, _expandTreePath2.default)(path));
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} field
 */
var setField = function setField(state, path, field, config) {
  return state.updateIn((0, _expandTreePath2.default)(path, 'properties'), function (map) {
    return map.withMutations(function (current) {
      var currentField = current.get('field');
      var currentOperator = current.get('operator');
      var currentValue = current.get('value');

      // If the newly selected field supports the same operator the rule currently
      // uses, keep it selected.
      var operator = config.fields[field].operators.indexOf(currentOperator) !== -1 ? currentOperator : (0, _defaultRuleProperties.defaultOperator)(config, field);

      var operatorCardinality = config.operators[operator].cardinality || 1;

      return current.set('field', field).set('operator', operator).set('operatorOptions', (0, _defaultRuleProperties.defaultOperatorOptions)(config, operator)).set('valueOptions', (0, _defaultRuleProperties.defaultValueOptions)(config, operator)).set('value', function (currentWidget, nextWidget) {
        return currentWidget !== nextWidget ? new _immutable2.default.List() : new _immutable2.default.List(currentValue.take(operatorCardinality));
      }(config.fields[currentField].widget, config.fields[field].widget));
    });
  });
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} operator
 */
var setOperator = function setOperator(state, path, operator, config) {
  return state.updateIn((0, _expandTreePath2.default)(path, 'properties'), function (map) {
    return map.withMutations(function (current) {
      var operatorCardinality = config.operators[operator].cardinality || 1;
      var currentValue = current.get('value', new _immutable2.default.List());
      var nextValue = new _immutable2.default.List(currentValue.take(operatorCardinality));

      return current.set('operator', operator).set('operatorOptions', (0, _defaultRuleProperties.defaultOperatorOptions)(config, operator)).set('valueOptions', (0, _defaultRuleProperties.defaultValueOptions)(config, operator)).set('value', nextValue);
    });
  });
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {integer} delta
 * @param {*} value
 */
var setValue = function setValue(state, path, delta, value) {
  return state.setIn((0, _expandTreePath2.default)(path, 'properties', 'value', delta + ''), value);
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} name
 * @param {*} value
 */
var setOperatorOption = function setOperatorOption(state, path, name, value) {
  return state.setIn((0, _expandTreePath2.default)(path, 'properties', 'operatorOptions', name), value);
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} name
 * @param {*} value
 */
var setValueOption = function setValueOption(state, path, delta, name, value) {
  return state.setIn((0, _expandTreePath2.default)(path, 'properties', 'valueOptions', delta + '', name), value);
};

/**
 * @param {Immutable.Map} state
 * @param {object} action
 */

exports.default = function (config) {
  return function () {
    var state = arguments.length <= 0 || arguments[0] === undefined ? (0, _defaultRoot2.default)(config) : arguments[0];
    var action = arguments[1];

    switch (action.type) {
      case constants.SET_TREE:
        return action.tree;

      case constants.ADD_NEW_GROUP:
        //        console.log("Adding New group");
        return addNewGroup(state, action.path, action.properties, action.config);

      case constants.ADD_GROUP:
        //        console.log("Adding group");
        return addItem(state, action.path, 'group', action.id, action.properties);

      case constants.REMOVE_GROUP:
        return removeGroup(state, action.path, action.config);
      //      return removeItem(state, action.path);

      case constants.ADD_RULE:
        //        console.log("Adding rule");
        return addItem(state, action.path, 'rule', action.id, action.properties);

      case constants.REMOVE_RULE:
        return removeRule(state, action.path, action.config);
      //      return removeItem(state, action.path);

      case constants.SET_CONJUNCTION:
        return setConjunction(state, action.path, action.conjunction);

      case constants.SET_FIELD:
        return setField(state, action.path, action.field, action.config);

      case constants.SET_OPERATOR:
        return setOperator(state, action.path, action.operator, action.config);

      case constants.SET_VALUE:
        return setValue(state, action.path, action.delta, action.value);

      case constants.SET_OPERATOR_OPTION:
        return setOperatorOption(state, action.path, action.name, action.value);

      case constants.SET_VALUE_OPTION:
        return setValueOption(state, action.path, action.delta, action.name, action.value);

      default:
        console.log("Returning defaultRoot=" + state);
        return state;
    }
  };
};