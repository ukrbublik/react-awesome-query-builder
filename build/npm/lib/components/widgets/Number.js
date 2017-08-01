'use strict';

exports.__esModule = true;
exports.default = undefined;

var _css = require('antd/lib/col/style/css');

var _col = require('antd/lib/col');

var _col2 = _interopRequireDefault(_col);

var _css2 = require('antd/lib/input-number/style/css');

var _inputNumber = require('antd/lib/input-number');

var _inputNumber2 = _interopRequireDefault(_inputNumber);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

require('antd/lib/date-picker/style');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NumberWidget = (_temp = _class = function (_Component) {
  _inherits(NumberWidget, _Component);

  function NumberWidget() {
    _classCallCheck(this, NumberWidget);

    return _possibleConstructorReturn(this, (NumberWidget.__proto__ || Object.getPrototypeOf(NumberWidget)).apply(this, arguments));
  }

  _createClass(NumberWidget, [{
    key: 'handleChange',
    value: function handleChange(val) {
      this.props.setValue(val);
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _col2.default,
        null,
        _react2.default.createElement(_inputNumber2.default, {
          key: 'widget-number',
          size: this.props.config.settings.renderSize || "small",
          ref: 'num',
          value: this.props.value || null,
          min: this.props.min,
          max: this.props.max,
          step: this.props.step,
          onChange: this.handleChange.bind(this)
        })
      );
    }
  }]);

  return NumberWidget;
}(_react.Component), _class.propTypes = {
  setValue: _react.PropTypes.func.isRequired,
  delta: _react.PropTypes.number.isRequired,
  min: _react.PropTypes.number,
  max: _react.PropTypes.number,
  step: _react.PropTypes.number
}, _class.defaultProps = {
  min: undefined,
  max: undefined,
  step: undefined
}, _temp);
exports.default = NumberWidget;