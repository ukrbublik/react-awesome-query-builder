'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.queryBuilderToTree = exports.queryBuilderFormat = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _uuid = require('./uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _isArray = require('lodash/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 Build tree to http://querybuilder.js.org/ like format

 Example:
 {
 "condition": "AND",
 "rules": [
 {
 "id": "price",
 "field": "price",
 "type": "double",
 "input": "text",
 "operator": "less",
 "value": "10.25"
 },
 {
 "condition": "OR",
 "rules": [
 {
 "id": "category",
 "field": "category",
 "type": "integer",
 "input": "select",
 "operator": "equal",
 "value": "2"
 },
 {
 "id": "category",
 "field": "category",
 "type": "integer",
 "input": "select",
 "operator": "equal",
 "value": "1"
 }
 ]}
 ]
 }
 */
var queryBuilderFormat = exports.queryBuilderFormat = function queryBuilderFormat(item, config) {

    var type = item.get('type');
    var properties = item.get('properties');
    var children = item.get('children1');
    var id = item.get('id');

    var resultQuery = {};

    if (type === 'group' && children && children.size) {
        var conjunction = properties.get('conjunction');
        // const conjunctionDefinition = config.conjunctions[conjunction];
        resultQuery['condition'] = conjunction.toUpperCase();

        var _value = children.map(function (currentChild) {
            return queryBuilderFormat(currentChild, config);
        }).filter(function (currentChild) {
            return typeof currentChild !== 'undefined';
        });

        if (!_value.size) {
            return undefined;
        }
        resultQuery['rules'] = _value.toList();
        return resultQuery;
    }
    if (type === 'rule') {
        var value;
        var ruleQuery;

        var _ret = function () {
            if (typeof properties.get('field') === 'undefined' || typeof properties.get('operator') === 'undefined') {
                return {
                    v: undefined
                };
            }
            var field = properties.get('field');
            var operator = properties.get('operator');
            var options = properties.get('operatorOptions');
            var valueOptions = properties.get('valueOptions');

            var fieldDefinition = config.fields[field] || {};
            var operatorDefinition = config.operators[operator] || {};

            var fieldType = fieldDefinition.type || "string";

            var cardinality = operatorDefinition.cardinality || 1;
            var widget = config.widgets[fieldDefinition.widget];

            value = properties.get('value').map(function (currentValue) {
                return(
                    // Widgets can optionally define a value extraction function. This is useful in cases
                    // where an advanced widget is made up of multiple input fields that need to be composed
                    // when building the query string.
                    typeof widget.value === 'function' ? widget.value(currentValue, config) : currentValue
                );
            });


            if (value.size < cardinality) {
                return {
                    v: undefined
                };
            }
            if (cardinality == 1) {}

            ruleQuery = {
                id: id,
                field: field,
                operator: operator,
                value: value,
                type: fieldType,
                input: fieldDefinition.widget
            };

            return {
                v: ruleQuery
            };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    }
    return undefined;
};

var queryBuilderToTree = exports.queryBuilderToTree = function queryBuilderToTree(ruleset) {
    var condition = ruleset.condition;
    var tree = {};
    tree.id = (0, _uuid2.default)();
    if (condition) {
        tree.type = 'group';
        var childrens = new _immutable2.default.List(ruleset.rules).map(queryBuilderToTree);
        childrens = childrens.reduce(function (result, item) {
            return result.set(item.get('id'), item);
        }, new _immutable2.default.OrderedMap());
        tree.children1 = childrens;
        tree.properties = new _immutable2.default.Map({ conjunction: condition, id: (0, _uuid2.default)() });
    } else {
        var id = ruleset.id;
        var field = ruleset.field;
        var input = ruleset.input;
        var type = ruleset.type;
        var value = ruleset.value;
        var operator = ruleset.operator;

        var list_value = value;
        if ((0, _isArray2.default)(value)) {
            list_value = new _immutable2.default.List(value);
        } else {
            list_value = new _immutable2.default.List([value]);
        }
        var properties = new _immutable2.default.Map({
            type: type,
            operator: operator,
            field: field || id,
            widget: input || type,
            value: list_value
        });
        tree.properties = properties;
        tree.type = 'rule';
    }
    return new _immutable2.default.Map(tree);
};