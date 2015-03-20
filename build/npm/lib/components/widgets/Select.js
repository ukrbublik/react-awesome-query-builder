"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = _interopRequire(require("react"));

var map = _interopRequire(require("lodash/collection/map"));

var Text = (function (_React$Component) {
  function Text() {
    _classCallCheck(this, Text);

    if (_React$Component != null) {
      _React$Component.apply(this, arguments);
    }
  }

  _inherits(Text, _React$Component);

  _createClass(Text, {
    handleChange: {
      value: function handleChange() {
        var node = React.findDOMNode(this.refs.select);
        this.props.setValue(node.value);
      }
    },
    render: {
      value: function render() {
        var options = map(this.props.field.options, function (label, value) {
          return React.createElement(
            "option",
            { key: value, value: value },
            label
          );
        });

        return React.createElement(
          "select",
          { ref: "select", value: this.props.value, onChange: this.handleChange.bind(this) },
          options
        );
      }
    }
  });

  return Text;
})(React.Component);

module.exports = Text;