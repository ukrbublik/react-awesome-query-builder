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

var _lodashUtilityRange = require('lodash/utility/range');

var _lodashUtilityRange2 = _interopRequireDefault(_lodashUtilityRange);

var Proximity = (function (_Component) {
  function Proximity() {
    _classCallCheck(this, Proximity);

    _Component.apply(this, arguments);

    this.shouldComponentUpdate = _reactPureRenderFunction2['default'];
  }

  _inherits(Proximity, _Component);

  Proximity.prototype.handleChange = function handleChange() {
    var node = _react2['default'].findDOMNode(this.refs.proximity);
    this.props.setOption('proximity', node.value);
  };

  Proximity.prototype.render = function render() {
    var options = _lodashUtilityRange2['default'](2, 10).map(function (item) {
      return _react2['default'].createElement(
        'option',
        { key: item, value: item },
        item
      );
    });
    var handler = this.handleChange.bind(this);
    var proximity = this.props.options.get('proximity') || this.props.defaults.proximity;

    return _react2['default'].createElement(
      'div',
      { className: 'operator--PROXIMITY' },
      _react2['default'].createElement(
        'div',
        { className: 'operator--proximity' },
        _react2['default'].createElement(
          'select',
          { ref: 'proximity', value: proximity, onChange: handler },
          options
        )
      ),
      _react2['default'].createElement(
        'div',
        { className: 'operator--widgets' },
        this.props.children
      )
    );
  };

  _createClass(Proximity, null, [{
    key: 'propTypes',
    value: {
      setOption: _react.PropTypes.func.isRequired
    },
    enumerable: true
  }]);

  return Proximity;
})(_react.Component);

exports['default'] = Proximity;
module.exports = exports['default'];