'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _class2, _temp2;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _function = require('react-pure-render/function');

var _function2 = _interopRequireDefault(_function);

var _map = require('lodash/collection/map');

var _map2 = _interopRequireDefault(_map);

var _size = require('lodash/collection/size');

var _size2 = _interopRequireDefault(_size);

var _RuleContainer = require('./containers/RuleContainer');

var _RuleContainer2 = _interopRequireDefault(_RuleContainer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Rule = (0, _RuleContainer2.default)(_class = (_temp2 = _class2 = function (_Component) {
  _inherits(Rule, _Component);

  function Rule() {
    var _Object$getPrototypeO;

    var _temp, _this, _ret;

    _classCallCheck(this, Rule);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Rule)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.shouldComponentUpdate = _function2.default, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Rule, [{
    key: 'handleFieldSelect',
    value: function handleFieldSelect() {
      /*    const node = React.findDOMNode(this.refs.field);
          this.props.setField(node.value);*/
    }
  }, {
    key: 'handleOperatorSelect',
    value: function handleOperatorSelect() {
      /*    const node = React.findDOMNode(this.refs.operator);
          this.props.setOperator(node.value);*/
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'rule' },
        _react2.default.createElement(
          'div',
          { className: 'rule--header' },
          _react2.default.createElement(
            'div',
            { className: 'rule--actions' },
            _react2.default.createElement(
              'button',
              { className: 'action action--DELETE', onClick: this.props.removeSelf },
              'Delete'
            )
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'rule--body' },
          (0, _size2.default)(this.props.fieldOptions) ? _react2.default.createElement(
            'div',
            { key: 'field', className: 'rule--field' },
            _react2.default.createElement(
              'label',
              null,
              'Field'
            ),
            _react2.default.createElement(
              'select',
              { value: this.props.selectedField, onChange: this.handleFieldSelect.bind(this) },
              (0, _map2.default)(this.props.fieldOptions, function (label, value) {
                return _react2.default.createElement(
                  'option',
                  { key: value, value: value },
                  label
                );
              })
            )
          ) : null,
          (0, _size2.default)(this.props.operatorOptions) ? _react2.default.createElement(
            'div',
            { key: 'operator', className: 'rule--operator' },
            _react2.default.createElement(
              'label',
              null,
              'Operator'
            ),
            _react2.default.createElement(
              'select',
              { ref: 'operator', value: this.props.selectedOperator, onChange: this.handleOperatorSelect.bind(this) },
              (0, _map2.default)(this.props.operatorOptions, function (label, value) {
                return _react2.default.createElement(
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
    }
  }]);

  return Rule;
}(_react.Component), _class2.propTypes = {
  fieldOptions: _react.PropTypes.object.isRequired,
  operatorOptions: _react.PropTypes.object.isRequired,
  setField: _react.PropTypes.func.isRequired,
  setOperator: _react.PropTypes.func.isRequired,
  removeSelf: _react.PropTypes.func.isRequired,
  selectedField: _react.PropTypes.string,
  selectedOperator: _react.PropTypes.string
}, _temp2)) || _class;

exports.default = Rule;