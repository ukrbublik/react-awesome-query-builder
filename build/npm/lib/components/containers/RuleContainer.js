'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAddonsShallowCompare = require('react-addons-shallow-compare');

var _reactAddonsShallowCompare2 = _interopRequireDefault(_reactAddonsShallowCompare);

var _size = require('lodash/size');

var _size2 = _interopRequireDefault(_size);

var _index = require('../../utils/index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.default = function (Rule) {
  var _class, _temp2;

  return _temp2 = _class = function (_Component) {
    _inherits(RuleContainer, _Component);

    function RuleContainer() {
      var _ref;

      var _temp, _this, _ret;

      _classCallCheck(this, RuleContainer);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = RuleContainer.__proto__ || Object.getPrototypeOf(RuleContainer)).call.apply(_ref, [this].concat(args))), _this), _this.shouldComponentUpdate = _reactAddonsShallowCompare2.default, _temp), _possibleConstructorReturn(_this, _ret);
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
      key: 'setOperatorOption',
      value: function setOperatorOption(name, value) {
        this.props.actions.setOperatorOption(this.props.path, name, value);
      }
    }, {
      key: 'setValue',
      value: function setValue(delta, value) {
        this.props.actions.setValue(this.props.path, delta, value);
      }
    }, {
      key: 'render',
      value: function render() {
        var fieldConfig = (0, _index.getFieldConfig)(this.props.field, this.props.config);
        var isGroup = fieldConfig && fieldConfig.widget == '!struct';

        return _react2.default.createElement(Rule, {
          id: this.props.id,
          removeSelf: this.removeSelf.bind(this),
          setField: this.setField.bind(this),
          setOperator: this.setOperator.bind(this),
          setOperatorOption: this.setOperatorOption.bind(this),
          setValue: this.setValue.bind(this),
          selectedField: this.props.field || null,
          selectedOperator: this.props.operator || null,
          value: this.props.value || null,
          operatorOptions: this.props.operatorOptions,
          config: this.props.config
        });
      }
    }]);

    return RuleContainer;
  }(_react.Component), _class.propTypes = {
    config: _react.PropTypes.object.isRequired,
    operator: _react.PropTypes.string,
    field: _react.PropTypes.string
  }, _temp2;
};