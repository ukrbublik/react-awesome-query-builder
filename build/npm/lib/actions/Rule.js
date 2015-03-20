"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

var Dispatcher = _interopRequire(require("../dispatcher/Dispatcher"));

var RuleConstants = _interopRequire(require("../constants/Rule"));

var Immutable = _interopRequire(require("immutable"));

module.exports = {

  /**
   * @param {Immutable.List} path
   * @param {object} properties
   * @param {object} config
   */
  addRule: function addRule(path, properties, config) {
    Dispatcher.dispatch({
      actionType: RuleConstants.ADD_RULE,
      path: path,
      rule: properties
    });
  },

  /**
   * @param {Immutable.List} path
   */
  removeRule: function removeRule(path) {
    Dispatcher.dispatch({
      actionType: RuleConstants.REMOVE_RULE,
      path: path
    });
  },

  /**
   * @param {Immutable.List} path
   * @param {string} field
   */
  setField: function setField(path, field) {
    Dispatcher.dispatch({
      actionType: RuleConstants.SET_FIELD,
      path: path,
      field: field
    });
  },

  /**
   * @param {Immutable.List} path
   * @param {string} operator
   */
  setOperator: function setOperator(path, operator) {
    Dispatcher.dispatch({
      actionType: RuleConstants.SET_OPERATOR,
      path: path,
      operator: operator
    });
  },

  /**
   * @param {Immutable.List} path
   * @param {integer} delta
   * @param {*} value
   */
  setDeltaValue: function setDeltaValue(path, delta, value) {
    Dispatcher.dispatch({
      actionType: RuleConstants.SET_DELTA_VALUE,
      path: path,
      delta: delta,
      value: value
    });
  },

  /**
   * @param {Immutable.List} path
   * @param {string} name
   * @param {*} value
   */
  setOption: function setOption(path, name, value) {
    Dispatcher.dispatch({
      actionType: RuleConstants.SET_OPTION,
      path: path,
      name: name,
      value: value
    });
  }

};