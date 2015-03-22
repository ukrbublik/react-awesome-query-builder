import Dispatcher from '../dispatcher/Dispatcher';
import RuleConstants from '../constants/Rule';

export default {

  /**
   * @param {Immutable.List} path
   * @param {object} properties
   * @param {object} config
   */
  addRule: function (path, properties, config) {
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
  },

  /**
   * @param {Immutable.List} path
   * @param {integer} delta
   * @param {*} value
   */
  setDeltaValue: function (path, delta, value) {
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
  setOption: function (path, name, value) {
    Dispatcher.dispatch({
      actionType: RuleConstants.SET_OPTION,
      path: path,
      name: name,
      value: value
    });
  }

};
