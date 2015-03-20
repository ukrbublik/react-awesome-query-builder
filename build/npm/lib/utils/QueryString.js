"use strict";

var getQueryStringRecursive = (function (_getQueryStringRecursive) {
  var _getQueryStringRecursiveWrapper = function getQueryStringRecursive(_x, _x2) {
    return _getQueryStringRecursive.apply(this, arguments);
  };

  _getQueryStringRecursiveWrapper.toString = function () {
    return _getQueryStringRecursive.toString();
  };

  return _getQueryStringRecursiveWrapper;
})(function (item, config) {
  var type = item.get("type");
  var properties = item.get("properties");
  var children = item.get("children");

  if (type == "rule") {
    var _ret = (function () {
      if (!properties.has("field") || !properties.has("operator")) {
        return {
          v: undefined
        };
      }

      var value = properties.get("value");
      var field = config.fields[properties.get("field")];
      var operator = config.operators[properties.get("operator")];
      var options = properties.get("options");

      if ((operator.cardinality || 1) !== 0) {
        (function () {
          var widget = config.widgets[field.widget];

          value = value.map(function (value, key) {
            return widget.value(value, config);
          });
        })();
      }

      return {
        v: operator.value(value, field, options, operator, config)
      };
    })();

    if (typeof _ret === "object") return _ret.v;
  }

  if (type == "group" && children && children.size) {
    var values = children.map(function (item, key) {
      return getQueryStringRecursive(item, config);
    });
    values = values.filter(function (value) {
      return typeof value !== "undefined";
    });

    var conjunction = properties.get("conjunction");
    conjunction = config.conjunctions[conjunction];
    return conjunction.value(values, conjunction);
  }

  return undefined;
});

module.exports = function (item, config) {
  return getQueryStringRecursive(item, config);
};