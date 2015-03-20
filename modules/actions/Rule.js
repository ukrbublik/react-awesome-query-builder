import React from 'react';
import Dispatcher from '../dispatcher/Dispatcher';
import RuleConstants from '../constants/Rule';
import Immutable from 'immutable';

export default {

  /**
   * @param {Immutable.List} path
   * @param {object} properties
   */
  addRule: function (path, properties) {
    Dispatcher.dispatch({
      actionType: RuleConstants.ADD_RULE,
      path: path,
      rule: properties
    });
  },

  /**
   * @param {Immutable.List} path
   */
  removeRule: function (path) {
    Dispatcher.dispatch({
      actionType: RuleConstants.REMOVE_RULE,
      path: path
    });
  },

  /**
   * @param {Immutable.List} path
   * @param {string} field
   */
  setField: function (path, field) {
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
  setOperator: function (path, operator) {
    Dispatcher.dispatch({
      actionType: RuleConstants.SET_OPERATOR,
      path: path,
      operator: operator
    });
  }

};
