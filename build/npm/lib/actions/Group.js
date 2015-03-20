"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

var Dispatcher = _interopRequire(require("../dispatcher/Dispatcher"));

var GroupConstants = _interopRequire(require("../constants/Group"));

var Immutable = _interopRequire(require("immutable"));

module.exports = {

  /**
   * @param {Immutable.List} path
   * @param {object} properties
   * @param {object} config
   */
  addGroup: function addGroup(path, properties, config) {
    Dispatcher.dispatch({
      actionType: GroupConstants.ADD_GROUP,
      path: path,
      group: properties
    });
  },

  /**
   * @param {Immutable.List} path
   */
  removeGroup: function removeGroup(path) {
    Dispatcher.dispatch({
      actionType: GroupConstants.REMOVE_GROUP,
      path: path
    });
  },

  /**
   * @param {Immutable.List} path
   * @param {string} conjunction
   */
  setConjunction: function setConjunction(path, conjunction) {
    Dispatcher.dispatch({
      actionType: GroupConstants.SET_CONJUNCTION,
      path: path,
      conjunction: conjunction
    });
  }

};