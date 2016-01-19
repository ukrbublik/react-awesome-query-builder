'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _function = require('react-pure-render/function');

var _function2 = _interopRequireDefault(_function);

var _range = require('lodash/utility/range');

var _range2 = _interopRequireDefault(_range);

var _Delta = require('../Delta');

var _Delta2 = _interopRequireDefault(_Delta);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

exports.default = function (Widget) {
  var _class, _temp2;

  return _temp2 = _class = function (_Component) {
    _inherits(WidgetContainer, _Component);

    function WidgetContainer() {
      var _Object$getPrototypeO;

      var _temp, _this, _ret;

      _classCallCheck(this, WidgetContainer);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(WidgetContainer)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.shouldComponentUpdate = _function2.default, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(WidgetContainer, [{
      key: 'setValue',
      value: function setValue(delta, value) {
        this.props.actions.setValue(this.props.path, delta, value);
      }
    }, {
      key: 'setValueOption',
      value: function setValueOption(delta, name, value) {
        this.props.actions.setValueOption(this.props.path, delta, name, value);
      }
    }, {
      key: 'renderOptions',
      value: function renderOptions(delta) {
        var _this2 = this;

        var operatorDefinitions = this.props.config.operators[this.props.operator];
        if (typeof operatorDefinitions.valueOptions === 'undefined') {
          return null;
        }

        var _operatorDefinitions$ = operatorDefinitions.valueOptions;
        var optionsFactory = _operatorDefinitions$.factory;

        var optionsProps = _objectWithoutProperties(_operatorDefinitions$, ['factory']);

        return optionsFactory(Object.assign({}, optionsProps, {
          config: this.props.config,
          field: this.props.field,
          operator: this.props.operator,
          delta: delta,
          options: this.props.options.get(delta + '', new _immutable2.default.Map()),
          setOption: function setOption(name, value) {
            return _this2.setValueOption.call(_this2, delta, name, value);
          }
        }));
      }
    }, {
      key: 'renderWidget',
      value: function renderWidget(delta) {
        var _this3 = this;

        var fieldDefinition = this.props.config.fields[this.props.field];
        var _props$config$widgets = this.props.config.widgets[fieldDefinition.widget];
        var widgetFactory = _props$config$widgets.factory;

        var widgetProps = _objectWithoutProperties(_props$config$widgets, ['factory']);

        return widgetFactory(Object.assign({}, widgetProps, {
          config: this.props.config,
          field: this.props.field,
          operator: this.props.operator,
          delta: delta,
          value: this.props.value.get(delta),
          setValue: function setValue(value) {
            return _this3.setValue.call(_this3, delta, value);
          }
        }));
      }
    }, {
      key: 'render',
      value: function render() {
        var _this4 = this;

        var fieldDefinition = this.props.config.fields[this.props.field];
        var operatorDefinition = this.props.config.operators[this.props.operator];
        if (typeof fieldDefinition === 'undefined' || typeof operatorDefinition === 'undefined') {
          return null;
        }

        var widgetDefinition = this.props.config.widgets[fieldDefinition.widget];
        if (typeof widgetDefinition === 'undefined') {
          return null;
        }

        var cardinality = operatorDefinition.cardinality || 1;
        if (cardinality === 0) {
          return null;
        }

        if (typeof widgetBehavior === 'undefined') {
          return _react2.default.createElement(
            Widget,
            { name: fieldDefinition.widget },
            (0, _range2.default)(0, cardinality).map(function (delta) {
              return _react2.default.createElement(
                _Delta2.default,
                { key: delta, delta: delta },
                _this4.renderWidget.call(_this4, delta),
                _this4.renderOptions.call(_this4, delta)
              );
            })
          );
        }

        // @todo Implement custom widget behavior rendering.
        // const widget = widgetFactory({
        //   definition: widgetDefinition,
        //   config: this.props.config,
        //   field: this.props.field,
        //   cardinality: cardinality,
        //   value: this.props.value,
        //   setValue: this.setValue.bind(this)
        // }, delta => this.props.operator.valueOptions ? this.props.operator.valueOptions.factory({
        //   definition: this.props.operator,
        //   config: this.props.config,
        //   field: this.props.field,
        //   delta: delta,
        //   options: this.props.valueOptions.get(delta),
        //   setOption: (name, value) => this.setValueOption.call(this, delta, name, value)
        // }) : null);

        return null;
      }
    }]);

    return WidgetContainer;
  }(_react.Component), _class.propTypes = {
    config: _react.PropTypes.object.isRequired,
    path: _react.PropTypes.instanceOf(_immutable2.default.List).isRequired,
    value: _react.PropTypes.instanceOf(_immutable2.default.List).isRequired,
    field: _react.PropTypes.string.isRequired,
    operator: _react.PropTypes.string.isRequired
  }, _temp2;
};