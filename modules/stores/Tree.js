import { EventEmitter } from 'events';
import Immutable from 'immutable';
import Dispatcher from '../dispatcher/Dispatcher';
import GroupConstants from '../constants/Group';
import RuleConstants from '../constants/Rule';
import TreeConstants from '../constants/Tree';
import defaultRoot from '../utils/defaultRoot';
import uuid from '../utils/uuid';

let rules = defaultRoot();

/**
 * @param {string} id
 * @param {Immutable.List} path
 */
const findItemInTree = function(id, path) {
  path = path || new Immutable.List;
  if (rules.getIn(path.push('id')) == id) {
    return path;
  }

  if (rules.hasIn(path, 'children')) {
    path = path.push('children');
    let children = rules.getIn(path);

    if (children && children.size) {
      let result = undefined;
      children.forEach(function (item, key) {
        result = findItemInTree(id, path.push(key));
        return typeof result === 'undefined';
      }, this);

      return result;
    }
  }

  return undefined;
};

/**
 * @param {Immutable.List} path
 * @param {...string} suffix
 */
const expandTreePath = function (path, suffix) {
  return path.interpose('children').withMutations(list => {
    list.skip(1);
    list.push.apply(list, Array.prototype.slice.call(arguments, 1));
    return list;
  });
};

/**
 * @param {Immutable.Map} tree
 */
const setTree = function (tree) {
  rules = tree;
};

/**
 * @param {Immutable.List} path
 * @param {string} conjunction
 */
const setConjunction = function (path, conjunction) {
  const expandedPath = expandTreePath(path, 'properties', 'conjunction');
  rules = rules.setIn(expandedPath, conjunction);
};

/**
 * @param {Immutable.List} path
 * @param {Immutable.Map} item
 */
const addItem = function (path, item) {
  const expandedPath = expandTreePath(path, 'children');
  rules = rules.mergeIn(expandedPath, new Immutable.OrderedMap({
    [item.get('id')]: item
  }));
};

/**
 * @param {Immutable.List} path
 */
const removeItem = function (path) {
  rules = rules.deleteIn(expandTreePath(path));
};

/**
 * @param {Immutable.List} path
 * @param {string} field
 */
const setField = function (path, field) {
  rules = rules.withMutations(map => {
    const expandedPath = expandTreePath(path, 'properties');
    return map.deleteIn(expandedPath.push('operator'))
      .setIn(expandedPath.push('field'), field)
      .setIn(expandedPath.push('options'), Immutable.Map())
      .setIn(expandedPath.push('value'), Immutable.List());
  });
};

/**
 * @param {Immutable.List} path
 * @param {string} operator
 */
const setOperator = function (path, operator) {
  rules = rules.withMutations(map => {
    const expandedPath = expandTreePath(path, 'properties');
    return map.setIn(expandedPath.push('operator'), operator);
  });
};

/**
 * @param {Immutable.List} path
 * @param {integer} delta
 * @param {*} value
 */
const setFilterDeltaValue = function (path, delta, value) {
  const expandedPath = expandTreePath(path, 'properties', 'value', delta + '');
  rules = rules.setIn(expandedPath, value);
};

/**
 * @param {Immutable.List} path
 * @param {string} name
 * @param {*} value
 */
const setOperatorOption = function (path, name, value) {
  const expandedPath = expandTreePath(path, 'properties', 'options', name);
  rules = rules.setIn(expandedPath, value);
};

const TreeStore = Object.assign({}, EventEmitter.prototype, {
  getTree: function () {
    return rules;
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function (callback) {
    this.on('change', callback);
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: function (callback) {
    this.removeListener('change', callback);
  }
});

Dispatcher.register(function(action) {
  switch(action.actionType) {
    case TreeConstants.SET_TREE:
      setTree(action.tree);
      TreeStore.emit('change');
      break;

    case GroupConstants.SET_CONJUNCTION:
      setConjunction(action.path, action.conjunction);
      TreeStore.emit('change');
      break;

    case GroupConstants.ADD_GROUP:
      addItem(action.path, Immutable.Map({
        type: 'group',
        id: uuid(),
        properties: Immutable.Map(action.group)
      }));

      TreeStore.emit('change');
      break;

    case GroupConstants.REMOVE_GROUP:
      removeItem(action.path);
      TreeStore.emit('change');
      break;

    case RuleConstants.ADD_RULE:
      addItem(action.path, Immutable.Map({
        type: 'rule',
        id: uuid(),
        properties: Immutable.Map(action.rule)
      }));

      TreeStore.emit('change');
      break;

    case RuleConstants.REMOVE_RULE:
      removeItem(action.path);
      TreeStore.emit('change');
      break;

    case RuleConstants.SET_FIELD:
      setField(action.path, action.field);
      TreeStore.emit('change');
      break;

    case RuleConstants.SET_OPERATOR:
      setOperator(action.path, action.operator);
      TreeStore.emit('change');
      break;

    case RuleConstants.SET_DELTA_VALUE:
      setFilterDeltaValue(action.path, action.delta, action.value);
      TreeStore.emit('change');
      break;

    case RuleConstants.SET_OPTION:
      setOperatorOption(action.path, action.name, action.value);
      TreeStore.emit('change');
      break;
  }
});

export default TreeStore;
