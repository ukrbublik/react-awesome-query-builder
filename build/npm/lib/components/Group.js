"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = _interopRequire(require("react"));

var Immutable = _interopRequire(require("immutable"));

var GroupActions = _interopRequire(require("../actions/Group"));

var RuleActions = _interopRequire(require("../actions/Rule"));

var map = _interopRequire(require("lodash/collection/map"));

var Group = (function (_React$Component) {
  function Group() {
    _classCallCheck(this, Group);

    if (_React$Component != null) {
      _React$Component.apply(this, arguments);
    }
  }

  _inherits(Group, _React$Component);

  _createClass(Group, {
    setConjunction: {
      value: function setConjunction(event) {
        GroupActions.setConjunction(this.props.path, event.target.value, this.props.config);
      }
    },
    addGroup: {
      value: function addGroup() {
        GroupActions.addGroup(this.props.path, {
          conjunction: this.props.config.defaults.conjunction
        }, this.props.config);
      }
    },
    removeGroup: {
      value: function removeGroup() {
        GroupActions.removeGroup(this.props.path, this.props.config);
      }
    },
    addRule: {
      value: function addRule() {
        RuleActions.addRule(this.props.path, {
          value: new Immutable.List(),
          options: new Immutable.Map()
        }, this.props.config);
      }
    },
    render: {
      value: function render() {
        var name = "conjunction[" + this.props.id + "]";
        var conjunctions = map(this.props.config.conjunctions, function (item, index) {
          var checked = index == this.props.conjunction;
          var state = checked ? "active" : "inactive";
          var id = "conjunction-" + this.props.id + "-" + index;

          return React.createElement(
            "div",
            { key: index, className: "conjunction conjunction--" + index.toUpperCase(), "data-state": state },
            React.createElement(
              "label",
              { htmlFor: id },
              item.label
            ),
            React.createElement("input", { id: id, type: "radio", name: name, value: index, checked: checked, onChange: this.setConjunction.bind(this) })
          );
        }, this);

        return React.createElement(
          "div",
          { className: "group" },
          React.createElement(
            "div",
            { className: "group--header" },
            React.createElement(
              "div",
              { className: "group--conjunctions" },
              conjunctions
            ),
            React.createElement(
              "div",
              { className: "group--actions" },
              React.createElement(
                "a",
                { href: "#", className: "action action--ADD-GROUP", onClick: this.addGroup.bind(this) },
                "Add group"
              ),
              React.createElement(
                "a",
                { href: "#", className: "action action--ADD-RULE", onClick: this.addRule.bind(this) },
                "Add rule"
              ),
              React.createElement(
                "a",
                { href: "#", className: "action action--DELETE", onClick: this.removeGroup.bind(this) },
                "Delete"
              )
            )
          ),
          React.createElement(
            "div",
            { className: "group--children" },
            this.props.children
          )
        );
      }
    }
  });

  return Group;
})(React.Component);

Group.propTypes = {
  config: React.PropTypes.object.isRequired,
  id: React.PropTypes.string.isRequired,
  path: React.PropTypes.instanceOf(Immutable.List).isRequired
};

module.exports = Group;