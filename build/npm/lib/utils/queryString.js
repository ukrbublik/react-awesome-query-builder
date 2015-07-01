'use strict';

exports.__esModule = true;
var queryStringRecursive = function queryStringRecursive(item, config) {
  var type = item.get('type');
  var properties = item.get('properties');
  var children = item.get('children');

  if (type === 'rule') {
    var _ret = (function () {
      if (!properties.has('field') || !properties.has('operator')) {
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
        return widget.value(currentValue, config);
      });

      if (value.size < cardinality) {
        return {
          v: undefined
        };
      }

      return {
        v: operatorDefinition.value(value, field, options, valueOptions, operator, config)
      };
    })();

    if (typeof _ret === 'object') return _ret.v;
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

exports['default'] = queryStringRecursive;
module.exports = exports['default'];