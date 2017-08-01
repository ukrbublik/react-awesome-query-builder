'use strict';

exports.__esModule = true;
exports.default = undefined;

var _css = require('antd/lib/button/style/css');

var _button = require('antd/lib/button');

var _button2 = _interopRequireDefault(_button);

var _css2 = require('antd/lib/icon/style/css');

var _icon = require('antd/lib/icon');

var _icon2 = _interopRequireDefault(_icon);

var _css3 = require('antd/lib/dropdown/style/css');

var _dropdown = require('antd/lib/dropdown');

var _dropdown2 = _interopRequireDefault(_dropdown);

var _css4 = require('antd/lib/menu/style/css');

var _menu = require('antd/lib/menu');

var _menu2 = _interopRequireDefault(_menu);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

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

var _pickBy = require('lodash/pickBy');

var _pickBy2 = _interopRequireDefault(_pickBy);

var _mapValues = require('lodash/mapValues');

var _mapValues2 = _interopRequireDefault(_mapValues);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SubMenu = _menu2.default.SubMenu;
var MenuItem = _menu2.default.Item;
var DropdownButton = _dropdown2.default.Button;
var Operator = (_temp = _class = function (_Component) {
    _inherits(Operator, _Component);

    function Operator(props) {
        _classCallCheck(this, Operator);

        var _this = _possibleConstructorReturn(this, (Operator.__proto__ || Object.getPrototypeOf(Operator)).call(this, props));

        _this.shouldComponentUpdate = _reactAddonsShallowCompare2.default;

        _this.onPropsChanged(props);
        return _this;
    }

    _createClass(Operator, [{
        key: 'componentWillReceiveProps',
        value: function componentWillReceiveProps(props) {
            this.onPropsChanged(props);
        }
    }, {
        key: 'onPropsChanged',
        value: function onPropsChanged(props) {
            var fieldConfig = (0, _index.getFieldConfig)(props.selectedField, props.config);
            this.operatorOptions = (0, _mapValues2.default)((0, _pickBy2.default)(props.config.operators, function (item, index) {
                return fieldConfig && fieldConfig.operators && fieldConfig.operators.indexOf(index) !== -1;
            }));
        }
    }, {
        key: 'curOpOpts',
        value: function curOpOpts() {
            return Object.assign({}, { label: this.props.selectedOperator }, this.operatorOptions[this.props.selectedOperator] || {});
        }
    }, {
        key: 'handleOperatorSelect',
        value: function handleOperatorSelect(_ref) {
            var key = _ref.key,
                keyPath = _ref.keyPath;

            this.props.setOperator(key);
        }
    }, {
        key: 'buildMenuItems',
        value: function buildMenuItems(fields) {
            if (!fields) return null;
            return (0, _keys2.default)(fields).map(function (fieldKey) {
                var field = fields[fieldKey];
                return React.createElement(
                    MenuItem,
                    { key: fieldKey },
                    field.label
                );
            });
        }
    }, {
        key: 'buildMenuToggler',
        value: function buildMenuToggler(label) {
            var toggler = React.createElement(
                _button2.default,
                {
                    size: this.props.config.settings.renderSize || "small"
                },
                label,
                ' ',
                React.createElement(_icon2.default, { type: 'down' })
            );

            return toggler;
        }
    }, {
        key: 'render',
        value: function render() {
            var selectedOpKey = this.props.selectedOperator;
            var opMenuItems = this.buildMenuItems(this.operatorOptions);
            var opMenu = React.createElement(
                _menu2.default,
                {
                    //size={this.props.config.settings.renderSize || "small"}
                    selectedKeys: [selectedOpKey],
                    onClick: this.handleOperatorSelect.bind(this)
                },
                opMenuItems
            );
            var opToggler = this.buildMenuToggler(this.curOpOpts().label || this.props.config.settings.operatorPlaceholder);

            return React.createElement(
                _dropdown2.default,
                {
                    overlay: opMenu,
                    trigger: ['click']
                },
                opToggler
            );
        }
    }]);

    return Operator;
}(_react.Component), _class.propTypes = {
    config: _react.PropTypes.object.isRequired,
    selectedField: _react.PropTypes.string,
    selectedOperator: _react.PropTypes.string,
    setOperator: _react.PropTypes.func.isRequired,
    renderAsDropdown: _react.PropTypes.bool
}, _temp);
exports.default = Operator;