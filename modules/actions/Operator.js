import React from 'react';
import Dispatcher from '../dispatcher/Dispatcher';
import OperatorConstants from '../constants/Operator';
import Immutable from 'immutable';

export default {

  /**
   * @param {Immutable.List} path
   * @param {string} name
   * @param {*} value
   */
  setOption: function (path, name, value) {
    Dispatcher.dispatch({
      actionType: OperatorConstants.SET_OPTION,
      path: path,
      name: name,
      value: value
    });
  }

};
