'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactPureRenderFunction = require('react-pure-render/function');

var _reactPureRenderFunction2 = _interopRequireDefault(_reactPureRenderFunction);

var _containersWidgetContainer = require('./containers/WidgetContainer');

var _containersWidgetContainer2 = _interopRequireDefault(_containersWidgetContainer);

var Widget = (function (_Component) {
  function Widget() {
    _classCallCheck(this, _Widget);

    _Component.apply(this, arguments);

    this.shouldComponentUpdate = _reactPureRenderFunction2['default'];
  }

  _inherits(Widget, _Component);

  var _Widget = Widget;

  _Widget.prototype.render = function render() {
    return _react2['default'].createElement(
      'div',
      { className: 'rule--widget rule--widget--' + this.props.name.toUpperCase() },
      this.props.children
    );
  };

  _createClass(_Widget, null, [{
    key: 'propTypes',
    value: {
      name: _react.PropTypes.string.isRequired,
      children: _react.PropTypes.oneOfType([_react.PropTypes.array, _react.PropTypes.element])
    },
    enumerable: true
  }]);

  Widget = _containersWidgetContainer2['default'](Widget) || Widget;
  return Widget;
})(_react.Component);

exports['default'] = Widget;
module.exports = exports['default'];