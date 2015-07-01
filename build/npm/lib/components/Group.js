'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactPureRenderFunction = require('react-pure-render/function');

var _reactPureRenderFunction2 = _interopRequireDefault(_reactPureRenderFunction);

var _lodashCollectionMap = require('lodash/collection/map');

var _lodashCollectionMap2 = _interopRequireDefault(_lodashCollectionMap);

var _containersGroupContainer = require('./containers/GroupContainer');

var _containersGroupContainer2 = _interopRequireDefault(_containersGroupContainer);

var Group = (function (_Component) {
  function Group() {
    _classCallCheck(this, _Group);

    _Component.apply(this, arguments);

    this.shouldComponentUpdate = _reactPureRenderFunction2['default'];
  }

  _inherits(Group, _Component);

  var _Group = Group;

  _Group.prototype.render = function render() {
    return _react2['default'].createElement(
      'div',
      { className: 'group' },
      _react2['default'].createElement(
        'div',
        { className: 'group--header' },
        _react2['default'].createElement(
          'div',
          { className: 'group--conjunctions' },
          _lodashCollectionMap2['default'](this.props.conjunctionOptions, function (item, index) {
            return _react2['default'].createElement(
              'div',
              { key: index, className: 'conjunction conjunction--' + index.toUpperCase(), 'data-state': item.checked ? 'active' : 'inactive' },
              _react2['default'].createElement(
                'label',
                { htmlFor: item.id },
                item.label
              ),
              _react2['default'].createElement('input', { id: item.id, type: 'radio', name: item.name, value: index, checked: item.checked, onChange: item.setConjunction })
            );
          })
        ),
        _react2['default'].createElement(
          'div',
          { className: 'group--actions' },
          this.props.allowFurtherNesting ? _react2['default'].createElement(
            'button',
            { className: 'action action--ADD-GROUP', onClick: this.props.addGroup },
            'Add group'
          ) : null,
          _react2['default'].createElement(
            'button',
            { className: 'action action--ADD-RULE', onClick: this.props.addRule },
            'Add rule'
          ),
          this.props.allowRemoval ? _react2['default'].createElement(
            'button',
            { className: 'action action--DELETE', onClick: this.props.removeSelf },
            'Delete'
          ) : null
        )
      ),
      this.props.children ? _react2['default'].createElement(
        'div',
        { className: 'group--children' },
        this.props.children
      ) : null
    );
  };

  _createClass(_Group, null, [{
    key: 'propTypes',
    value: {
      conjunctionOptions: _react.PropTypes.object.isRequired,
      addRule: _react.PropTypes.func.isRequired,
      addGroup: _react.PropTypes.func.isRequired,
      removeSelf: _react.PropTypes.func.isRequired,
      allowFurtherNesting: _react.PropTypes.bool.isRequired,
      allowRemoval: _react.PropTypes.bool.isRequired
    },
    enumerable: true
  }]);

  Group = _containersGroupContainer2['default'](Group) || Group;
  return Group;
})(_react.Component);

exports['default'] = Group;
module.exports = exports['default'];