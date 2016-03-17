'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp2;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAddonsShallowCompare = require('react-addons-shallow-compare');

var _reactAddonsShallowCompare2 = _interopRequireDefault(_reactAddonsShallowCompare);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Delta = (_temp2 = _class = function (_Component) {
  _inherits(Delta, _Component);

  function Delta() {
    var _Object$getPrototypeO;

    var _temp, _this, _ret;

    _classCallCheck(this, Delta);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Delta)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.shouldComponentUpdate = _reactAddonsShallowCompare2.default, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Delta, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'widget--delta widget--delta-' + this.props.delta },
        [_react2.default.createElement(
          'div',
          { key: 'widget', className: 'widget--widget' },
          this.props.children[0]
        ), this.props.children[1] ? _react2.default.createElement(
          'div',
          { key: 'options', className: 'widget--options' },
          this.props.children[1]
        ) : null]
      );
    }
  }]);

  return Delta;
}(_react.Component), _class.propTypes = {
  children: _react.PropTypes.arrayOf(_react.PropTypes.element).isRequired,
  delta: _react.PropTypes.number.isRequired
}, _temp2);
exports.default = Delta;