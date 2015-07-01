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

var _lodashCollectionSize = require('lodash/collection/size');

var _lodashCollectionSize2 = _interopRequireDefault(_lodashCollectionSize);

var _containersRuleContainer = require('./containers/RuleContainer');

var _containersRuleContainer2 = _interopRequireDefault(_containersRuleContainer);

var Rule = (function (_Component) {
  function Rule() {
    _classCallCheck(this, _Rule);

    _Component.apply(this, arguments);

    this.shouldComponentUpdate = _reactPureRenderFunction2['default'];
  }

  _inherits(Rule, _Component);

  var _Rule = Rule;

  _Rule.prototype.handleFieldSelect = function handleFieldSelect() {
    var node = _react2['default'].findDOMNode(this.refs.field);
    this.props.setField(node.value);
  };

  _Rule.prototype.handleOperatorSelect = function handleOperatorSelect() {
    var node = _react2['default'].findDOMNode(this.refs.operator);
    this.props.setOperator(node.value);
  };

  _Rule.prototype.render = function render() {
    return _react2['default'].createElement(
      'div',
      { className: 'rule' },
      _react2['default'].createElement(
        'div',
        { className: 'rule--header' },
        _react2['default'].createElement(
          'div',
          { className: 'rule--actions' },
          _react2['default'].createElement(
            'button',
            { className: 'action action--DELETE', onClick: this.props.removeSelf },
            'Delete'
          )
        )
      ),
      _react2['default'].createElement(
        'div',
        { className: 'rule--body' },
        _lodashCollectionSize2['default'](this.props.fieldOptions) ? _react2['default'].createElement(
          'div',
          { key: 'field', className: 'rule--field' },
          _react2['default'].createElement(
            'label',
            null,
            'Field'
          ),
          _react2['default'].createElement(
            'select',
            { ref: 'field', value: this.props.selectedField, onChange: this.handleFieldSelect.bind(this) },
            _lodashCollectionMap2['default'](this.props.fieldOptions, function (label, value) {
              return _react2['default'].createElement(
                'option',
                { key: value, value: value },
                label
              );
            })
          )
        ) : null,
        _lodashCollectionSize2['default'](this.props.operatorOptions) ? _react2['default'].createElement(
          'div',
          { key: 'operator', className: 'rule--operator' },
          _react2['default'].createElement(
            'label',
            null,
            'Operator'
          ),
          _react2['default'].createElement(
            'select',
            { ref: 'operator', value: this.props.selectedOperator, onChange: this.handleOperatorSelect.bind(this) },
            _lodashCollectionMap2['default'](this.props.operatorOptions, function (label, value) {
              return _react2['default'].createElement(
                'option',
                { key: value, value: value },
                label
              );
            })
          )
        ) : null,
        this.props.children
      )
    );
  };

  _createClass(_Rule, null, [{
    key: 'propTypes',
    value: {
      fieldOptions: _react.PropTypes.object.isRequired,
      operatorOptions: _react.PropTypes.object.isRequired,
      setField: _react.PropTypes.func.isRequired,
      setOperator: _react.PropTypes.func.isRequired,
      removeSelf: _react.PropTypes.func.isRequired,
      selectedField: _react.PropTypes.string,
      selectedOperator: _react.PropTypes.string
    },
    enumerable: true
  }]);

  Rule = _containersRuleContainer2['default'](Rule) || Rule;
  return Rule;
})(_react.Component);

exports['default'] = Rule;
module.exports = exports['default'];