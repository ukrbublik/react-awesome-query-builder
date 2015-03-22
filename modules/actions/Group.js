import Dispatcher from '../dispatcher/Dispatcher';
import GroupConstants from '../constants/Group';

export default {

  /**
   * @param {Immutable.List} path
   * @param {object} properties
   * @param {object} config
   */
  addGroup: function (path, properties, config) {
    Dispatcher.dispatch({
      actionType: GroupConstants.ADD_GROUP,
      path: path,
      group: properties
    });
  },

  /**
   * @param {Immutable.List} path
   */
  removeGroup: function (path) {
    Dispatcher.dispatch({
      actionType: GroupConstants.REMOVE_GROUP,
      path: path
    });
  },

  /**
   * @param {Immutable.List} path
   * @param {string} conjunction
   */
  setConjunction: function (path, conjunction) {
    Dispatcher.dispatch({
      actionType: GroupConstants.SET_CONJUNCTION,
      path: path,
      conjunction: conjunction
    });
  }

};
