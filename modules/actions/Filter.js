import React from 'react';
import Dispatcher from '../dispatcher/Dispatcher';
import FilterConstants from '../constants/Filter';
import Immutable from 'immutable';

export default {

  /**
   * @param {Immutable.List} path
   * @param {integer} delta
   * @param {*} value
   */
  setDeltaValue: function (path, delta, value) {
    Dispatcher.dispatch({
      actionType: FilterConstants.SET_DELTA_VALUE,
      path: path,
      delta: delta,
      value: value
    });
  }

};
