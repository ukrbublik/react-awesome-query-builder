"use strict";

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

exports.__esModule = true;

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var Date = (function (_Component) {
  function Date() {
    _classCallCheck(this, Date);

    _Component.apply(this, arguments);
  }

  _inherits(Date, _Component);

  Date.prototype.handleChange = function handleChange() {
    var node = _react2["default"].findDOMNode(this.refs.date);
    this.props.setValue(node.value);
  };

  Date.prototype.render = function render() {
    return _react2["default"].createElement("input", { type: "month", ref: "date", value: this.props.value, onChange: this.handleChange.bind(this) });
  };

  _createClass(Date, null, [{
    key: "propTypes",
    value: {
      setValue: _react.PropTypes.func.isRequired
    },
    enumerable: true
  }]);

  return Date;
})(_react.Component);

exports["default"] = Date;
module.exports = exports["default"];