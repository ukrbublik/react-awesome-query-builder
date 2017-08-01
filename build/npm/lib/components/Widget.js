'use strict';

exports.__esModule = true;
exports.default = undefined;

var _css = require('antd/lib/col/style/css');

var _col = require('antd/lib/col');

var _col2 = _interopRequireDefault(_col);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _class2, _temp2;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAddonsShallowCompare = require('react-addons-shallow-compare');

var _reactAddonsShallowCompare2 = _interopRequireDefault(_reactAddonsShallowCompare);

var _WidgetContainer = require('./containers/WidgetContainer');

var _WidgetContainer2 = _interopRequireDefault(_WidgetContainer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Widget = (0, _WidgetContainer2.default)(_class = (_temp2 = _class2 = function (_Component) {
  _inherits(Widget, _Component);

  function Widget() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Widget);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Widget.__proto__ || Object.getPrototypeOf(Widget)).call.apply(_ref, [this].concat(args))), _this), _this.shouldComponentUpdate = _reactAddonsShallowCompare2.default, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Widget, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _col2.default,
        {
          className: 'rule--widget rule--widget--' + this.props.name.toUpperCase(),
          key: "widget-col-" + this.props.name
        },
        this.props.children
      );
    }
  }]);

  return Widget;
}(_react.Component), _class2.propTypes = {
  config: _react.PropTypes.object.isRequired,
  name: _react.PropTypes.string.isRequired,
  children: _react.PropTypes.oneOfType([_react.PropTypes.array, _react.PropTypes.element])
}, _temp2)) || _class;

exports.default = Widget;