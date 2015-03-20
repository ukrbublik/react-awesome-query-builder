"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = _interopRequire(require("react"));

var Immutable = _interopRequire(require("immutable"));

var RuleActions = _interopRequire(require("../actions/Rule"));

var Values = (function (_React$Component) {
  function Values() {
    _classCallCheck(this, Values);

    if (_React$Component != null) {
      _React$Component.apply(this, arguments);
    }
  }

  _inherits(Values, _React$Component);

  _createClass(Values, {
    render: {
      value: function render() {
        var _this = this;

        if (this.props.cardinality === 0) {
          return null;
        }

        var name = this.props.widget.name.toUpperCase();
        if (typeof this.props.widget.behavior === "undefined") {
          var widgets = [];

          for (var delta = 0; delta < this.props.cardinality; delta++) {
            (function (delta) {
              var widget = React.createElement(_this.props.widget.component, {
                key: delta,
                definition: _this.props.widget,
                field: _this.props.field,
                delta: delta,
                value: _this.props.value[delta],
                setValue: function (value) {
                  return RuleActions.setDeltaValue(_this.props.path, delta, value, _this.props.config);
                }
              });

              widgets.push(React.createElement(
                "div",
                { key: delta, className: "widget widget--" + name },
                widget
              ));
            })(delta);
          }

          return React.createElement(
            "div",
            { className: "filter--values" },
            widgets
          );
        }

        var widget = React.createElement(this.props.widget.component, {
          definition: this.props.widget,
          field: this.props.field,
          cardinality: this.props.cardinality,
          value: this.props.value,
          setDeltaValue: function (delta, value) {
            return RuleActions.setDeltaValue(_this.props.path, delta, value, _this.props.config);
          }
        });

        return React.createElement(
          "div",
          { className: "filter--values" },
          React.createElement(
            "div",
            { className: "widget widget--" + name },
            widget
          )
        );
      }
    }
  });

  return Values;
})(React.Component);

Values.propTypes = {
  path: React.PropTypes.instanceOf(Immutable.List).isRequired,
  value: React.PropTypes.instanceOf(Immutable.List).isRequired,
  config: React.PropTypes.object.isRequired,
  field: React.PropTypes.object.isRequired,
  cardinality: React.PropTypes.number.isRequired,
  widget: React.PropTypes.object.isRequired
};

module.exports = Values;