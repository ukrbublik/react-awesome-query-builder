"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = _interopRequire(require("react"));

var Immutable = _interopRequire(require("immutable"));

var RuleActions = _interopRequire(require("../actions/Rule"));

var Options = (function (_React$Component) {
  function Options() {
    _classCallCheck(this, Options);

    if (_React$Component != null) {
      _React$Component.apply(this, arguments);
    }
  }

  _inherits(Options, _React$Component);

  _createClass(Options, {
    render: {
      value: function render() {
        var _this = this;

        if (!this.props.operator.options || !this.props.operator.options.component) {
          return null;
        }

        var options = React.createElement(this.props.operator.options.component, {
          definition: this.props.operator,
          field: this.props.field,
          options: this.props.options,
          setOption: function (name, value) {
            return RuleActions.setOption(_this.props.path, name, value, _this.props.config);
          }
        });

        return React.createElement(
          "div",
          { className: "filter--options" },
          options
        );
      }
    }
  });

  return Options;
})(React.Component);

Options.propTypes = {
  path: React.PropTypes.instanceOf(Immutable.List).isRequired,
  options: React.PropTypes.instanceOf(Immutable.Map).isRequired,
  config: React.PropTypes.object.isRequired,
  field: React.PropTypes.object.isRequired,
  operator: React.PropTypes.object.isRequired
};

module.exports = Options;