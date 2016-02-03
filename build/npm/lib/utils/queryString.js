'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
var queryStringRecursive = function queryStringRecursive(item, config) {
  var type = item.get('type');
  var properties = item.get('properties');
  var children = item.get('children1');

  if (type === 'rule') {
    var _ret = function () {
      if (typeof properties.get('field') === 'undefined' || typeof properties.get('operator') === 'undefined') {
        return {
          v: undefined
        };
      }

      var field = properties.get('field');
      var operator = properties.get('operator');

      var fieldDefinition = config.fields[field];
      var operatorDefinition = config.operators[operator];

      var options = properties.get('operatorOptions');
      var valueOptions = properties.get('valueOptions');
      var cardinality = operatorDefinition.cardinality || 1;
      var widget = config.widgets[fieldDefinition.widget];
      var value = properties.get('value').map(function (currentValue) {
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

      return {
        v: operatorDefinition.value(value, fieldDefinition.label, options, valueOptions, operator, config)
      };
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  }

  if (type === 'group' && children && children.size) {
    var value = children.map(function (currentChild) {
      return queryStringRecursive(currentChild, config);
    }).filter(function (currentChild) {
      return typeof currentChild !== 'undefined';
    });

    if (!value.size) {
      return undefined;
    }

    var conjunction = properties.get('conjunction');
    var conjunctionDefinition = config.conjunctions[conjunction];
    return conjunctionDefinition.value(value, conjunction);
  }

  return undefined;
};

exports.default = queryStringRecursive;