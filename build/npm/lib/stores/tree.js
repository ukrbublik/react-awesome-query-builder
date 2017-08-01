'use strict';

exports.__esModule = true;

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

var _index = require('../utils/index');

var _configUtils = require('../utils/configUtils');

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

            var currentFieldConfig = (0, _index.getFieldConfig)(currentField, config);
            var fieldConfig = (0, _index.getFieldConfig)(field, config);

            // If the newly selected field supports the same operator the rule currently
            // uses, keep it selected.
            var lastOp = fieldConfig.operators.indexOf(currentOperator) !== -1 ? currentOperator : null;
            var operator = null;
            var availOps = (0, _configUtils.getOperatorsForField)(config, field);
            if (availOps.length == 1) operator = availOps[0];else if (availOps.length > 1) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = (config.settings.setOpOnChangeField || [])[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var strategy = _step.value;

                        if (strategy == 'keep') operator = lastOp;else if (strategy == 'default') operator = (0, _defaultRuleProperties.defaultOperator)(config, field, false);else if (strategy == 'first') operator = (0, _defaultRuleProperties.getFirstOperator)(config, field);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
            var operatorCardinality = operator ? (0, _index.defaultValue)(config.operators[operator].cardinality, 1) : null;

            return current.set('field', field).set('operator', operator).set('operatorOptions', (0, _defaultRuleProperties.defaultOperatorOptions)(config, operator, field)).set('value', function (currentWidget, nextWidget) {
                return currentWidget !== nextWidget || config.settings.clearValueOnChangeField ? new _immutable2.default.List() : new _immutable2.default.List(currentValue.take(operatorCardinality));
            }(currentFieldConfig ? currentFieldConfig.widget : null, fieldConfig ? fieldConfig.widget : null));
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
            var operatorCardinality = (0, _index.defaultValue)(config.operators[operator].cardinality, 1);
            var currentValue = current.get('value', new _immutable2.default.List());
            var currentField = current.get('field');
            var nextValue = new _immutable2.default.List(currentValue.take(operatorCardinality));

            return current.set('operator', operator).set('operatorOptions', (0, _defaultRuleProperties.defaultOperatorOptions)(config, operator, currentField)).set('value', nextValue);
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
    if (typeof value === "undefined") {
        return state.deleteIn((0, _expandTreePath2.default)(path, 'properties', 'value', delta + ''));
    } else {
        return state.setIn((0, _expandTreePath2.default)(path, 'properties', 'value', delta + ''), value);
    }
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
 * @param {object} action
 */

exports.default = function (config) {
    return function () {
        var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : (0, _defaultRoot2.default)(config);
        var action = arguments[1];

        switch (action.type) {
            case constants.SET_TREE:
                return action.tree;

            case constants.ADD_NEW_GROUP:
                return addNewGroup(state, action.path, action.properties, action.config);

            case constants.ADD_GROUP:
                return addItem(state, action.path, 'group', action.id, action.properties);

            case constants.REMOVE_GROUP:
                return removeGroup(state, action.path, action.config);

            case constants.ADD_RULE:
                return addItem(state, action.path, 'rule', action.id, action.properties);

            case constants.REMOVE_RULE:
                return removeRule(state, action.path, action.config);

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

            default:
                return state;
        }
    };
};