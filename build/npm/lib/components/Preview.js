'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _react = require('react');

var _reactPureRenderFunction = require('react-pure-render/function');

var _reactPureRenderFunction2 = _interopRequireDefault(_reactPureRenderFunction);

var _utilsQueryString = require('../utils/queryString');

var _utilsQueryString2 = _interopRequireDefault(_utilsQueryString);

var Preview = (function (_Component) {
  function Preview() {
    _classCallCheck(this, Preview);

    _Component.apply(this, arguments);

    this.shouldComponentUpdate = _reactPureRenderFunction2['default'];
  }

  _inherits(Preview, _Component);

  Preview.prototype.render = function render() {
    return this.props.children(_utilsQueryString2['default'](this.props.tree, this.props.config));
  };

  _createClass(Preview, null, [{
    key: 'propTypes',
    value: {
      config: _react.PropTypes.object.isRequired
    },
    enumerable: true
  }]);

  return Preview;
})(_react.Component);

exports['default'] = Preview;
module.exports = exports['default'];