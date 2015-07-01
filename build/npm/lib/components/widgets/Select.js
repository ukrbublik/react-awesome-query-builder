'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _lodashCollectionMap = require('lodash/collection/map');

var _lodashCollectionMap2 = _interopRequireDefault(_lodashCollectionMap);

var Select = (function (_Component) {
  function Select() {
    _classCallCheck(this, Select);

    _Component.apply(this, arguments);
  }

  _inherits(Select, _Component);

  Select.prototype.handleChange = function handleChange() {
    var node = _react2['default'].findDOMNode(this.refs.select);
    this.props.setValue(node.value);
  };

  Select.prototype.render = function render() {
    var options = _lodashCollectionMap2['default'](this.props.field.options, function (label, value) {
      return _react2['default'].createElement(
        'option',
        { key: value, value: value },
        label
      );
    });

    return _react2['default'].createElement(
      'select',
      { ref: 'select', value: this.props.value, onChange: this.handleChange.bind(this) },
      options
    );
  };

  _createClass(Select, null, [{
    key: 'propTypes',
    value: {
      setValue: _react.PropTypes.func.isRequired
    },
    enumerable: true
  }]);

  return Select;
})(_react.Component);

exports['default'] = Select;
module.exports = exports['default'];