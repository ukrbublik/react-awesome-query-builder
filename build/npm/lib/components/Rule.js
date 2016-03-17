'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _class2, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _function = require('react-pure-render/function');

var _function2 = _interopRequireDefault(_function);

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

var _size = require('lodash/size');

var _size2 = _interopRequireDefault(_size);

var _RuleContainer = require('./containers/RuleContainer');

var _RuleContainer2 = _interopRequireDefault(_RuleContainer);

var _reactDdMenu = require('react-dd-menu');

var _reactDdMenu2 = _interopRequireDefault(_reactDdMenu);

var _reactBootstrap = require('react-bootstrap');

var _keys = require('lodash/keys');

var _keys2 = _interopRequireDefault(_keys);

var _pickBy = require('lodash/pickBy');

var _pickBy2 = _interopRequireDefault(_pickBy);

var _omitBy = require('lodash/omitBy');

var _omitBy2 = _interopRequireDefault(_omitBy);

var _mapKeys = require('lodash/mapKeys');

var _mapKeys2 = _interopRequireDefault(_mapKeys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

require('react-dd-menu/dist/react-dd-menu.css');

var stringify = require('json-stringify-safe');

var Rule = (0, _RuleContainer2.default)(_class = (_temp = _class2 = function (_Component) {
    _inherits(Rule, _Component);

    function Rule(props) {
        _classCallCheck(this, Rule);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Rule).call(this, props));

        _this.shouldComponentUpdate = _function2.default;

        var curFieldOpts = props.fieldOptions[props.selectedField] || {};
        _this.state = {
            isFieldOpen: false,
            curField: curFieldOpts.label || "Field"
        };
        return _this;
    }

    _createClass(Rule, [{
        key: 'toggle',
        value: function toggle() {
            this.setState({ isFieldOpen: !this.state.isFieldOpen });
        }
    }, {
        key: 'close',
        value: function close() {
            this.setState({ isFieldOpen: false });
        }
    }, {
        key: 'handleFieldSelect1',
        value: function handleFieldSelect1() {
            var node = _reactDom2.default.findDOMNode(this.refs.field);
            this.props.setField(node.value);
        }
    }, {
        key: 'handleFieldSelect',
        value: function handleFieldSelect(label, value) {
            this.props.setField(value);
            this.setState({ curField: label });
        }
    }, {
        key: 'handleOperatorSelect',
        value: function handleOperatorSelect() {
            // const node = ReactDOM.findDOMNode(this.refs.operator);
            this.props.setOperator(this.refs.operator.getValue());
        }
    }, {
        key: 'getFieldMenu',
        value: function getFieldMenu(fields, prefix) {
            var _this2 = this;

            if (prefix === undefined) {
                prefix = '';
            } else {
                prefix = prefix + this.props.fieldSeparator;
            }

            var direct_fields = (0, _omitBy2.default)(fields, function (value, key) {
                return key.indexOf(_this2.props.fieldSeparator) > -1;
            });

            return (0, _keys2.default)(direct_fields).map(function (field) {
                if (fields[field].widget == "submenu") {
                    var child_fields = (0, _pickBy2.default)(fields, function (value, key) {
                        return key.startsWith(field + _this2.props.fieldSeparator);
                    });
                    child_fields = (0, _mapKeys2.default)(child_fields, function (value, key) {
                        return key.substring(field.length + _this2.props.fieldSeparator.length);
                    });
                    return _react2.default.createElement(
                        _reactDdMenu.NestedDropdownMenu,
                        { key: prefix + field, toggle: _react2.default.createElement(
                                'a',
                                { href: '#' },
                                fields[field].label
                            ),
                            direction: 'right', animate: false, delay: 0 },
                        _this2.getFieldMenu(child_fields, prefix + field)
                    );
                } else {
                    var short_label;
                    var label = fields[field].label || fields[field];
                    if (label.lastIndexOf(_this2.props.fieldSeparator) >= 0) {
                        short_label = label.substring(label.lastIndexOf(_this2.props.fieldSeparator) + _this2.props.fieldSeparator.length);
                    } else {
                        short_label = label;
                    }
                    return _react2.default.createElement(
                        'li',
                        { key: prefix + field },
                        _react2.default.createElement(
                            'button',
                            { type: 'button',
                                onClick: _this2.handleFieldSelect.bind(_this2, fields[field].label, prefix + field) },
                            short_label
                        )
                    );
                }
            });
        }
    }, {
        key: 'render',
        value: function render() {
            var short_field;
            if (this.state.curField.lastIndexOf(this.props.fieldSeparator) >= 0) {
                short_field = this.state.curField.substring(this.state.curField.lastIndexOf(this.props.fieldSeparator) + this.props.fieldSeparator.length);
            } else {
                short_field = this.state.curField;
            }
            var toggle = _react2.default.createElement(
                _reactBootstrap.Button,
                { bsStyle: 'primary', onClick: this.toggle.bind(this) },
                short_field,
                ' ',
                _react2.default.createElement('span', { className: 'caret' })
            );
            if (this.state.curField != short_field) {
                RegExp.quote = function (str) {
                    return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
                };
                toggle = _react2.default.createElement(
                    _reactBootstrap.OverlayTrigger,
                    { placement: 'top',
                        overlay: _react2.default.createElement(
                            _reactBootstrap.Tooltip,
                            { id: 'Field' },
                            _react2.default.createElement(
                                'strong',
                                null,
                                this.state.curField.replace(new RegExp(RegExp.quote(this.props.fieldSeparator), 'g'), this.props.fieldSeparatorDisplay)
                            )
                        ) },
                    toggle
                );
            }
            var fieldMenuOptions = {
                isOpen: this.state.isFieldOpen,
                close: this.close.bind(this),
                toggle: toggle,
                nested: 'right',
                direction: 'right',
                align: 'left',
                animate: true
            };
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
                    _reactBootstrap.Row,
                    { className: 'rule--body' },
                    (0, _size2.default)(this.props.fieldOptions) ? _react2.default.createElement(
                        _reactBootstrap.Col,
                        { key: 'field', className: 'rule--field' },
                        _react2.default.createElement(
                            'label',
                            null,
                            'Field'
                        ),
                        _react2.default.createElement(
                            _reactDdMenu2.default,
                            fieldMenuOptions,
                            this.getFieldMenu(this.props.fieldOptions)
                        )
                    ) : null,
                    (0, _size2.default)(this.props.operatorOptions) ? _react2.default.createElement(
                        _reactBootstrap.Col,
                        { key: 'operator', className: 'rule--operator' },
                        _react2.default.createElement(
                            'label',
                            null,
                            'Operator'
                        ),
                        _react2.default.createElement(
                            _reactBootstrap.Input,
                            { className: 'btn-success', type: 'select', ref: 'operator',
                                value: this.props.selectedOperator, onChange: this.handleOperatorSelect.bind(this) },
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
    }, {
        key: 'render1',
        value: function render1() {
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
                            { ref: 'field', value: this.props.selectedField,
                                onChange: this.handleFieldSelect.bind(this) },
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
                            { ref: 'operator', value: this.props.selectedOperator,
                                onChange: this.handleOperatorSelect.bind(this) },
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
    selectedOperator: _react.PropTypes.string,
    fieldSeparator: _react.PropTypes.string,
    fieldSeparatorDisplay: _react.PropTypes.string
}, _temp)) || _class;

exports.default = Rule;