'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _function = require('react-pure-render/function');

var _function2 = _interopRequireDefault(_function);

var _mapValues = require('lodash/mapValues');

var _mapValues2 = _interopRequireDefault(_mapValues);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var stringify = require('json-stringify-safe');

exports.default = function (Group) {
  var _class, _temp2;

  return _temp2 = _class = function (_Component) {
    _inherits(GroupContainer, _Component);

    function GroupContainer() {
      var _Object$getPrototypeO;

      var _temp, _this, _ret;

      _classCallCheck(this, GroupContainer);

      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(GroupContainer)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.shouldComponentUpdate = _function2.default, _temp), _possibleConstructorReturn(_this, _ret);
    }

    _createClass(GroupContainer, [{
      key: 'setConjunction',
      value: function setConjunction(conjunction) {
        this.props.actions.setConjunction(this.props.path, conjunction);
      }
    }, {
      key: 'removeSelf',
      value: function removeSelf() {
        this.props.actions.removeGroup(this.props.path);
      }
    }, {
      key: 'addGroup',
      value: function addGroup() {
        this.props.actions.addGroup(this.props.path);
      }
    }, {
      key: 'addRule',
      value: function addRule() {
        this.props.actions.addRule(this.props.path);
      }
    }, {
      key: 'render',
      value: function render() {
        var _this2 = this;

        var currentNesting = this.props.path.size;
        var maxNesting = this.props.config.settings.maxNesting;

        // Don't allow nesting further than the maximum configured depth and don't
        // allow removal of the root group.
        var allowFurtherNesting = typeof maxNesting === 'undefined' || currentNesting < maxNesting;
        var allowRemoval = currentNesting > 1;

        var conjunctionOptions = (0, _mapValues2.default)(this.props.config.conjunctions, function (item, index) {
          return {
            id: 'conjunction-' + _this2.props.id + '-' + index,
            name: 'conjunction[' + _this2.props.id + ']',
            label: item.label,
            checked: index === _this2.props.conjunction,
            setConjunction: function setConjunction() {
              return _this2.setConjunction.call(_this2, index);
            }
          };
        });

        return _react2.default.createElement(
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
      }
    }]);

    return GroupContainer;
  }(_react.Component), _class.propTypes = {
    config: _react.PropTypes.object.isRequired
  }, _temp2;
};