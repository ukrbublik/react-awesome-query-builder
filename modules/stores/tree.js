import Immutable from 'immutable';
import defaultRoot from '../utils/defaultRoot';
import uuid from '../utils/uuid';
import * as constants from '../constants';

/**
 * @param {Immutable.List} path
 * @param {...string} suffix
 */
const expandTreePath = (path, ...suffix) =>
  path.interpose('children').withMutations(list => {
    list.skip(1);
    list.push.apply(list, suffix);
    return list;
  });

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} conjunction
 */
const setConjunction = (state, path, conjunction) =>
  state.setIn(expandTreePath(path, 'properties', 'conjunction'), conjunction);

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {Immutable.Map} item
 */
const addItem = (state, path, item) =>
  state.mergeIn(expandTreePath(path, 'children'), new Immutable.OrderedMap({
    [item.get('id')]: item
  }));

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 */
const removeItem = (state, path) =>
  state.deleteIn(expandTreePath(path));

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} field
 */
const setField = (state, path, field) =>
  state.withMutations(map => {
    const expandedPath = expandTreePath(path, 'properties');
    return map.deleteIn(expandedPath.push('operator'))
      .setIn(expandedPath.push('field'), field)
      .setIn(expandedPath.push('options'), new Immutable.Map())
      .setIn(expandedPath.push('value'), new Immutable.List());
  });

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} operator
 */
const setOperator = (state, path, operator) =>
  state.withMutations(map => map.setIn(expandTreePath(path, 'properties').push('operator'), operator));

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {integer} delta
 * @param {*} value
 */
const setValue = (state, path, delta, value) =>
  state.setIn(expandTreePath(path, 'properties', 'value', delta + ''), value);

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} name
 * @param {*} value
 */
const setOperatorOption = (state, path, name, value) =>
  state.setIn(expandTreePath(path, 'properties', 'operatorOptions', name), value);

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} name
 * @param {*} value
 */
const setValueOption = (state, path, delta, name, value) =>
  state.setIn(expandTreePath(path, 'properties', 'valueOptions', delta + '', name), value);

/**
 * @param {Immutable.Map} state
 * @param {object} action
 */
export default (config) => {
  return (state = defaultRoot(config), action) => {
    switch (action.type) {
      case constants.SET_TREE:
        return action.tree;

      case constants.ADD_GROUP:
        return addItem(state, action.path, new Immutable.Map({
          type: 'group',
          id: uuid(),
          properties: new Immutable.Map(action.group)
        }));

      case constants.REMOVE_GROUP:
        return removeItem(state, action.path);

      case constants.ADD_RULE:
        return addItem(state, action.path, new Immutable.Map({
          type: 'rule',
          id: uuid(),
          properties: new Immutable.Map(action.rule)
        }));

      case constants.REMOVE_RULE:
        return removeItem(state, action.path);

      case constants.SET_CONJUNCTION:
        return setConjunction(state, action.path, action.conjunction);

      case constants.SET_FIELD:
        return setField(state, action.path, action.field);

      case constants.SET_OPERATOR:
        return setOperator(state, action.path, action.operator);

      case constants.SET_VALUE:
        return setValue(state, action.path, action.delta, action.value);

      case constants.SET_OPERATOR_OPTION:
        return setOperatorOption(state, action.path, action.name, action.value);

      case constants.SET_VALUE_OPTION:
        return setValueOption(state, action.path, action.delta, action.name, action.value);

      default:
        return state;
    }
  };
};
