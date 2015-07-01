'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var _objectWithoutProperties = require('babel-runtime/helpers/object-without-properties')['default'];

var _Object$keys = require('babel-runtime/core-js/object/keys')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _reactPureRenderFunction = require('react-pure-render/function');

var _reactPureRenderFunction2 = _interopRequireDefault(_reactPureRenderFunction);

var _Rule = require('./Rule');

var _Rule2 = _interopRequireDefault(_Rule);

var _Group = require('./Group');

var _Group2 = _interopRequireDefault(_Group);

var typeMap = {
  rule: function rule(props) {
    return _react2['default'].createElement(_Rule2['default'], _extends({}, props.properties.toObject(), {
      id: props.id,
      path: props.path,
      actions: props.actions,
      config: props.config }));
  },
  group: function group(props) {
    return _react2['default'].createElement(
      _Group2['default'],
      _extends({}, props.properties.toObject(), {
        id: props.id,
        path: props.path,
        actions: props.actions,
        config: props.config }),
      props.children ? props.children.map(function (item) {
        return _react2['default'].createElement(
          Item,
          {
            key: item.get('id'),
            id: item.get('id'),
            path: props.path.push(item.get('id')),
            type: item.get('type'),
            properties: item.get('properties'),
            config: props.config,
            actions: props.actions },
          item.get('children')
        );
      }).toList() : null
    );
  }
};

var Item = (function (_Component) {
  function Item() {
    _classCallCheck(this, Item);

    _Component.apply(this, arguments);

    this.shouldComponentUpdate = _reactPureRenderFunction2['default'];
  }

  _inherits(Item, _Component);

  Item.prototype.render = function render() {
    var _props = this.props;
    var type = _props.type;

    var props = _objectWithoutProperties(_props, ['type']);

    return typeMap[type](props);
  };

  _createClass(Item, null, [{
    key: 'propTypes',
    value: {
      config: _react.PropTypes.object.isRequired,
      id: _react.PropTypes.string.isRequired,
      type: _react.PropTypes.oneOf(_Object$keys(typeMap)).isRequired,
      path: _react.PropTypes.instanceOf(_immutable2['default'].List).isRequired,
      properties: _react.PropTypes.instanceOf(_immutable2['default'].Map).isRequired,
      children: _react.PropTypes.instanceOf(_immutable2['default'].OrderedMap)
    },
    enumerable: true
  }]);

  return Item;
})(_react.Component);

exports['default'] = Item;
module.exports = exports['default'];