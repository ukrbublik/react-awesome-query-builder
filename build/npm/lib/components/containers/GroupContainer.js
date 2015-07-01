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

var _lodashObjectMapValues = require('lodash/object/mapValues');

var _lodashObjectMapValues2 = _interopRequireDefault(_lodashObjectMapValues);

var _utilsDefaultRuleProperties = require('../../utils/defaultRuleProperties');

var _utilsDefaultRuleProperties2 = _interopRequireDefault(_utilsDefaultRuleProperties);

var _utilsDefaultGroupProperties = require('../../utils/defaultGroupProperties');

var _utilsDefaultGroupProperties2 = _interopRequireDefault(_utilsDefaultGroupProperties);

exports['default'] = function (Group) {
  return (function (_Component) {
    function GroupContainer() {
      _classCallCheck(this, GroupContainer);

      _Component.apply(this, arguments);

      this.shouldComponentUpdate = _reactPureRenderFunction2['default'];
    }

    _inherits(GroupContainer, _Component);

    GroupContainer.prototype.setConjunction = function setConjunction(conjunction) {
      this.props.actions.setConjunction(this.props.path, conjunction);
    };

    GroupContainer.prototype.removeSelf = function removeSelf() {
      this.props.actions.removeGroup(this.props.path);
    };

    GroupContainer.prototype.addGroup = function addGroup() {
      this.props.actions.addGroup(this.props.path, _utilsDefaultGroupProperties2['default'](this.props.config));
    };

    GroupContainer.prototype.addRule = function addRule() {
      this.props.actions.addRule(this.props.path, _utilsDefaultRuleProperties2['default'](this.props.config));
    };

    GroupContainer.prototype.render = function render() {
      var _this = this;

      var currentNesting = this.props.path.size;
      var maxNesting = this.props.config.settings.maxNesting;

      // Don't allow nesting further than the maximum configured depth and don't
      // allow removal of the root group.
      var allowFurtherNesting = typeof maxNesting === 'undefined' || currentNesting < maxNesting;
      var allowRemoval = currentNesting > 1;

      var conjunctionOptions = _lodashObjectMapValues2['default'](this.props.config.conjunctions, function (item, index) {
        return {
          id: 'conjunction-' + _this.props.id + '-' + index,
          name: 'conjunction[' + _this.props.id + ']',
          label: item.label,
          checked: index === _this.props.conjunction,
          setConjunction: function setConjunction() {
            return _this.setConjunction.call(_this, index);
          }
        };
      }, this);

      return _react2['default'].createElement(
        Group,
        {
          id: this.props.id,
          allowRemoval: allowRemoval,
          allowFurtherNesting: allowFurtherNesting,
          conjunctionOptions: conjunctionOptions,
          removeSelf: this.removeSelf.bind(this),
          addGroup: this.addGroup.bind(this),
          addRule: this.addRule.bind(this) },
        this.props.children
      );
    };

    _createClass(GroupContainer, null, [{
      key: 'propTypes',
      value: {
        config: _react.PropTypes.object.isRequired
      },
      enumerable: true
    }]);

    return GroupContainer;
  })(_react.Component);
};

module.exports = exports['default'];