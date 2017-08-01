'use strict';

exports.__esModule = true;
exports.default = undefined;

var _css = require('antd/lib/locale-provider/style/css');

var _localeProvider = require('antd/lib/locale-provider');

var _localeProvider2 = _interopRequireDefault(_localeProvider);

var _css2 = require('antd/lib/select/style/css');

var _select = require('antd/lib/select');

var _select2 = _interopRequireDefault(_select);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

var _index = require('../../utils/index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Option = _select2.default.Option;
var MultiSelectWidget = (_temp = _class = function (_Component) {
  _inherits(MultiSelectWidget, _Component);

  _createClass(MultiSelectWidget, [{
    key: 'handleChange',
    value: function handleChange(val) {
      this.props.setValue(val);
    }
  }]);

  function MultiSelectWidget(props) {
    _classCallCheck(this, MultiSelectWidget);

    var _this = _possibleConstructorReturn(this, (MultiSelectWidget.__proto__ || Object.getPrototypeOf(MultiSelectWidget)).call(this, props));

    _this.onPropsChanged(props);
    return _this;
  }

  _createClass(MultiSelectWidget, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(props) {
      this.onPropsChanged(props);
    }
  }, {
    key: 'onPropsChanged',
    value: function onPropsChanged(props) {
      var placeholder = this.props.placeholder || "Select option";
      var placeholderWidth = (0, _index.calcTextWidth)(placeholder, '12px');
      var fieldDefinition = (0, _index.getFieldConfig)(this.props.field, this.props.config);
      var optionsMaxWidth = 0;
      (0, _map2.default)(fieldDefinition.listValues, function (label, value) {
        optionsMaxWidth = Math.max(optionsMaxWidth, (0, _index.calcTextWidth)(label, '12px'));
      });

      this.placeholder = placeholder;
      this.placeholderWidth = placeholderWidth;
      this.optionsMaxWidth = optionsMaxWidth;
    }
  }, {
    key: 'render',
    value: function render() {
      var size = this.props.config.settings.renderSize || "small";
      var fieldDefinition = (0, _index.getFieldConfig)(this.props.field, this.props.config);
      var options = (0, _map2.default)(fieldDefinition.listValues, function (label, value) {
        return _react2.default.createElement(
          Option,
          { key: value, value: value },
          label
        );
      });
      var value = this.props.value && this.props.value.length ? this.props.value : null;

      return _react2.default.createElement(
        _localeProvider2.default,
        { locale: (0, _index.getAntLocale)(this.props.config.settings.locale.full2) },
        _react2.default.createElement(
          _select2.default,
          {
            multiple: true,
            style: {
              minWidth: value ? null : this.placeholderWidth + 30,
              width: this.props.value ? null : this.placeholderWidth + 30
            },
            dropdownStyle: {
              width: this.optionsMaxWidth + 40
            },
            key: "widget-multiselect",
            dropdownMatchSelectWidth: false,
            ref: 'val',
            placeholder: this.placeholder,
            size: size,
            value: value || undefined //note: (bug?) null forces placeholder to hide
            , onChange: this.handleChange.bind(this)
          },
          options
        )
      );
    }
  }]);

  return MultiSelectWidget;
}(_react.Component), _class.propTypes = {
  setValue: _react.PropTypes.func.isRequired,
  delta: _react.PropTypes.number.isRequired
}, _temp);
exports.default = MultiSelectWidget;