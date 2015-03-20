"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = _interopRequire(require("react"));

var Immutable = _interopRequire(require("immutable"));

var RuleActions = _interopRequire(require("../actions/Rule"));

var Values = _interopRequire(require("./Values"));

var Options = _interopRequire(require("./Options"));

var assign = _interopRequire(require("react/lib/Object.assign"));

var map = _interopRequire(require("lodash/collection/map"));

var filter = _interopRequire(require("lodash/collection/filter"));

var Rule = (function (_React$Component) {
  function Rule() {
    _classCallCheck(this, Rule);

    if (_React$Component != null) {
      _React$Component.apply(this, arguments);
    }
  }

  _inherits(Rule, _React$Component);

  _createClass(Rule, {
    removeRule: {
      value: function removeRule() {
        RuleActions.removeRule(this.props.path);
      }
    },
    handleFieldSelect: {
      value: function handleFieldSelect() {
        var node = React.findDOMNode(this.refs.field);
        RuleActions.setField(this.props.path, node.value);
      }
    },
    handleOperatorSelect: {
      value: function handleOperatorSelect() {
        var node = React.findDOMNode(this.refs.operator);
        RuleActions.setOperator(this.props.path, node.value);
      }
    },
    render: {
      value: function render() {
        var body = [];

        var fields = this.props.config.fields;
        var field = this.props.field && fields[this.props.field] || undefined;

        var operators = {};
        for (var id in this.props.config.operators) {
          if (this.props.config.operators.hasOwnProperty(id)) {
            if (field && field.operators.indexOf(id) !== -1) {
              operators[id] = this.props.config.operators[id];
            }
          }
        }

        var operator = field && this.props.operator && operators[this.props.operator] || undefined;

        if (Object.keys(fields).length) {
          var options = map(fields, function (item, index) {
            return React.createElement(
              "option",
              { key: index, value: index },
              item.label
            );
          });

          if (typeof field === "undefined") {
            options.unshift(React.createElement("option", { key: ":empty:", value: ":empty:" }));
          }

          body.push(React.createElement(
            "div",
            { key: "field", className: "rule--field" },
            React.createElement(
              "label",
              null,
              "Field"
            ),
            React.createElement(
              "select",
              { ref: "field", value: this.props.field || ":empty:", onChange: this.handleFieldSelect.bind(this) },
              options
            )
          ));
        }

        if (Object.keys(operators).length) {
          var options = map(operators, function (item, index) {
            return React.createElement(
              "option",
              { key: index, value: index },
              item.label
            );
          });

          if (typeof operator === "undefined") {
            options.unshift(React.createElement("option", { key: ":empty:", value: ":empty:" }));
          }

          body.push(React.createElement(
            "div",
            { key: "operator", className: "rule--operator" },
            React.createElement(
              "label",
              null,
              "Operator"
            ),
            React.createElement(
              "select",
              { ref: "operator", value: this.props.operator || ":empty:", onChange: this.handleOperatorSelect.bind(this) },
              options
            )
          ));
        }

        if (field && operator) {
          var widget = typeof field.widget === "string" ? this.props.config.widgets[field.widget] : field.widget;
          var cardinality = operator.cardinality || 1;

          var props = {
            config: this.props.config,
            path: this.props.path,
            id: this.props.id,
            field: field
          };

          body.push(React.createElement(Options, _extends({ key: "options" }, props, { options: this.props.options, operator: operator })));
          body.push(React.createElement(Values, _extends({ key: "values" }, props, { value: this.props.value, cardinality: cardinality, widget: widget })));
        }

        return React.createElement(
          "div",
          { className: "rule" },
          React.createElement(
            "div",
            { className: "rule--header" },
            React.createElement(
              "div",
              { className: "rule--actions" },
              React.createElement(
                "a",
                { href: "#", className: "action action--DELETE", onClick: this.removeRule.bind(this) },
                "Delete"
              )
            )
          ),
          React.createElement(
            "div",
            { className: "rule--body" },
            body
          )
        );
      }
    }
  });

  return Rule;
})(React.Component);

Rule.propTypes = {
  config: React.PropTypes.object.isRequired,
  id: React.PropTypes.string.isRequired,
  path: React.PropTypes.instanceOf(Immutable.List).isRequired
};

module.exports = Rule;