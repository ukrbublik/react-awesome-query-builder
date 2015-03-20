"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

var Dispatcher = _interopRequire(require("../dispatcher/Dispatcher"));

var FilterConstants = _interopRequire(require("../constants/Filter"));

var Immutable = _interopRequire(require("immutable"));

module.exports = {

  /**
   * @param {Immutable.List} path
   * @param {integer} delta
   * @param {*} value
   */
  setDeltaValue: function setDeltaValue(path, delta, value) {
    Dispatcher.dispatch({
      actionType: FilterConstants.SET_DELTA_VALUE,
      path: path,
      delta: delta,
      value: value
    });
  }

};