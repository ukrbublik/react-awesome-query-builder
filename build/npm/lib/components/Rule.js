'use strict';

exports.__esModule = true;
exports.default = undefined;

var _css = require('antd/lib/row/style/css');

var _row = require('antd/lib/row');

var _row2 = _interopRequireDefault(_row);

var _css2 = require('antd/lib/col/style/css');

var _col = require('antd/lib/col');

var _col2 = _interopRequireDefault(_col);

var _css3 = require('antd/lib/button/style/css');

var _button = require('antd/lib/button');

var _button2 = _interopRequireDefault(_button);

var _css4 = require('antd/lib/dropdown/style/css');

var _dropdown = require('antd/lib/dropdown');

var _dropdown2 = _interopRequireDefault(_dropdown);

var _css5 = require('antd/lib/menu/style/css');

var _menu = require('antd/lib/menu');

var _menu2 = _interopRequireDefault(_menu);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _class2, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactAddonsShallowCompare = require('react-addons-shallow-compare');

var _reactAddonsShallowCompare2 = _interopRequireDefault(_reactAddonsShallowCompare);

var _RuleContainer = require('./containers/RuleContainer');

var _RuleContainer2 = _interopRequireDefault(_RuleContainer);

var _Field = require('./Field');

var _Field2 = _interopRequireDefault(_Field);

var _Operator = require('./Operator');

var _Operator2 = _interopRequireDefault(_Operator);

var _Widget = require('./Widget');

var _Widget2 = _interopRequireDefault(_Widget);

var _OperatorOptions = require('./OperatorOptions');

var _OperatorOptions2 = _interopRequireDefault(_OperatorOptions);

var _index = require('../utils/index');

var _size = require('lodash/size');

var _size2 = _interopRequireDefault(_size);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SubMenu = _menu2.default.SubMenu;
var MenuItem = _menu2.default.Item;
var DropdownButton = _dropdown2.default.Button;

var stringify = require('json-stringify-safe');

var Rule = (0, _RuleContainer2.default)(_class = (_temp = _class2 = function (_Component) {
    _inherits(Rule, _Component);

    function Rule(props) {
        _classCallCheck(this, Rule);

        var _this = _possibleConstructorReturn(this, (Rule.__proto__ || Object.getPrototypeOf(Rule)).call(this, props));

        _this.shouldComponentUpdate = _reactAddonsShallowCompare2.default;

        _this.state = {};
        return _this;
    }

    _createClass(Rule, [{
        key: 'render',
        value: function render() {
            var selectedFieldPartsLabels = (0, _index.getFieldPathLabels)(this.props.selectedField, this.props.config);
            var selectedFieldConfig = (0, _index.getFieldConfig)(this.props.selectedField, this.props.config);
            var isSelectedGroup = selectedFieldConfig && selectedFieldConfig.widget == '!struct';
            var isFieldAndOpSelected = this.props.selectedField && this.props.selectedOperator && !isSelectedGroup;
            //const widgetConfig = config.widgets[selectedFieldConfig.widget] || {};

            var selectedOperatorConfig = this.props.config.operators[this.props.selectedOperator];
            var selectedOperatorHasOptions = selectedOperatorConfig && selectedOperatorConfig.options != null;

            return _react2.default.createElement(
                'div',
                { className: 'rule' },
                _react2.default.createElement(
                    'div',
                    { className: 'rule--header' },
                    _react2.default.createElement(
                        _button2.default,
                        {
                            type: 'danger',
                            icon: 'delete',
                            onClick: this.props.removeSelf,
                            size: this.props.config.settings.renderSize || "small"
                        },
                        this.props.config.settings.deleteLabel !== undefined ? this.props.config.settings.deleteLabel : "Delete"
                    )
                ),
                _react2.default.createElement(
                    'div',
                    { className: 'rule--body' },
                    _react2.default.createElement(
                        _row2.default,
                        null,
                        true ? _react2.default.createElement(
                            _col2.default,
                            { key: "fields", className: 'rule--field' },
                            this.props.config.settings.showLabels && _react2.default.createElement(
                                'label',
                                null,
                                this.props.config.settings.fieldLabel || "Field"
                            ),
                            _react2.default.createElement(_Field2.default, {
                                key: 'field',
                                config: this.props.config,
                                selectedField: this.props.selectedField,
                                setField: this.props.setField,
                                renderAsDropdown: this.props.config.settings.renderFieldAndOpAsDropdown
                            })
                        ) : null,
                        this.props.selectedField && !selectedFieldConfig.hideOperator && _react2.default.createElement(
                            _col2.default,
                            { key: "operators-for-" + (selectedFieldPartsLabels || []).join("_"), className: 'rule--operator' },
                            this.props.config.settings.showLabels && _react2.default.createElement(
                                'label',
                                null,
                                this.props.config.settings.operatorLabel || "Operator"
                            ),
                            _react2.default.createElement(_Operator2.default, {
                                key: 'operator',
                                config: this.props.config,
                                selectedField: this.props.selectedField,
                                selectedOperator: this.props.selectedOperator,
                                setOperator: this.props.setOperator,
                                renderAsDropdown: this.props.config.settings.renderFieldAndOpAsDropdown
                            })
                        ),
                        this.props.selectedField && selectedFieldConfig.hideOperator && selectedFieldConfig.operatorLabel && _react2.default.createElement(
                            _col2.default,
                            { key: "operators-for-" + (selectedFieldPartsLabels || []).join("_"), className: 'rule--operator' },
                            _react2.default.createElement(
                                'div',
                                { className: 'rule--operator' },
                                this.props.config.settings.showLabels ? _react2.default.createElement(
                                    'label',
                                    null,
                                    '\xA0'
                                ) : null,
                                _react2.default.createElement(
                                    'span',
                                    null,
                                    selectedFieldConfig.operatorLabel
                                )
                            )
                        ),
                        isFieldAndOpSelected && selectedOperatorHasOptions && _react2.default.createElement(
                            _col2.default,
                            { key: "op-options-for-" + this.props.selectedOperator, className: 'rule--operator-options' },
                            _react2.default.createElement(_OperatorOptions2.default, {
                                key: 'operatorOptions',
                                selectedField: this.props.selectedField,
                                selectedOperator: this.props.selectedOperator,
                                operatorOptions: this.props.operatorOptions,
                                setOperatorOption: this.props.setOperatorOption,
                                config: this.props.config
                            })
                        ),
                        isFieldAndOpSelected && _react2.default.createElement(
                            _col2.default,
                            { key: "widget-for-" + this.props.selectedOperator, className: 'rule--value' },
                            _react2.default.createElement(_Widget2.default, {
                                key: 'values',
                                field: this.props.selectedField,
                                operator: this.props.selectedOperator,
                                value: this.props.value,
                                config: this.props.config,
                                setValue: this.props.setValue
                            })
                        )
                    )
                )
            );
        }
    }]);

    return Rule;
}(_react.Component), _class2.propTypes = {
    selectedField: _react.PropTypes.string,
    selectedOperator: _react.PropTypes.string,
    operatorOptions: _react.PropTypes.object.isRequired,
    config: _react.PropTypes.object.isRequired,
    //actions
    setField: _react.PropTypes.func.isRequired,
    setOperator: _react.PropTypes.func.isRequired,
    setOperatorOption: _react.PropTypes.func.isRequired,
    removeSelf: _react.PropTypes.func.isRequired
}, _temp)) || _class;

exports.default = Rule;