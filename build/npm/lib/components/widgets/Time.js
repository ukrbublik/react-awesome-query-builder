'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactBootstrap = require('react-bootstrap');

var _reactDatetime = require('react-datetime');

var _reactDatetime2 = _interopRequireDefault(_reactDatetime);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

require('react-datetime/css/react-datetime.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Time = (_temp = _class = function (_Component) {
    _inherits(Time, _Component);

    function Time() {
        _classCallCheck(this, Time);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Time).apply(this, arguments));
    }

    _createClass(Time, [{
        key: 'handleChange',
        value: function handleChange(value) {
            var _props = this.props;
            var setValue = _props.setValue;
            var valueFormat = _props.valueFormat;

            value = (0, _moment2.default)(value).format(valueFormat);
            setValue(value);
        }
    }, {
        key: 'handleClick',
        value: function handleClick() {
            console.log("In Date:handleClick");
        }
    }, {
        key: 'render',
        value: function render() {
            var _props2 = this.props;
            var timeFormat = _props2.timeFormat;
            var value = _props2.value;
            var locale = _props2.locale;

            return _react2.default.createElement(
                _reactBootstrap.Col,
                { xs: 3 },
                _react2.default.createElement(
                    'label',
                    null,
                    'Value'
                ),
                _react2.default.createElement(_reactDatetime2.default, {
                    timeFormat: timeFormat,
                    dateFormat: false,
                    locale: locale,
                    value: value,
                    onChange: this.handleChange.bind(this),
                    ref: 'datetime'
                })
            );
        }
    }]);

    return Time;
}(_react.Component), _class.propTypes = {
    setValue: _react.PropTypes.func.isRequired,
    delta: _react.PropTypes.number.isRequired,
    timeFormat: _react.PropTypes.string,
    valueFormat: _react.PropTypes.string,
    locale: _react.PropTypes.string
}, _class.defaultProps = {
    timeFormat: 'HH:mm',
    valueFormat: 'HH:mm:ss',
    locale: 'ru'
}, _temp);
exports.default = Time;