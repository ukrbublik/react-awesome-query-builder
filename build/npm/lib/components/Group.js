'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _class2, _temp2;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _function = require('react-pure-render/function');

var _function2 = _interopRequireDefault(_function);

var _map = require('lodash/collection/map');

var _map2 = _interopRequireDefault(_map);

var _GroupContainer = require('./containers/GroupContainer');

var _GroupContainer2 = _interopRequireDefault(_GroupContainer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Group = (0, _GroupContainer2.default)(_class = (_temp2 = _class2 = function (_Component) {
  _inherits(Group, _Component);

  function Group() {
    var _Object$getPrototypeO;

    var _temp, _this, _ret;

    _classCallCheck(this, Group);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = _possibleConstructorReturn(this, (_Object$getPrototypeO = Object.getPrototypeOf(Group)).call.apply(_Object$getPrototypeO, [this].concat(args))), _this), _this.shouldComponentUpdate = _function2.default, _temp), _possibleConstructorReturn(_this, _ret);
  }

  _createClass(Group, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'group' },
        _react2.default.createElement(
          'div',
          { className: 'group--header' },
          _react2.default.createElement(
            'div',
            { className: 'group--conjunctions' },
            (0, _map2.default)(this.props.conjunctionOptions, function (item, index) {
              return _react2.default.createElement(
                'div',
                { key: index, className: 'conjunction conjunction--' + index.toUpperCase(), 'data-state': item.checked ? 'active' : 'inactive' },
                _react2.default.createElement(
                  'label',
                  { htmlFor: item.id },
                  item.label
                ),
                _react2.default.createElement('input', { id: item.id, type: 'radio', name: item.name, value: index, checked: item.checked, onChange: item.setConjunction })
              );
            })
          ),
          _react2.default.createElement(
            'div',
            { className: 'group--actions' },
            this.props.allowFurtherNesting ? _react2.default.createElement(
              'button',
              { className: 'action action--ADD-GROUP', onClick: this.props.addGroup },
              'Add group'
            ) : null,
            _react2.default.createElement(
              'button',
              { className: 'action action--ADD-RULE', onClick: this.props.addRule },
              'Add rule'
            ),
            this.props.allowRemoval ? _react2.default.createElement(
              'button',
              { className: 'action action--DELETE', onClick: this.props.removeSelf },
              'Delete'
            ) : null
          )
        ),
        this.props.children ? _react2.default.createElement(
          'div',
          { className: 'group--children' },
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
  allowRemoval: _react.PropTypes.bool.isRequired
}, _temp2)) || _class;

exports.default = Group;