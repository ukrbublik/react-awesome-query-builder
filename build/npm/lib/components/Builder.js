'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _componentsItem = require('../components/Item');

var _componentsItem2 = _interopRequireDefault(_componentsItem);

var Builder = (function (_Component) {
  function Builder() {
    _classCallCheck(this, Builder);

    _Component.apply(this, arguments);
  }

  _inherits(Builder, _Component);

  Builder.prototype.render = function render() {
    var id = this.props.tree.get('id');

    return _react2['default'].createElement(
      _componentsItem2['default'],
      { key: id,
        id: id,
        path: _immutable2['default'].List.of(id),
        type: this.props.tree.get('type'),
        properties: this.props.tree.get('properties'),
        config: this.props.config,
        actions: this.props.actions },
      this.props.tree.get('children')
    );
  };

  _createClass(Builder, null, [{
    key: 'propTypes',
    value: {
      tree: _react.PropTypes.instanceOf(_immutable2['default'].Map).isRequired,
      config: _react.PropTypes.object.isRequired
    },
    enumerable: true
  }]);

  return Builder;
})(_react.Component);

exports['default'] = Builder;
module.exports = exports['default'];