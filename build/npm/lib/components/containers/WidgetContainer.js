'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _objectWithoutProperties = require('babel-runtime/helpers/object-without-properties')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _reactPureRenderFunction = require('react-pure-render/function');

var _reactPureRenderFunction2 = _interopRequireDefault(_reactPureRenderFunction);

var _lodashUtilityRange = require('lodash/utility/range');

var _lodashUtilityRange2 = _interopRequireDefault(_lodashUtilityRange);

var _Delta = require('../Delta');

var _Delta2 = _interopRequireDefault(_Delta);

exports['default'] = function (Widget) {
  return (function (_Component) {
    function WidgetContainer() {
      _classCallCheck(this, WidgetContainer);

      _Component.apply(this, arguments);

      this.shouldComponentUpdate = _reactPureRenderFunction2['default'];
    }

    _inherits(WidgetContainer, _Component);

    WidgetContainer.prototype.setValue = function setValue(delta, value) {
      this.props.actions.setValue(this.props.path, delta, value, this.props.config);
    };

    WidgetContainer.prototype.setValueOption = function setValueOption(delta, name, value) {
      this.props.actions.setValueOption(this.props.path, delta, name, value, this.props.config);
    };

    WidgetContainer.prototype.renderOptions = function renderOptions(delta) {
      var _this = this;

      var operatorDefinitions = this.props.config.operators[this.props.operator];
      if (typeof operatorDefinitions.valueOptions === 'undefined') {
        return null;
      }

      var _operatorDefinitions$valueOptions = operatorDefinitions.valueOptions;
      var optionsFactory = _operatorDefinitions$valueOptions.factory;

      var optionsProps = _objectWithoutProperties(_operatorDefinitions$valueOptions, ['factory']);

      return optionsFactory(_Object$assign({}, optionsProps, {
        config: this.props.config,
        field: this.props.field,
        operator: this.props.operator,
        delta: delta,
        options: this.props.options.get(delta + '', new _immutable2['default'].Map()),
        setOption: function setOption(name, value) {
          return _this.setValueOption.call(_this, delta, name, value);
        }
      }));
    };

    WidgetContainer.prototype.renderWidget = function renderWidget(delta) {
      var _this2 = this;

      var fieldDefinition = this.props.config.fields[this.props.field];
      var _props$config$widgets$fieldDefinition$widget = this.props.config.widgets[fieldDefinition.widget];
      var widgetFactory = _props$config$widgets$fieldDefinition$widget.factory;

      var widgetProps = _objectWithoutProperties(_props$config$widgets$fieldDefinition$widget, ['factory']);

      return widgetFactory(_Object$assign({}, widgetProps, {
        config: this.props.config,
        field: this.props.field,
        operator: this.props.operator,
        delta: delta,
        value: this.props.value.get(delta),
        setValue: function setValue(value) {
          return _this2.setValue.call(_this2, delta, value);
        }
      }));
    };

    WidgetContainer.prototype.render = function render() {
      var _this3 = this;

      var cardinality = this.props.config.operators[this.props.operator].cardinality || 1;
      if (cardinality === 0) {
        return null;
      }

      var fieldDefinition = this.props.config.fields[this.props.field];
      var widgetBehavior = this.props.config.widgets[fieldDefinition.widget].behavior;
      var _props$config$operators$props$operator = this.props.config.operators[this.props.operator];
      var optionsFactory = _props$config$operators$props$operator.factory;

      var operatorDefinition = _objectWithoutProperties(_props$config$operators$props$operator, ['factory']);

      if (typeof widgetBehavior === 'undefined') {
        return _react2['default'].createElement(
          Widget,
          { name: fieldDefinition.widget },
          _lodashUtilityRange2['default'](0, cardinality).map(function (delta) {
            return _react2['default'].createElement(
              _Delta2['default'],
              { key: delta, delta: delta },
              _this3.renderWidget.call(_this3, delta),
              _this3.renderOptions.call(_this3, delta)
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
    };

    _createClass(WidgetContainer, null, [{
      key: 'propTypes',
      value: {
        config: _react.PropTypes.object.isRequired,
        path: _react.PropTypes.instanceOf(_immutable2['default'].List).isRequired,
        value: _react.PropTypes.instanceOf(_immutable2['default'].List).isRequired,
        field: _react.PropTypes.string.isRequired,
        operator: _react.PropTypes.string.isRequired
      },
      enumerable: true
    }]);

    return WidgetContainer;
  })(_react.Component);
};

module.exports = exports['default'];