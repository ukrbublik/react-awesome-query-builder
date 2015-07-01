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

var _lodashCollectionMap = require('lodash/collection/map');

var _lodashCollectionMap2 = _interopRequireDefault(_lodashCollectionMap);

var _lodashObjectMapValues = require('lodash/object/mapValues');

var _lodashObjectMapValues2 = _interopRequireDefault(_lodashObjectMapValues);

var ComplexQuery = (function (_Component) {
  function ComplexQuery() {
    _classCallCheck(this, ComplexQuery);

    _Component.apply(this, arguments);

    this.shouldComponentUpdate = _reactPureRenderFunction2['default'];
  }

  _inherits(ComplexQuery, _Component);

  ComplexQuery.prototype.handleOperatorSelect = function handleOperatorSelect() {
    var node = _react2['default'].findDOMNode(this.refs.operator);
    this.props.setOption('operator', node.value);
  };

  ComplexQuery.prototype.render = function render() {
    var valueOptionDefinitions = this.props.config.operators[this.props.operator];
    var selectedOperator = this.props.options.get('operator');
    var operatorOptions = _lodashCollectionMap2['default'](_lodashObjectMapValues2['default'](valueOptionDefinitions.valueOptions.operators, function (item) {
      return item.label;
    }), function (label, value) {
      return _react2['default'].createElement(
        'option',
        { key: value, value: value },
        label
      );
    });

    if (operatorOptions.length && typeof selectedOperator === 'undefined') {
      operatorOptions.unshift(_react2['default'].createElement(
        'option',
        { key: ':empty:', value: ':empty:' },
        'Select an operator'
      ));
    }

    return _react2['default'].createElement(
      'div',
      { className: 'value-options--COMPLEX-QUERY' },
      operatorOptions.length ? _react2['default'].createElement(
        'div',
        { key: 'operator', className: 'rule--operator' },
        _react2['default'].createElement(
          'label',
          null,
          'Operator'
        ),
        _react2['default'].createElement(
          'select',
          { ref: 'operator', value: selectedOperator || ':empty:', onChange: this.handleOperatorSelect.bind(this) },
          operatorOptions
        )
      ) : null
    );
  };

  _createClass(ComplexQuery, null, [{
    key: 'propTypes',
    value: {
      setOption: _react.PropTypes.func.isRequired
    },
    enumerable: true
  }]);

  return ComplexQuery;
})(_react.Component);

exports['default'] = ComplexQuery;
module.exports = exports['default'];