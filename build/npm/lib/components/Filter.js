"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = _interopRequire(require("react"));

var Immutable = _interopRequire(require("immutable"));

var assign = _interopRequire(require("react/lib/Object.assign"));

var FilterActions = _interopRequire(require("../actions/Filter"));

var OperatorActions = _interopRequire(require("../actions/Operator"));

var Filter = (function (_React$Component) {
  function Filter() {
    _classCallCheck(this, Filter);

    if (_React$Component != null) {
      _React$Component.apply(this, arguments);
    }
  }

  _inherits(Filter, _React$Component);

  _createClass(Filter, {
    render: {
      value: function render() {
        var _this = this;

        var widgets = [];
        var path = this.props.path;
        var cardinality = this.props.operator.cardinality || 1;

        for (var delta = 0; delta < cardinality; delta++) {
          (function (delta) {
            widgets.push(React.createElement(_this.props.widget.component, {
              key: delta,
              definition: _this.props.widget,
              field: _this.props.field,
              delta: delta,
              value: _this.props.value[delta],
              setValue: function (value) {
                return FilterActions.setDeltaValue(path, delta, value);
              }
            }));
          })(delta);
        }

        return React.createElement(this.props.operator.component, {
          children: widgets,
          definition: this.props.operator,
          field: this.props.field,
          value: this.props.value,
          options: this.props.options,
          setOption: function (name, value) {
            return OperatorActions.setOption(path, name, value);
          }
        });
      }
    }
  });

  return Filter;
})(React.Component);

Filter.propTypes = {
  path: React.PropTypes.instanceOf(Immutable.List).isRequired,
  field: React.PropTypes.object.isRequired,
  operator: React.PropTypes.object.isRequired,
  widget: React.PropTypes.object.isRequired,
  value: React.PropTypes.any
};

module.exports = Filter;