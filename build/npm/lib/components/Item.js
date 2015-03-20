"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var React = _interopRequire(require("react"));

var Immutable = _interopRequire(require("immutable"));

var Rule = _interopRequire(require("./Rule"));

var Group = _interopRequire(require("./Group"));

var assign = _interopRequire(require("react/lib/Object.assign"));

var types = {
  group: Group,
  rule: Rule
};

var Item = (function (_React$Component) {
  function Item(props) {
    _classCallCheck(this, Item);

    _get(Object.getPrototypeOf(Item.prototype), "constructor", this).call(this, props);

    this.state = {
      path: props.ancestors.push(props.id)
    };
  }

  _inherits(Item, _React$Component);

  _createClass(Item, {
    componentWillReceiveProps: {
      value: function componentWillReceiveProps(nextProps) {
        if (!Immutable.is(this.props.ancestors, nextProps.ancestors)) {
          this.setState({
            path: this.props.ancestors.push(this.props.id)
          });
        }
      }
    },
    render: {
      value: function render() {
        var children = this.props.children ? this.props.children.map(function (item) {
          var props = {
            config: this.props.config,
            ancestors: this.state.path,
            id: item.get("id"),
            children: item.get("children"),
            type: item.get("type"),
            properties: item.get("properties")
          };

          return React.createElement(Item, _extends({ key: props.id }, props));
        }, this).toList() : null;

        var component = types[this.props.type];
        var props = assign({}, this.props.properties.toObject(), {
          config: this.props.config,
          id: this.props.id,
          path: this.state.path,
          children: children
        });

        return React.createElement(component, props);
      }
    }
  });

  return Item;
})(React.Component);

Item.propTypes = {
  config: React.PropTypes.object.isRequired,
  id: React.PropTypes.string.isRequired,
  type: React.PropTypes.string.isRequired,
  ancestors: React.PropTypes.instanceOf(Immutable.List).isRequired,
  properties: React.PropTypes.instanceOf(Immutable.Map).isRequired,
  children: React.PropTypes.instanceOf(Immutable.OrderedMap)
};

module.exports = Item;