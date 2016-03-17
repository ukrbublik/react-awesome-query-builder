'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactBootstrap = require('react-bootstrap');

var _reactRadioGroup = require('react-radio-group');

var _reactRadioGroup2 = _interopRequireDefault(_reactRadioGroup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Boolean = (_temp = _class = function (_Component) {
    _inherits(Boolean, _Component);

    function Boolean() {
        _classCallCheck(this, Boolean);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Boolean).apply(this, arguments));
    }

    _createClass(Boolean, [{
        key: 'handleChange',
        value: function handleChange() {
            this.props.setValue(this.refs.widget.getValue());
        }
    }, {
        key: 'render',
        value: function render() {
            var _props = this.props;
            var value = _props.value;
            var delta = _props.delta;
            var id = _props.id;

            return _react2.default.createElement(
                _reactBootstrap.Col,
                { xs: 4 },
                _react2.default.createElement(
                    'label',
                    null,
                    'Value'
                ),
                _react2.default.createElement(
                    _reactRadioGroup2.default,
                    { name: id, selectedValue: value, ref: 'widget', onChange: this.handleChange.bind(this) },
                    function (Radio) {
                        return _react2.default.createElement(
                            'div',
                            null,
                            _react2.default.createElement(_reactBootstrap.Input, { autoFocus: delta === 0, type: 'radio' }),
                            ' Yes',
                            _react2.default.createElement(_reactBootstrap.Input, { autoFocus: delta === 0, type: 'radio' }),
                            ' No'
                        );
                    }
                )
            );
        }
    }]);

    return Boolean;
}(_react.Component), _class.propTypes = {
    setValue: _react.PropTypes.func.isRequired,
    delta: _react.PropTypes.number.isRequired
}, _temp);
exports.default = Boolean;