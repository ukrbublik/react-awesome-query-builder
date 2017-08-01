'use strict';

exports.__esModule = true;
exports.default = undefined;

var _css = require('antd/lib/switch/style/css');

var _switch = require('antd/lib/switch');

var _switch2 = _interopRequireDefault(_switch);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BooleanWidget = (_temp = _class = function (_Component) {
    _inherits(BooleanWidget, _Component);

    function BooleanWidget() {
        _classCallCheck(this, BooleanWidget);

        return _possibleConstructorReturn(this, (BooleanWidget.__proto__ || Object.getPrototypeOf(BooleanWidget)).apply(this, arguments));
    }

    _createClass(BooleanWidget, [{
        key: 'handleChange',
        value: function handleChange() {
            this.props.setValue(this.refs.widget.getValue());
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props,
                value = _props.value,
                delta = _props.delta,
                id = _props.id;

            return _react2.default.createElement(_switch2.default, {
                checkedChildren: this.props.labelYes || null,
                unCheckedChildren: this.props.labelNo || null
            });
        }
    }]);

    return BooleanWidget;
}(_react.Component), _class.propTypes = {
    setValue: _react.PropTypes.func.isRequired,
    delta: _react.PropTypes.number.isRequired
}, _class.defaultProps = {
    labelYes: null, //(<Icon type="check" />),
    labelNo: null //(<Icon type="cross" />),
}, _temp);
exports.default = BooleanWidget;