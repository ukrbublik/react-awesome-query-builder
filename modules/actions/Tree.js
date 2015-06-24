import Dispatcher from '../dispatcher/Dispatcher';
import TreeConstants from '../constants/Tree';

export default {

  /**
   * @param {Immutable.Map} tree
   */
  setTree: function (tree) {
    Dispatcher.dispatch({
      actionType: TreeConstants.SET_TREE,
      tree: tree
    });
  }

};
