'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactPureRenderFunction = require('react-pure-render/function');

var _reactPureRenderFunction2 = _interopRequireDefault(_reactPureRenderFunction);

var _lodashCollectionSize = require('lodash/collection/size');

var _lodashCollectionSize2 = _interopRequireDefault(_lodashCollectionSize);

var _lodashObjectMapValues = require('lodash/object/mapValues');

var _lodashObjectMapValues2 = _interopRequireDefault(_lodashObjectMapValues);

var _lodashObjectPick = require('lodash/object/pick');

var _lodashObjectPick2 = _interopRequireDefault(_lodashObjectPick);

var _Widget = require('../Widget');

var _Widget2 = _interopRequireDefault(_Widget);

var _Operator = require('../Operator');

var _Operator2 = _interopRequireDefault(_Operator);

exports['default'] = function (Rule) {
  return (function (_Component) {
    function RuleContainer() {
      _classCallCheck(this, RuleContainer);

      _Component.apply(this, arguments);

      this.shouldComponentUpdate = _reactPureRenderFunction2['default'];
    }

    _inherits(RuleContainer, _Component);

    RuleContainer.prototype.removeSelf = function removeSelf() {
      this.props.actions.removeRule(this.props.path);
    };

    RuleContainer.prototype.setField = function setField(field) {
      this.props.actions.setField(this.props.path, field);
    };

    RuleContainer.prototype.setOperator = function setOperator(operator) {
      this.props.actions.setOperator(this.props.path, operator);
    };

    RuleContainer.prototype.render = function render() {
      var _this = this;

      var _props$config = this.props.config;
      var fields = _props$config.fields;
      var operators = _props$config.operators;

      var fieldOptions = _lodashObjectMapValues2['default'](fields, function (item) {
        return item.label;
      });

      // Add a special 'empty' option if no field has been selected yet.
      if (_lodashCollectionSize2['default'](fieldOptions) && typeof this.props.field === 'undefined') {
        fieldOptions = _Object$assign({}, { ':empty:': 'Select a field' }, fieldOptions);
      }

      var operatorOptions = _lodashObjectMapValues2['default'](_lodashObjectPick2['default'](operators, function (item, index) {
        return _this.props.field && fields[_this.props.field] && fields[_this.props.field].operators.indexOf(index) !== -1;
      }), function (item) {
        return item.label;
      });

      // Add a special 'empty' option if no operator has been selected yet.
      if (_lodashCollectionSize2['default'](operatorOptions) && typeof this.props.operator === 'undefined') {
        operatorOptions = _Object$assign({}, { ':empty:': 'Select an operator' }, operatorOptions);
      }

      return _react2['default'].createElement(
        Rule,
        {
          id: this.props.id,
          removeSelf: this.removeSelf.bind(this),
          setField: this.setField.bind(this),
          setOperator: this.setOperator.bind(this),
          selectedField: this.props.field || ':empty:',
          selectedOperator: this.props.operator || ':empty:',
          fieldOptions: fieldOptions,
          operatorOptions: operatorOptions },
        typeof this.props.field !== 'undefined' && typeof this.props.operator !== 'undefined' ? [_react2['default'].createElement(_Operator2['default'], {
          key: 'options',
          path: this.props.path,
          field: this.props.field,
          options: this.props.operatorOptions,
          operator: this.props.operator,
          actions: this.props.actions,
          config: this.props.config }), _react2['default'].createElement(_Widget2['default'], {
          key: 'values',
          path: this.props.path,
          field: this.props.field,
          value: this.props.value,
          options: this.props.valueOptions,
          operator: this.props.operator,
          actions: this.props.actions,
          config: this.props.config })] : null
      );
    };

    _createClass(RuleContainer, null, [{
      key: 'propTypes',
      value: {
        config: _react.PropTypes.object.isRequired,
        operator: _react.PropTypes.string,
        field: _react.PropTypes.string
      },
      enumerable: true
    }]);

    return RuleContainer;
  })(_react.Component);
};

module.exports = exports['default'];