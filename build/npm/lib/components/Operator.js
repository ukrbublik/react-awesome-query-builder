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

var _containersOperatorContainer = require('./containers/OperatorContainer');

var _containersOperatorContainer2 = _interopRequireDefault(_containersOperatorContainer);

var Operator = (function (_Component) {
  function Operator() {
    _classCallCheck(this, _Operator);

    _Component.apply(this, arguments);

    this.shouldComponentUpdate = _reactPureRenderFunction2['default'];
  }

  _inherits(Operator, _Component);

  var _Operator = Operator;

  _Operator.prototype.render = function render() {
    return _react2['default'].createElement(
      'div',
      { className: 'rule--operator rule--operator--' + this.props.name.toUpperCase() },
      this.props.children
    );
  };

  _createClass(_Operator, null, [{
    key: 'propTypes',
    value: {
      name: _react.PropTypes.string.isRequired,
      children: _react.PropTypes.oneOfType([_react.PropTypes.array, _react.PropTypes.element])
    },
    enumerable: true
  }]);

  Operator = _containersOperatorContainer2['default'](Operator) || Operator;
  return Operator;
})(_react.Component);

exports['default'] = Operator;
module.exports = exports['default'];