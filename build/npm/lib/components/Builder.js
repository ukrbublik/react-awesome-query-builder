'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _Item = require('../components/Item');

var _Item2 = _interopRequireDefault(_Item);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Builder = (_temp = _class = function (_Component) {
  _inherits(Builder, _Component);

  function Builder() {
    _classCallCheck(this, Builder);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Builder).apply(this, arguments));
  }

  _createClass(Builder, [{
    key: 'render',
    value: function render() {
      var id = this.props.tree.get('id');

      return _react2.default.createElement(_Item2.default, { key: id,
        id: id,
        path: _immutable2.default.List.of(id),
        type: this.props.tree.get('type'),
        properties: this.props.tree.get('properties'),
        config: this.props.config,
        actions: this.props.actions,
        dispatch: this.props.dispatch,
        children1: this.props.tree.get('children1') });
    }
  }]);

  return Builder;
}(_react.Component), _class.propTypes = {
  tree: _react.PropTypes.instanceOf(_immutable2.default.Map).isRequired,
  config: _react.PropTypes.object.isRequired
}, _temp);
exports.default = Builder;