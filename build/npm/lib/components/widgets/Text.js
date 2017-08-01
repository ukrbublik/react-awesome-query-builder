'use strict';

exports.__esModule = true;
exports.default = undefined;

var _css = require('antd/lib/col/style/css');

var _col = require('antd/lib/col');

var _col2 = _interopRequireDefault(_col);

var _css2 = require('antd/lib/input/style/css');

var _input = require('antd/lib/input');

var _input2 = _interopRequireDefault(_input);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TextWidget = (_temp = _class = function (_Component) {
  _inherits(TextWidget, _Component);

  function TextWidget() {
    _classCallCheck(this, TextWidget);

    return _possibleConstructorReturn(this, (TextWidget.__proto__ || Object.getPrototypeOf(TextWidget)).apply(this, arguments));
  }

  _createClass(TextWidget, [{
    key: 'handleChange',
    value: function handleChange() {
      this.props.setValue(_reactDom2.default.findDOMNode(this.refs.text).value);
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _col2.default,
        null,
        _react2.default.createElement(_input2.default, {
          key: 'widget-text',
          size: this.props.config.settings.renderSize || "small",
          ref: 'text',
          type: "text",
          value: this.props.value || null,
          placeholder: this.props.placeholder,
          onChange: this.handleChange.bind(this)
        })
      );
    }
  }]);

  return TextWidget;
}(_react.Component), _class.propTypes = {
  setValue: _react.PropTypes.func.isRequired,
  delta: _react.PropTypes.number.isRequired,
  label: _react.PropTypes.string,
  placeholder: _react.PropTypes.string
}, _temp);
exports.default = TextWidget;