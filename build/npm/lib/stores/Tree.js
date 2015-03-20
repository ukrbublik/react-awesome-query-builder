"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _defineProperty = function (obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); };

var EventEmitter = require("events").EventEmitter;

var Immutable = _interopRequire(require("immutable"));

var Dispatcher = _interopRequire(require("../dispatcher/Dispatcher"));

var GroupConstants = _interopRequire(require("../constants/Group"));

var RuleConstants = _interopRequire(require("../constants/Rule"));

var assign = _interopRequire(require("react/lib/Object.assign"));

var uuid = function uuid() {
  // Generate a random GUID http://stackoverflow.com/a/2117523.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
        v = c == "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
};

var rules = Immutable.Map({
  type: "group",
  id: uuid(),
  children: new Immutable.OrderedMap(),
  properties: Immutable.Map({
    conjunction: "and"
  })
});

/**
 * @param {string} id
 * @param {Immutable.List} path
 */
var findItemInTree = (function (_findItemInTree) {
  var _findItemInTreeWrapper = function findItemInTree(_x, _x2) {
    return _findItemInTree.apply(this, arguments);
  };

  _findItemInTreeWrapper.toString = function () {
    return _findItemInTree.toString();
  };

  return _findItemInTreeWrapper;
})(function (id, path) {
  var _this = this;

  path = path || new Immutable.List();
  if (rules.getIn(path.push("id")) == id) {
    return path;
  }

  if (rules.hasIn(path, "children")) {
    path = path.push("children");
    var children = rules.getIn(path);

    if (children && children.size) {
      var _ret = (function () {
        var result = undefined;
        children.forEach(function (item, key) {
          result = findItemInTree(id, path.push(key));
          return typeof result === "undefined";
        }, _this);

        return {
          v: result
        };
      })();

      if (typeof _ret === "object") return _ret.v;
    }
  }

  return undefined;
});

/**
 * @param {Immutable.List} path
 * @param {...string} suffix
 */
var expandTreePath = function expandTreePath(path, suffix) {
  var _arguments = arguments;

  return path.interpose("children").withMutations(function (list) {
    list.skip(1);
    list.push.apply(list, Array.prototype.slice.call(_arguments, 1));
    return list;
  });
};

/**
 * @param {Immutable.List} path
 * @param {string} conjunction
 */
var setConjunction = function setConjunction(path, conjunction) {
  rules = rules.setIn(expandTreePath(path, "properties", "conjunction"), conjunction);
};

/**
 * @param {Immutable.List} path
 * @param {Immutable.Map} item
 */
var addItem = function addItem(path, item) {
  rules = rules.mergeIn(expandTreePath(path, "children"), new Immutable.OrderedMap(_defineProperty({}, item.get("id"), item)));
};

/**
 * @param {Immutable.List} path
 */
var removeItem = function removeItem(path) {
  rules = rules.deleteIn(expandTreePath(path));
};

/**
 * @param {Immutable.List} path
 * @param {string} field
 */
var setField = function setField(path, field) {
  rules = rules.deleteIn(expandTreePath(path, "properties", "operator")).setIn(expandTreePath(path, "properties", "field"), field).setIn(expandTreePath(path, "properties", "options"), new Immutable.Map()).setIn(expandTreePath(path, "properties", "value"), new Immutable.List());
};

/**
 * @param {Immutable.List} path
 * @param {string} operator
 */
var setOperator = function setOperator(path, operator) {
  rules = rules.setIn(expandTreePath(path, "properties", "operator"), operator).setIn(expandTreePath(path, "properties", "options"), new Immutable.Map()).setIn(expandTreePath(path, "properties", "value"), new Immutable.List());
};

/**
 * @param {Immutable.List} path
 * @param {integer} delta
 * @param {*} value
 */
var setFilterDeltaValue = function setFilterDeltaValue(path, delta, value) {
  rules = rules.setIn(expandTreePath(path, "properties", "value", delta + ""), value);
};

/**
 * @param {Immutable.List} path
 * @param {string} name
 * @param {*} value
 */
var setOperatorOption = function setOperatorOption(path, name, value) {
  rules = rules.setIn(expandTreePath(path, "properties", "options", name), value);
};

var TreeStore = assign({}, EventEmitter.prototype, {
  getTree: function getTree() {
    return rules;
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function addChangeListener(callback) {
    this.on("change", callback);
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: function removeChangeListener(callback) {
    this.removeListener("change", callback);
  }
});

Dispatcher.register(function (action) {
  switch (action.actionType) {
    case GroupConstants.SET_CONJUNCTION:
      setConjunction(action.path, action.conjunction);
      TreeStore.emit("change");
      break;

    case GroupConstants.ADD_GROUP:
      addItem(action.path, Immutable.Map({
        type: "group",
        id: uuid(),
        properties: Immutable.Map(action.group)
      }));

      TreeStore.emit("change");
      break;

    case GroupConstants.REMOVE_GROUP:
      removeItem(action.path);
      TreeStore.emit("change");
      break;

    case RuleConstants.ADD_RULE:
      addItem(action.path, Immutable.Map({
        type: "rule",
        id: uuid(),
        properties: Immutable.Map(action.rule)
      }));

      TreeStore.emit("change");
      break;

    case RuleConstants.REMOVE_RULE:
      removeItem(action.path);
      TreeStore.emit("change");
      break;

    case RuleConstants.SET_FIELD:
      setField(action.path, action.field);
      TreeStore.emit("change");
      break;

    case RuleConstants.SET_OPERATOR:
      setOperator(action.path, action.operator);
      TreeStore.emit("change");
      break;

    case RuleConstants.SET_DELTA_VALUE:
      setFilterDeltaValue(action.path, action.delta, action.value);
      TreeStore.emit("change");
      break;

    case RuleConstants.SET_OPTION:
      setOperatorOption(action.path, action.name, action.value);
      TreeStore.emit("change");
      break;
  }
});

module.exports = TreeStore;