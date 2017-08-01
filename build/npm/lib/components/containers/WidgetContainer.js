'use strict';

exports.__esModule = true;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _reactAddonsShallowCompare = require('react-addons-shallow-compare');

var _reactAddonsShallowCompare2 = _interopRequireDefault(_reactAddonsShallowCompare);

var _range = require('lodash/range');

var _range2 = _interopRequireDefault(_range);

var _index = require('../../utils/index');

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
            var _ref;

            var _temp, _this, _ret;

            _classCallCheck(this, WidgetContainer);

            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = WidgetContainer.__proto__ || Object.getPrototypeOf(WidgetContainer)).call.apply(_ref, [this].concat(args))), _this), _this.shouldComponentUpdate = _reactAddonsShallowCompare2.default, _temp), _possibleConstructorReturn(_this, _ret);
        }

        _createClass(WidgetContainer, [{
            key: 'renderWidget',
            value: function renderWidget(delta, widget) {
                var _this2 = this;

                var valueLabel = (0, _index.getValueLabel)(this.props.config, this.props.field, this.props.operator, delta);

                var _props$config$widgets = this.props.config.widgets[widget],
                    widgetFactory = _props$config$widgets.factory,
                    basicWidgetProps = _objectWithoutProperties(_props$config$widgets, ['factory']);

                var _getFieldConfig = (0, _index.getFieldConfig)(this.props.field, this.props.config),
                    fieldWidgetProps = _getFieldConfig.widgetProps;

                var widgetProps = Object.assign({}, basicWidgetProps, fieldWidgetProps || {}, {
                    config: this.props.config,
                    field: this.props.field,
                    operator: this.props.operator,
                    delta: delta,
                    value: this.props.value.get(delta),
                    label: valueLabel.label,
                    placeholder: valueLabel.placeholder,
                    setValue: function setValue(value) {
                        return _this2.props.setValue(delta, value);
                    }
                });

                return widgetFactory(widgetProps);
            }
        }, {
            key: 'render',
            value: function render() {
                var _this3 = this;

                var fieldDefinition = (0, _index.getFieldConfig)(this.props.field, this.props.config);
                var operatorDefinition = this.props.config.operators[this.props.operator];
                if (typeof fieldDefinition === 'undefined' || typeof operatorDefinition === 'undefined') {
                    return null;
                }
                var widget = (0, _index.defaultValue)(operatorDefinition.widget, fieldDefinition.widget);
                var widgetDefinition = this.props.config.widgets[widget];
                if (typeof widgetDefinition === 'undefined') {
                    return null;
                }

                var cardinality = (0, _index.defaultValue)(operatorDefinition.cardinality, 1);
                if (cardinality === 0) {
                    return null;
                }

                var settings = this.props.config.settings;

                if (typeof widgetBehavior === 'undefined') {
                    return _react2.default.createElement(
                        Widget,
                        { name: widget, config: this.props.config },
                        (0, _range2.default)(0, cardinality).map(function (delta) {
                            var valueLabel = (0, _index.getValueLabel)(_this3.props.config, _this3.props.field, _this3.props.operator, delta);
                            var parts = [];
                            if (operatorDefinition.textSeparators) {
                                var sep = operatorDefinition.textSeparators[delta];
                                if (sep) {
                                    parts.push(_react2.default.createElement(
                                        'div',
                                        { className: 'widget--sep' },
                                        settings.showLabels ? _react2.default.createElement(
                                            'label',
                                            null,
                                            '\xA0'
                                        ) : null,
                                        _react2.default.createElement(
                                            'span',
                                            null,
                                            sep
                                        )
                                    ));
                                }
                            }

                            parts.push(_react2.default.createElement(
                                'div',
                                { key: "widget-" + _this3.props.field + "-" + delta, className: 'widget--widget' },
                                settings.showLabels ? _react2.default.createElement(
                                    'label',
                                    null,
                                    valueLabel.label
                                ) : null,
                                _this3.renderWidget.call(_this3, delta, widget)
                            ));

                            return parts;
                        })
                    );
                }

                return null;
            }
        }]);

        return WidgetContainer;
    }(_react.Component), _class.propTypes = {
        config: _react.PropTypes.object.isRequired,
        value: _react.PropTypes.instanceOf(_immutable2.default.List).isRequired,
        field: _react.PropTypes.string.isRequired,
        operator: _react.PropTypes.string.isRequired
    }, _temp2;
};