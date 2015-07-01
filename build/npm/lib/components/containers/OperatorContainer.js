'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _objectWithoutProperties = require('babel-runtime/helpers/object-without-properties')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

exports.__esModule = true;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _reactPureRenderFunction = require('react-pure-render/function');

var _reactPureRenderFunction2 = _interopRequireDefault(_reactPureRenderFunction);

exports['default'] = function (Operator) {
  return (function (_Component) {
    function OperatorContainer() {
      _classCallCheck(this, OperatorContainer);

      _Component.apply(this, arguments);

      this.shouldComponentUpdate = _reactPureRenderFunction2['default'];
    }

    _inherits(OperatorContainer, _Component);

    OperatorContainer.prototype.setOperatorOption = function setOperatorOption(name, value) {
      this.props.actions.setOperatorOption(this.props.path, name, value);
    };

    OperatorContainer.prototype.render = function render() {
      var _this = this;

      var operatorDefinitions = this.props.config.operators[this.props.operator];
      if (typeof operatorDefinitions.options === 'undefined') {
        return null;
      }

      var _operatorDefinitions$options = operatorDefinitions.options;
      var optionsFactory = _operatorDefinitions$options.factory;

      var optionsProps = _objectWithoutProperties(_operatorDefinitions$options, ['factory']);

      return _react2['default'].createElement(
        Operator,
        { name: this.props.operator },
        optionsFactory(_Object$assign({}, optionsProps, {
          config: this.props.config,
          field: this.props.field,
          operator: this.props.operator,
          options: this.props.options,
          setOption: function setOption(name, value) {
            return _this.setOperatorOption.call(_this, name, value);
          }
        }))
      );
    };

    _createClass(OperatorContainer, null, [{
      key: 'propTypes',
      value: {
        config: _react.PropTypes.object.isRequired,
        path: _react.PropTypes.instanceOf(_immutable2['default'].List).isRequired,
        value: _react.PropTypes.instanceOf(_immutable2['default'].List).isRequired,
        field: _react.PropTypes.string.isRequired,
        operator: _react.PropTypes.string.isRequired
      },
      enumerable: true
    }]);

    return OperatorContainer;
  })(_react.Component);
};

module.exports = exports['default'];