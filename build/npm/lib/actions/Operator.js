"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

var Dispatcher = _interopRequire(require("../dispatcher/Dispatcher"));

var OperatorConstants = _interopRequire(require("../constants/Operator"));

var Immutable = _interopRequire(require("immutable"));

module.exports = {

  /**
   * @param {Immutable.List} path
   * @param {string} name
   * @param {*} value
   */
  setOption: function setOption(path, name, value) {
    Dispatcher.dispatch({
      actionType: OperatorConstants.SET_OPTION,
      path: path,
      name: name,
      value: value
    });
  }

};