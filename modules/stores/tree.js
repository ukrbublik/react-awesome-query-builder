import Immutable from 'immutable';
import expandTreePath from '../utils/expandTreePath';
import defaultRoot from '../utils/defaultRoot';
import {defaultOperator, defaultOperatorOptions} from '../utils/defaultRuleProperties';
import {getFirstOperator} from '../utils/configUtils';
import * as constants from '../constants';
import uuid from '../utils/uuid';
import defaultRuleProperties from '../utils/defaultRuleProperties';
import defaultGroupProperties from '../utils/defaultGroupProperties';
import {defaultValue, getFieldConfig, getOperatorConfig, getFieldWidgetConfig} from "../utils/index";
import {getOperatorsForField, getWidgetForFieldOp} from "../utils/configUtils";

var stringify = require('json-stringify-safe');

const hasChildren = (tree, path) =>
tree.getIn(expandTreePath(path, 'children1')).size > 0;

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {object} properties
 */
const addNewGroup = (state, path, properties, config) => {
    console.log("Adding group");
    const groupUuid = uuid();
    state = addItem(state, path, 'group', groupUuid, defaultGroupProperties(config).merge(properties || {}));

    const groupPath = path.push(groupUuid);
    // If we don't set the empty map, then the following merge of addItem will create a Map rather than an OrderedMap for some reason
    state = state.setIn(expandTreePath(groupPath, 'children1'), new Immutable.OrderedMap());
    state = addItem(state, groupPath, 'rule', uuid(), defaultRuleProperties(config).merge(properties || {}));
    return state;
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {object} properties
 */
const removeGroup = (state, path, config) => {
    state = removeItem(state, path);

    const parentPath = path.slice(0, -1);
    let isEmptyGroup = !hasChildren(state, parentPath);
    let isEmptyRoot = isEmptyGroup && parentPath.size == 1;
    let canLeaveEmpty = isEmptyGroup && config.settings.canLeaveEmptyGroup && !isEmptyRoot;
    if (isEmptyGroup && !canLeaveEmpty) {
        state = addItem(state, parentPath, 'rule', uuid(), defaultRuleProperties(config));
    }
    return state;
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 */
const removeRule = (state, path, config) => {
    state = removeItem(state, path);

    const parentPath = path.slice(0, -1);
    let isEmptyGroup = !hasChildren(state, parentPath);
    let isEmptyRoot = isEmptyGroup && parentPath.size == 1;
    let canLeaveEmpty = isEmptyGroup && config.settings.canLeaveEmptyGroup && !isEmptyRoot;
    if (isEmptyGroup && !canLeaveEmpty) {
        state = addItem(state, parentPath, 'rule', uuid(), defaultRuleProperties(config));
    }
    return state;
};

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
 * @param {string} type
 * @param {string} id
 * @param {Immutable.OrderedMap} properties
 */
const addItem = (state, path, type, id, properties) =>
    state.mergeIn(expandTreePath(path, 'children1'), new Immutable.OrderedMap({
        [id]: new Immutable.Map({type, id, properties})
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
const setField = (state, path, field, config) => {
    return state.updateIn(expandTreePath(path, 'properties'), (map) => map.withMutations((current) => {
        const currentField = current.get('field');
        const currentOperator = current.get('operator');
        const currentValue = current.get('value');

        const currentFieldConfig = getFieldConfig(currentField, config);
        const currentWidgetConfig = getFieldWidgetConfig(config, currentField, currentOperator);
        const currentOperatorConfig = getOperatorConfig(config, currentOperator, currentField);
        const fieldConfig = getFieldConfig(field, config);

        // If the newly selected field supports the same operator the rule currently
        // uses, keep it selected.
        const lastOp = fieldConfig.operators.indexOf(currentOperator) !== -1 ? currentOperator : null;
        let operator = null;
        const availOps = getOperatorsForField(config, field);
        if (availOps.length == 1)
            operator = availOps[0];
        else if (availOps.length > 1) {
            for (let strategy of config.settings.setOpOnChangeField || []) {
                if (strategy == 'keep')
                    operator = lastOp;
                else if (strategy == 'default')
                    operator = defaultOperator(config, field, false);
                else if (strategy == 'first')
                    operator = getFirstOperator(config, field);
            }
        }
        const operatorConfig = getOperatorConfig(config, operator, field);
        const widgetConfig = getFieldWidgetConfig(config, field, operator);
        const operatorCardinality = operator ? defaultValue(operatorConfig.cardinality, 1) : null;

        return current.set('field', field)
            .set('operator', operator)
            .set('operatorOptions', defaultOperatorOptions(config, operator, field))
            .set('value', ((currentWidget, nextWidget) => {
                return (currentWidget !== nextWidget || config.settings.clearValueOnChangeField) ?
                    new Immutable.List() :
                    new Immutable.List(currentValue.take(operatorCardinality));
            })(currentWidgetConfig, widgetConfig));
    }))
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} operator
 */
const setOperator = (state, path, operator, config) => {
    return state.updateIn(expandTreePath(path, 'properties'), (map) => map.withMutations((current) => {
        const currentValue = current.get('value', new Immutable.List());
        const currentField = current.get('field');
        const operatorConfig = getOperatorConfig(config, operator, currentField);
        const operatorCardinality = defaultValue(operatorConfig.cardinality, 1);
        const nextValue = new Immutable.List(currentValue.take(operatorCardinality));

        return current.set('operator', operator)
            .set('operatorOptions', defaultOperatorOptions(config, operator, currentField))
            .set('value', nextValue);
    }));
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {integer} delta
 * @param {*} value
 */
const setValue = (state, path, delta, value) => {
    if (typeof value === "undefined") {
        return state.deleteIn(expandTreePath(path, 'properties', 'value', delta + ''));
    } else {
        return state.setIn(expandTreePath(path, 'properties', 'value', delta + ''), value);
    }
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} name
 * @param {*} value
 */
const setOperatorOption = (state, path, name, value) => {
    return state.setIn(expandTreePath(path, 'properties', 'operatorOptions', name), value);
};

/**
 * @param {Immutable.Map} state
 * @param {object} action
 */
export default (config) => {
    return (state = defaultRoot(config), action) => {
        switch (action.type) {
            case constants.SET_TREE:
                return action.tree;

            case constants.ADD_NEW_GROUP:
                return addNewGroup(state, action.path, action.properties, action.config);

            case constants.ADD_GROUP:
                return addItem(state, action.path, 'group', action.id, action.properties);

            case constants.REMOVE_GROUP:
                return removeGroup(state, action.path, action.config);

            case constants.ADD_RULE:
                return addItem(state, action.path, 'rule', action.id, action.properties);

            case constants.REMOVE_RULE:
                return removeRule(state, action.path, action.config);

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

            default:
                return state;
        }
    };
};
