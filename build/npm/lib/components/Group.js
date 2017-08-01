'use strict';

exports.__esModule = true;
exports.default = undefined;

var _css = require('antd/lib/radio/style/css');

var _radio = require('antd/lib/radio');

var _radio2 = _interopRequireDefault(_radio);

var _css2 = require('antd/lib/button/style/css');

var _button = require('antd/lib/button');

var _button2 = _interopRequireDefault(_button);

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _class2, _temp2;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAddonsShallowCompare = require('react-addons-shallow-compare');

var _reactAddonsShallowCompare2 = _interopRequireDefault(_reactAddonsShallowCompare);

var _map = require('lodash/map');

var _map2 = _interopRequireDefault(_map);

var _GroupContainer = require('./containers/GroupContainer');

var _GroupContainer2 = _interopRequireDefault(_GroupContainer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ButtonGroup = _button2.default.Group;
var RadioButton = _radio2.default.Button;
var RadioGroup = _radio2.default.Group;
var classNames = require('classnames');

var Group = (0, _GroupContainer2.default)(_class = (_temp2 = _class2 = function (_Component) {
  _inherits(Group, _Component);

  function Group() {
    var _ref;

    var _temp, _this, _ret;

    _classCallCheck(this, Group);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_ref = Group.__proto__ || Object.getPrototypeOf(Group)).call.apply(_ref, [this].concat(args))), _this), _this.shouldComponentUpdate = _reactAddonsShallowCompare2.default, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Group, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var renderConjsAsRadios = false;
      return _react2.default.createElement(
        'div',
        { className: 'group' },
        _react2.default.createElement(
          'div',
          { className: 'group--header' },
          _react2.default.createElement(
            'div',
            { className: classNames("group--conjunctions", this.props.children.size < 2 && this.props.config.settings.hideConjForOne ? 'hide--conj' : '') },
            this.props.config.settings.renderConjsAsRadios ? _react2.default.createElement(
              RadioGroup,
              {
                disabled: this.props.children.size < 2,
                value: this.props.selectedConjunction,
                size: this.props.config.settings.renderSize || "small",
                onChange: this.props.setConjunction
              },
              (0, _map2.default)(this.props.conjunctionOptions, function (item, index) {
                return _react2.default.createElement(
                  RadioButton,
                  {
                    value: item.key
                    //checked={item.checked}
                  },
                  item.label
                );
              })
            ) : _react2.default.createElement(
              ButtonGroup,
              {
                size: this.props.config.settings.renderSize || "small",
                disabled: this.props.children.size < 2
              },
              (0, _map2.default)(this.props.conjunctionOptions, function (item, index) {
                return _react2.default.createElement(
                  _button2.default,
                  {
                    disabled: _this2.props.children.size < 2,
                    key: item.id,
                    type: item.checked ? "primary" : null,
                    onClick: function onClick(ev) {
                      return _this2.props.setConjunction(ev, item.key);
                    }
                  },
                  item.label
                );
              })
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'group--actions' },
            _react2.default.createElement(
              ButtonGroup,
              {
                size: this.props.config.settings.renderSize || "small"
              },
              _react2.default.createElement(
                _button2.default,
                {
                  icon: 'plus',
                  className: 'action action--ADD-RULE',
                  onClick: this.props.addRule
                },
                this.props.config.settings.addRuleLabel || "Add rule"
              ),
              this.props.allowFurtherNesting ? _react2.default.createElement(
                _button2.default,
                {
                  className: 'action action--ADD-GROUP',
                  icon: 'plus-circle-o',
                  onClick: this.props.addGroup
                },
                this.props.config.settings.addGroupLabel || "Add group"
              ) : null,
              this.props.allowRemoval ? _react2.default.createElement(
                _button2.default,
                {
                  type: 'danger',
                  icon: 'delete',
                  className: 'action action--ADD-DELETE',
                  onClick: this.props.removeSelf
                },
                this.props.config.settings.delGroupLabel !== undefined ? this.props.config.settings.delGroupLabel : "Delete"
              ) : null
            )
          )
        ),
        this.props.children ? _react2.default.createElement(
          'div',
          { className: classNames("group--children", this.props.children.size < 2 && this.props.config.settings.hideConjForOne ? 'hide--line' : '') },
          this.props.children
        ) : null
      );
    }
  }]);

  return Group;
}(_react.Component), _class2.propTypes = {
  conjunctionOptions: _react.PropTypes.object.isRequired,
  addRule: _react.PropTypes.func.isRequired,
  addGroup: _react.PropTypes.func.isRequired,
  removeSelf: _react.PropTypes.func.isRequired,
  allowFurtherNesting: _react.PropTypes.bool.isRequired,
  allowRemoval: _react.PropTypes.bool.isRequired,
  selectedConjunction: _react.PropTypes.string,
  setConjunction: _react.PropTypes.func.isRequired,
  config: _react.PropTypes.object.isRequired
}, _temp2)) || _class;

exports.default = Group;