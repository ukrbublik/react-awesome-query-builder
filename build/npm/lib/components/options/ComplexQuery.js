'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp2;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAddonsShallowCompare = require('react-addons-shallow-compare');

var _reactAddonsShallowCompare2 = _interopRequireDefault(_reactAddonsShallowCompare);

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

var _mapValues = require('lodash/mapValues');

var _mapValues2 = _interopRequireDefault(_mapValues);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ComplexQuery = (_temp2 = _class = function (_Component) {
  _inherits(ComplexQuery, _Component);

  function ComplexQuery() {
    var _Object$getPrototypeO;

    var _temp, _this, _ret;

    _classCallCheck(this, ComplexQuery);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(ComplexQuery)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.shouldComponentUpdate = _reactAddonsShallowCompare2.default, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(ComplexQuery, [{
    key: 'handleOperatorSelect',
    value: function handleOperatorSelect() {
      var node = _react2.default.findDOMNode(this.refs.operator);
      this.props.setOption('operator', node.value);
    }
  }, {
    key: 'render',
    value: function render() {
      var selectedOperator = this.props.options.get('operator');
      var operatorOptions = (0, _map2.default)((0, _mapValues2.default)(this.props.operators, function (item) {
        return item.label;
      }), function (label, value) {
        return _react2.default.createElement(
          'option',
          { key: value, value: value },
          label
        );
      });

      if (operatorOptions.length && typeof selectedOperator === 'undefined') {
        operatorOptions.unshift(_react2.default.createElement(
          'option',
          { key: ':empty:', value: ':empty:' },
          'Select an operator'
        ));
      }

      return _react2.default.createElement(
        'div',
        { className: 'value-options--COMPLEX-QUERY' },
        operatorOptions.length ? _react2.default.createElement(
          'div',
          { key: 'operator', className: 'rule--operator' },
          _react2.default.createElement(
            'label',
            null,
            'Operator'
          ),
          _react2.default.createElement(
            'select',
            { ref: 'operator', value: selectedOperator || ':empty:', onChange: this.handleOperatorSelect.bind(this) },
            operatorOptions
          )
        ) : null
      );
    }
  }]);

  return ComplexQuery;
}(_react.Component), _class.propTypes = {
  setOption: _react.PropTypes.func.isRequired
}, _temp2);
exports.default = ComplexQuery;