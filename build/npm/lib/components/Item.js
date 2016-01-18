'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp2;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _function = require('react-pure-render/function');

var _function2 = _interopRequireDefault(_function);

var _Rule = require('./Rule');

var _Rule2 = _interopRequireDefault(_Rule);

var _Group = require('./Group');

var _Group2 = _interopRequireDefault(_Group);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var typeMap = {
  rule: function rule(props) {
    return _react2.default.createElement(_Rule2.default, _extends({}, props.properties.toObject(), {
      id: props.id,
      path: props.path,
      actions: props.actions,
      config: props.config }));
  },
  group: function group(props) {
    return _react2.default.createElement(
      _Group2.default,
      _extends({}, props.properties.toObject(), {
        id: props.id,
        path: props.path,
        actions: props.actions,
        config: props.config }),
      props.children1 ? props.children1.map(function (item) {
        return _react2.default.createElement(Item, {
          key: item.get('id'),
          id: item.get('id'),
          path: props.path.push(item.get('id')),
          type: item.get('type'),
          properties: item.get('properties'),
          config: props.config,
          actions: props.actions,
          children1: item.get('children1') });
      }).toList() : null
    );
  }
};

var Item = (_temp2 = _class = function (_Component) {
  _inherits(Item, _Component);

  function Item() {
    var _Object$getPrototypeO;

    var _temp, _this, _ret;

    _classCallCheck(this, Item);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Item)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.shouldComponentUpdate = _function2.default, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Item, [{
    key: 'render',
    value: function render() {
      var _props = this.props;
      var type = _props.type;

      var props = _objectWithoutProperties(_props, ['type']);

      return typeMap[type](props);
    }
  }]);

  return Item;
}(_react.Component), _class.propTypes = {
  config: _react.PropTypes.object.isRequired,
  id: _react.PropTypes.string.isRequired,
  type: _react.PropTypes.oneOf(Object.keys(typeMap)).isRequired,
  path: _react.PropTypes.instanceOf(_immutable2.default.List).isRequired,
  properties: _react.PropTypes.instanceOf(_immutable2.default.Map).isRequired,
  children1: _react.PropTypes.instanceOf(_immutable2.default.OrderedMap)
}, _temp2);
exports.default = Item;