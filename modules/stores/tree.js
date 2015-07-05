import Immutable from 'immutable';
import expandTreePath from '../utils/expandTreePath';
import defaultRoot from '../utils/defaultRoot';
import defaultGroupProperties from '../utils/defaultGroupProperties';
import { defaultOperator, defaultOperatorOptions, defaultValueOptions } from '../utils/defaultRuleProperties';
import * as constants from '../constants';

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
const setField = (state, path, field, config) =>
  state.updateIn(expandTreePath(path, 'properties'), (map) => map.withMutations((current) => {
    const currentField = current.get('field');
    const currentOperator = current.get('operator');
    const currentValue = current.get('value');

    // If the newly selected field supports the same operator the rule currently
    // uses, keep it selected.
    const operator = config.fields[field].operators.indexOf(currentOperator) !== -1 ?
      currentOperator : defaultOperator(config, field);

    const operatorCardinality = config.operators[operator].cardinality || 1;

    return current.set('field', field)
      .set('operator', operator)
      .set('operatorOptions', defaultOperatorOptions(config, operator))
      .set('valueOptions', defaultValueOptions(config, operator))
      .set('value', (currentWidget, nextWidget) => {
        return (currentWidget !== nextWidget) ?
          new Immutable.List() :
          new Immutable.List(currentValue.take(operatorCardinality));
      }(config.fields[currentField].widget, config.fields[field].widget));
  }));

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} operator
 */
const setOperator = (state, path, operator, config) =>
  state.updateIn(expandTreePath(path, 'properties'), (map) => map.withMutations((current) => {
    const operatorCardinality = config.operators[operator].cardinality || 1;
    const currentValue = current.get('value', new Immutable.List());
    const nextValue = new Immutable.List(currentValue.take(operatorCardinality));

    return current.set('operator', operator)
      .set('operatorOptions', defaultOperatorOptions(config, operator))
      .set('valueOptions', defaultValueOptions(config, operator))
      .set('value', nextValue);
  }));

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
          id: action.id,
          properties: defaultGroupProperties(action.config).merge(action.properties || {})
        }));

      case constants.REMOVE_GROUP:
        return removeItem(state, action.path);

      case constants.ADD_RULE:
        return addItem(state, action.path, new Immutable.Map({
          type: 'rule',
          id: action.id,
          properties: action.properties
        }));

      case constants.REMOVE_RULE:
        return removeItem(state, action.path);

      case constants.SET_CONJUNCTION:
        return setConjunction(state, action.path, action.conjunction);

      case constants.SET_FIELD:
        return setField(state, action.path, action.field, action.config);

      case constants.SET_OPERATOR:
        return setOperator(state, action.path, action.operator, action.config);

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
