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

var Delta = (function (_Component) {
  function Delta() {
    _classCallCheck(this, Delta);

    _Component.apply(this, arguments);

    this.shouldComponentUpdate = _reactPureRenderFunction2['default'];
  }

  _inherits(Delta, _Component);

  Delta.prototype.render = function render() {
    return _react2['default'].createElement(
      'div',
      { className: 'widget--delta widget--delta-' + this.props.delta },
      [_react2['default'].createElement(
        'div',
        { key: 'widget', className: 'widget--widget' },
        this.props.children[0]
      ), this.props.children[1] ? _react2['default'].createElement(
        'div',
        { key: 'options', className: 'widget--options' },
        this.props.children[1]
      ) : null]
    );
  };

  _createClass(Delta, null, [{
    key: 'propTypes',
    value: {
      children: _react.PropTypes.arrayOf(_react.PropTypes.element).isRequired,
      delta: _react.PropTypes.number.isRequired
    },
    enumerable: true
  }]);

  return Delta;
})(_react.Component);

exports['default'] = Delta;
module.exports = exports['default'];