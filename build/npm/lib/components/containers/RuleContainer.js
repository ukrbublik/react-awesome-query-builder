'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAddonsShallowCompare = require('react-addons-shallow-compare');

var _reactAddonsShallowCompare2 = _interopRequireDefault(_reactAddonsShallowCompare);

var _size = require('lodash/size');

var _size2 = _interopRequireDefault(_size);

var _mapValues = require('lodash/mapValues');

var _mapValues2 = _interopRequireDefault(_mapValues);

var _pickBy = require('lodash/pickBy');

var _pickBy2 = _interopRequireDefault(_pickBy);

var _Widget = require('../Widget');

var _Widget2 = _interopRequireDefault(_Widget);

var _Operator = require('../Operator');

var _Operator2 = _interopRequireDefault(_Operator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.default = function (Rule) {
  var _class, _temp2;

  return _temp2 = _class = function (_Component) {
    _inherits(RuleContainer, _Component);

    function RuleContainer() {
      var _Object$getPrototypeO;

      var _temp, _this, _ret;

      _classCallCheck(this, RuleContainer);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(RuleContainer)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.shouldComponentUpdate = _reactAddonsShallowCompare2.default, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(RuleContainer, [{
      key: 'removeSelf',
      value: function removeSelf() {
        this.props.actions.removeRule(this.props.path);
      }
    }, {
      key: 'setField',
      value: function setField(field) {
        this.props.actions.setField(this.props.path, field);
      }
    }, {
      key: 'setOperator',
      value: function setOperator(operator) {
        this.props.actions.setOperator(this.props.path, operator);
      }
    }, {
      key: 'render',
      value: function render() {
        var _this2 = this;

        var _props$config = this.props.config;
        var fields = _props$config.fields;
        var operators = _props$config.operators;

        //      let fieldOptions = mapValues(fields, (item) => item.label);

        var fieldOptions = fields;

        // Add a special 'empty' option if no field has been selected yet.
        if ((0, _size2.default)(fieldOptions) && typeof this.props.field === 'undefined') {
          fieldOptions = Object.assign({}, { ':empty:': 'Select a field' }, fieldOptions);
        }

        var operatorOptions = (0, _mapValues2.default)((0, _pickBy2.default)(operators, function (item, index) {
          return _this2.props.field && fields[_this2.props.field] && fields[_this2.props.field].operators.indexOf(index) !== -1;
        }), function (item) {
          return item.label;
        });

        // Add a special 'empty' option if no operator has been selected yet.
        if ((0, _size2.default)(operatorOptions) && typeof this.props.operator === 'undefined') {
          operatorOptions = Object.assign({}, { ':empty:': 'Select an operator' }, operatorOptions);
        }

        return _react2.default.createElement(
          Rule,
          {
            id: this.props.id,
            removeSelf: this.removeSelf.bind(this),
            setField: this.setField.bind(this),
            setOperator: this.setOperator.bind(this),
            selectedField: this.props.field || ':empty:',
            selectedOperator: this.props.operator || ':empty:',
            fieldSeparator: this.props.config.settings.fieldSeparator || '*$.',
            fieldSeparatorDisplay: this.props.config.settings.fieldSeparatorDisplay || '=>',
            fieldOptions: fieldOptions,
            operatorOptions: operatorOptions },
          typeof this.props.field !== 'undefined' && typeof this.props.operator !== 'undefined' ? [_react2.default.createElement(_Operator2.default, {
            key: 'options',
            path: this.props.path,
            field: this.props.field,
            options: this.props.operatorOptions,
            operator: this.props.operator,
            actions: this.props.actions,
            config: this.props.config }), _react2.default.createElement(_Widget2.default, {
            key: 'values',
            path: this.props.path,
            field: this.props.field,
            value: this.props.value,
            options: this.props.valueOptions,
            operator: this.props.operator,
            actions: this.props.actions,
            config: this.props.config })] : null
        );
      }
    }]);

    return RuleContainer;
  }(_react.Component), _class.propTypes = {
    config: _react.PropTypes.object.isRequired,
    operator: _react.PropTypes.string,
    field: _react.PropTypes.string
  }, _temp2;
};