"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = _interopRequire(require("react"));

var Immutable = _interopRequire(require("immutable"));

var RuleActions = _interopRequire(require("../actions/Rule"));

var Filter = _interopRequire(require("./Filter"));

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
        var config = this.props.config;
        var field = this.props.field && config.fields[this.props.field] || config.fields[Object.keys(config.fields)[0]];
        var widget = config.widgets[field.widget];
        var operator = config.operators[this.props.operator || field.operators[0]];
        var operators = filter(config.operators, function (value, key) {
          return field.operators.indexOf(key) >= 0;
        });

        var fieldOptions = map(this.props.config.fields, function (item, index) {
          return React.createElement(
            "option",
            { key: index, value: index },
            item.label
          );
        });

        var operatorOptions = map(operators, function (item, index) {
          return React.createElement(
            "option",
            { key: index, value: index },
            item.label
          );
        });

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
                { href: "#", onClick: this.removeRule.bind(this) },
                "Remove rule"
              )
            )
          ),
          React.createElement(
            "div",
            { className: "rule--body" },
            React.createElement(
              "div",
              { className: "rule--fields" },
              React.createElement(
                "select",
                { ref: "field", value: this.props.field, onChange: this.handleFieldSelect.bind(this) },
                fieldOptions
              )
            ),
            React.createElement(
              "div",
              { className: "rule--operator" },
              React.createElement(
                "select",
                { ref: "operator", value: this.props.operator, onChange: this.handleOperatorSelect.bind(this) },
                operatorOptions
              )
            ),
            React.createElement(
              "div",
              { className: "rule--filter" },
              React.createElement(Filter, { path: this.props.path, value: this.props.value, options: this.props.options, field: field, operator: operator, widget: widget })
            )
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