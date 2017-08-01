'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _reactAddonsShallowCompare = require('react-addons-shallow-compare');

var _reactAddonsShallowCompare2 = _interopRequireDefault(_reactAddonsShallowCompare);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.default = function (OperatorOptions) {
  var _class, _temp2;

  return _temp2 = _class = function (_Component) {
    _inherits(OperatorOptionsContainer, _Component);

    function OperatorOptionsContainer() {
      var _ref;

      var _temp, _this, _ret;

      _classCallCheck(this, OperatorOptionsContainer);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = OperatorOptionsContainer.__proto__ || Object.getPrototypeOf(OperatorOptionsContainer)).call.apply(_ref, [this].concat(args))), _this), _this.shouldComponentUpdate = _reactAddonsShallowCompare2.default, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(OperatorOptionsContainer, [{
      key: 'render',
      value: function render() {
        var _this2 = this;

        if (!this.props.selectedOperator) return null;
        var operatorDefinitions = this.props.config.operators[this.props.selectedOperator];
        if (typeof operatorDefinitions.options === 'undefined') {
          return null;
        }

        var _operatorDefinitions$ = operatorDefinitions.options,
            optionsFactory = _operatorDefinitions$.factory,
            optionsProps = _objectWithoutProperties(_operatorDefinitions$, ['factory']);

        return _react2.default.createElement(
          OperatorOptions,
          {
            name: this.props.selectedOperator,
            config: this.props.config
          },
          optionsFactory(Object.assign({}, optionsProps, {
            config: this.props.config,
            field: this.props.selectedField,
            operator: this.props.selectedOperator,
            options: this.props.operatorOptions,
            setOption: function setOption(name, value) {
              return _this2.props.setOperatorOption(name, value);
            }
          }))
        );
      }
    }]);

    return OperatorOptionsContainer;
  }(_react.Component), _class.propTypes = {
    config: _react.PropTypes.object.isRequired,
    operatorOptions: _react.PropTypes.instanceOf(_immutable2.default.Map).isRequired,
    selectedField: _react.PropTypes.string.isRequired,
    selectedOperator: _react.PropTypes.string.isRequired,
    //actions
    setOperatorOption: _react.PropTypes.func.isRequired
  }, _temp2;
};