'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _objectWithoutProperties = require('babel-runtime/helpers/object-without-properties')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _storesTree = require('../stores/tree');

var _storesTree2 = _interopRequireDefault(_storesTree);

var _redux = require('redux');

var _reduxReact = require('redux/react');

var _actions = require('../actions');

var actions = _interopRequireWildcard(_actions);

var Query = (function (_Component) {
  function Query(props, context) {
    _classCallCheck(this, Query);

    _Component.call(this, props, context);

    var config = {
      conjunctions: props.conjunctions,
      fields: props.fields,
      operators: props.operators,
      widgets: props.widgets,
      settings: props.settings
    };

    var tree = _storesTree2['default'](config);

    this.state = {
      store: _redux.createStore({ tree: tree })
    };
  }

  _inherits(Query, _Component);

  Query.prototype.render = function render() {
    var _props = this.props;
    var conjunctions = _props.conjunctions;
    var fields = _props.fields;
    var operators = _props.operators;
    var widgets = _props.widgets;
    var settings = _props.settings;
    var children = _props.children;

    var props = _objectWithoutProperties(_props, ['conjunctions', 'fields', 'operators', 'widgets', 'settings', 'children']);

    return _react2['default'].createElement(
      _reduxReact.Provider,
      { store: this.state.store },
      function () {
        return _react2['default'].createElement(
          _reduxReact.Connector,
          { select: function (_ref) {
              var tree = _ref.tree;
              return { tree: tree };
            } },
          function (_ref2) {
            var tree = _ref2.tree;
            var dispatch = _ref2.dispatch;

            return children({
              tree: tree,
              actions: _redux.bindActionCreators(_Object$assign({}, actions.tree, actions.group, actions.rule), dispatch),
              config: { conjunctions: conjunctions, fields: fields, operators: operators, widgets: widgets, settings: settings }
            });
          }
        );
      }
    );
  };

  return Query;
})(_react.Component);

exports['default'] = Query;
module.exports = exports['default'];