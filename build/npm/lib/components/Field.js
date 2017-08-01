'use strict';

exports.__esModule = true;
exports.default = undefined;

var _css = require('antd/lib/tooltip/style/css');

var _tooltip = require('antd/lib/tooltip');

var _tooltip2 = _interopRequireDefault(_tooltip);

var _css2 = require('antd/lib/button/style/css');

var _button = require('antd/lib/button');

var _button2 = _interopRequireDefault(_button);

var _css3 = require('antd/lib/icon/style/css');

var _icon = require('antd/lib/icon');

var _icon2 = _interopRequireDefault(_icon);

var _css4 = require('antd/lib/dropdown/style/css');

var _dropdown = require('antd/lib/dropdown');

var _dropdown2 = _interopRequireDefault(_dropdown);

var _css5 = require('antd/lib/menu/style/css');

var _menu = require('antd/lib/menu');

var _menu2 = _interopRequireDefault(_menu);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp2;

var _react = require('react');

var _reactAddonsShallowCompare = require('react-addons-shallow-compare');

var _reactAddonsShallowCompare2 = _interopRequireDefault(_reactAddonsShallowCompare);

var _index = require('../utils/index');

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

var _last = require('lodash/last');

var _last2 = _interopRequireDefault(_last);

var _keys = require('lodash/keys');

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SubMenu = _menu2.default.SubMenu;
var MenuItem = _menu2.default.Item;
var DropdownButton = _dropdown2.default.Button;
var Field = (_temp2 = _class = function (_Component) {
    _inherits(Field, _Component);

    function Field() {
        var _ref;

        var _temp, _this, _ret;

        _classCallCheck(this, Field);

        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Field.__proto__ || Object.getPrototypeOf(Field)).call.apply(_ref, [this].concat(args))), _this), _this.shouldComponentUpdate = _reactAddonsShallowCompare2.default, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(Field, [{
        key: 'curFieldOpts',
        value: function curFieldOpts() {
            return Object.assign({}, { label: this.props.selectedField }, (0, _index.getFieldConfig)(this.props.selectedField, this.props.config) || {});
        }
    }, {
        key: 'handleFieldSelect',
        value: function handleFieldSelect(_ref2) {
            var key = _ref2.key,
                keyPath = _ref2.keyPath;

            this.props.setField(key);
        }
    }, {
        key: 'buildMenuItems',
        value: function buildMenuItems(fields) {
            var _this2 = this;

            var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

            var fieldSeparator = this.props.config.settings.fieldSeparator;
            if (!fields) return null;
            var prefix = path ? path.join(fieldSeparator) + fieldSeparator : '';

            return (0, _keys2.default)(fields).map(function (fieldKey) {
                var field = fields[fieldKey];
                if (field.widget == "!struct") {
                    var subpath = (path ? path : []).concat(fieldKey);
                    return React.createElement(
                        SubMenu,
                        {
                            key: prefix + fieldKey,
                            title: React.createElement(
                                'span',
                                null,
                                field.label || (0, _last2.default)(fieldKey.split(fieldSeparator)),
                                ' \xA0\xA0\xA0\xA0'
                            )
                        },
                        _this2.buildMenuItems(field.subfields, subpath)
                    );
                } else {
                    return React.createElement(
                        MenuItem,
                        { key: prefix + fieldKey },
                        field.label || (0, _last2.default)(fieldKey.split(fieldSeparator))
                    );
                }
            });
        }
    }, {
        key: 'buildMenuToggler',
        value: function buildMenuToggler(label, fullLabel, customLabel) {
            var toggler = React.createElement(
                _button2.default,
                {
                    size: this.props.config.settings.renderSize || "small"
                },
                customLabel ? customLabel : label,
                ' ',
                React.createElement(_icon2.default, { type: 'down' })
            );

            if (fullLabel && fullLabel != label) {
                toggler = React.createElement(
                    _tooltip2.default,
                    {
                        placement: 'top',
                        title: fullLabel
                    },
                    toggler
                );
            }

            return toggler;
        }
    }, {
        key: 'render',
        value: function render() {
            var fieldOptions = this.props.config.fields;
            var selectedFieldsKeys = (0, _index.getFieldPath)(this.props.selectedField, this.props.config);
            var selectedFieldPartsLabels = (0, _index.getFieldPathLabels)(this.props.selectedField, this.props.config);
            var selectedFieldFullLabel = selectedFieldPartsLabels ? selectedFieldPartsLabels.join(this.props.config.settings.fieldSeparatorDisplay) : null;

            var fieldMenuItems = this.buildMenuItems(fieldOptions);
            var fieldMenu = React.createElement(
                _menu2.default,
                {
                    //size={this.props.config.settings.renderSize || "small"}
                    selectedKeys: selectedFieldsKeys,
                    onClick: this.handleFieldSelect.bind(this)
                },
                fieldMenuItems
            );
            var fieldToggler = this.buildMenuToggler(this.curFieldOpts().label || this.props.config.settings.fieldPlaceholder, selectedFieldFullLabel, this.curFieldOpts().label2);

            return React.createElement(
                _dropdown2.default,
                {
                    overlay: fieldMenu,
                    trigger: ['click']
                },
                fieldToggler
            );
        }
    }]);

    return Field;
}(_react.Component), _class.propTypes = {
    config: _react.PropTypes.object.isRequired,
    selectedField: _react.PropTypes.string,
    setField: _react.PropTypes.func.isRequired,
    renderAsDropdown: _react.PropTypes.bool
}, _temp2);
exports.default = Field;