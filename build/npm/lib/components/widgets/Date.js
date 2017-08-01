'use strict';

exports.__esModule = true;
exports.default = undefined;

var _css = require('antd/lib/locale-provider/style/css');

var _localeProvider = require('antd/lib/locale-provider');

var _localeProvider2 = _interopRequireDefault(_localeProvider);

var _css2 = require('antd/lib/date-picker/style/css');

var _datePicker = require('antd/lib/date-picker');

var _datePicker2 = _interopRequireDefault(_datePicker);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _utils = require('../../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MonthPicker = _datePicker2.default.MonthPicker,
    RangePicker = _datePicker2.default.RangePicker;
var DateWidget = (_temp = _class = function (_Component) {
    _inherits(DateWidget, _Component);

    function DateWidget(props) {
        _classCallCheck(this, DateWidget);

        var _this = _possibleConstructorReturn(this, (DateWidget.__proto__ || Object.getPrototypeOf(DateWidget)).call(this, props));

        var valueFormat = props.valueFormat,
            value = props.value,
            setValue = props.setValue;

        var mValue = value ? (0, _moment2.default)(value, valueFormat) : null;
        if (mValue && !mValue.isValid()) {
            setValue(null);
        }

        _moment2.default.locale(_this.props.config.settings.locale.short);
        return _this;
    }

    _createClass(DateWidget, [{
        key: 'handleChange',
        value: function handleChange(_value) {
            var _props = this.props,
                setValue = _props.setValue,
                valueFormat = _props.valueFormat;

            var value = _value instanceof _moment2.default && _value.isValid() ? _value.format(valueFormat) : null;
            if (value || _value === null) setValue(value);
        }
    }, {
        key: 'render',
        value: function render() {
            var _props2 = this.props,
                dateFormat = _props2.dateFormat,
                valueFormat = _props2.valueFormat,
                value = _props2.value;

            var dateValue = value ? (0, _moment2.default)(value, valueFormat) : null;
            return _react2.default.createElement(
                _localeProvider2.default,
                { locale: (0, _utils.getAntLocale)(this.props.config.settings.locale.full2) },
                _react2.default.createElement(_datePicker2.default, {
                    key: 'widget-date',
                    placeholder: this.props.placeholder,
                    size: this.props.config.settings.renderSize || "small",
                    format: dateFormat,
                    value: dateValue,
                    onChange: this.handleChange.bind(this),
                    ref: 'datetime'
                })
            );
        }
    }]);

    return DateWidget;
}(_react.Component), _class.propTypes = {
    setValue: _react.PropTypes.func.isRequired,
    delta: _react.PropTypes.number.isRequired,
    dateFormat: _react.PropTypes.string,
    valueFormat: _react.PropTypes.string
}, _class.defaultProps = {
    dateFormat: 'YYYY-MM-DD',
    valueFormat: 'YYYY-MM-DD'
}, _temp);
exports.default = DateWidget;