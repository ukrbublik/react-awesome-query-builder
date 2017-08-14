import Immutable from 'immutable';
import {expandTreePath, expandTreeSubpath, getItemByPath} from '../utils/treeUtils';
import {defaultRuleProperties, defaultGroupProperties, defaultOperator, defaultOperatorOptions, defaultRoot} from '../utils/defaultUtils';
import {getFirstOperator} from '../utils/configUtils';
import * as constants from '../constants';
import uuid from '../utils/uuid';
import {getFieldConfig, getOperatorConfig, getFieldWidgetConfig, getValueSourcesForFieldOp} from "../utils/configUtils";
import {defaultValue, eqArrSet} from "../utils/stuff";
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
    //console.log("Adding group");
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
const addItem = (state, path, type, id, properties) => {
    return state.mergeIn(expandTreePath(path, 'children1'), new Immutable.OrderedMap({
        [id]: new Immutable.Map({type, id, properties})
    }))};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 */
const removeItem = (state, path) =>
    state.deleteIn(expandTreePath(path));

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} fromPath
 * @param {Immutable.List} toPath
 * @param {string} placement, see constants PLACEMENT_*: PLACEMENT_AFTER, PLACEMENT_BEFORE, PLACEMENT_APPEND, PLACEMENT_PREPEND
 * @param {object} config
 */
const moveItem = (state, fromPath, toPath, placement, config) => {
    let from = getItemByPath(state, fromPath);
    let sourcePath = fromPath.pop();
    let source = fromPath.size > 1 ? getItemByPath(state, sourcePath) : null;
    let sourceChildren = source ? source.get('children1') : null;

    let to = getItemByPath(state, toPath);
    let targetPath = (placement == constants.PLACEMENT_APPEND || placement == constants.PLACEMENT_PREPEND) ? toPath : toPath.pop();
    let target = (placement == constants.PLACEMENT_APPEND || placement == constants.PLACEMENT_PREPEND) ? 
        to
        : toPath.size > 1 ? getItemByPath(state, targetPath) : null;
    let targetChildren = target ? target.get('children1') : null;

    if (!source || !target)
        return state;

    let isSameParent = (source.get('id') == target.get('id'));
    let isSourceInsideTarget = targetPath.size < sourcePath.size 
        && JSON.stringify(targetPath.toArray()) == JSON.stringify(sourcePath.toArray().slice(0, targetPath.size));
    let isTargetInsideSource = targetPath.size > sourcePath.size 
        && JSON.stringify(sourcePath.toArray()) == JSON.stringify(targetPath.toArray().slice(0, sourcePath.size));
    let sourceSubpathFromTarget = null;
    let targetSubpathFromSource = null;
    if (isSourceInsideTarget) {
        sourceSubpathFromTarget = Immutable.List(sourcePath.toArray().slice(targetPath.size));
    } else if (isTargetInsideSource) {
        targetSubpathFromSource = Immutable.List(targetPath.toArray().slice(sourcePath.size));
    }

    let newTargetChildren = targetChildren, newSourceChildren = sourceChildren;
    if (!isTargetInsideSource)
        newSourceChildren = newSourceChildren.delete(from.get('id'));
    if (isSameParent) {
        newTargetChildren = newSourceChildren;
    } else if (isSourceInsideTarget) {
        newTargetChildren = newTargetChildren.updateIn(expandTreeSubpath(sourceSubpathFromTarget, 'children1'), (oldChildren) => newSourceChildren);
    }

    if (placement == constants.PLACEMENT_BEFORE || placement == constants.PLACEMENT_AFTER) {
        newTargetChildren = Immutable.OrderedMap().withMutations(r => {
            let itemId, item, i = 0, size = newTargetChildren.size;
            for ([itemId, item] of newTargetChildren.entries()) {
                if (itemId == to.get('id') && placement == constants.PLACEMENT_BEFORE) {
                    r.set(from.get('id'), from);
                }
                
                r.set(itemId, item);

                if (itemId == to.get('id') && placement == constants.PLACEMENT_AFTER) {
                    r.set(from.get('id'), from);
                }
            }
        });
    } else if (placement == constants.PLACEMENT_APPEND) {
        newTargetChildren = newTargetChildren.merge({[from.get('id')]: from});
    } else if (placement == constants.PLACEMENT_PREPEND) {
        newTargetChildren = Immutable.OrderedMap({[from.get('id')]: from}).merge(newTargetChildren);
    }

    if (isTargetInsideSource) {
        newSourceChildren = newSourceChildren.updateIn(expandTreeSubpath(targetSubpathFromSource, 'children1'), (oldChildren) => newTargetChildren);
        newSourceChildren = newSourceChildren.delete(from.get('id'));
    }

    if (!isSameParent && !isSourceInsideTarget)
        state = state.updateIn(expandTreePath(sourcePath, 'children1'), (oldChildren) => newSourceChildren);
    if (!isTargetInsideSource)
        state = state.updateIn(expandTreePath(targetPath, 'children1'), (oldChildren) => newTargetChildren);

    return state;
};

/**
 * @param {object} config
 * @param {object} oldConfig
 * @param {Immutable.Map} current
 * @param {string} newField
 * @param {string} newOperator
 * @return {object} - {canReuseValue, newValue, newValueSrc}
 */
export const _getNewValueForFieldOp = function (config, oldConfig, current, newField, newOperator, changedField = null) {
    const currentField = current.get('field');
    const currentOperator = current.get('operator');
    const currentValue = current.get('value');
    const currentValueSrc = current.get('valueSrc', new Immutable.List());

    const currentOperatorConfig = getOperatorConfig(oldConfig, currentOperator, currentField);
    const newOperatorConfig = getOperatorConfig(config, newOperator, newField);
    const operatorCardinality = newOperator ? defaultValue(newOperatorConfig.cardinality, 1) : null;
    const currentFieldConfig = getFieldConfig(currentField, oldConfig);
    const currentWidgets = Array.from({length: operatorCardinality}, (_ignore, i) => {
        let vs = currentValueSrc.get(i) || null;
        let w = getWidgetForFieldOp(oldConfig, currentField, currentOperator, vs);
        return w;
    });

    const newFieldConfig = getFieldConfig(newField, config);
    const newWidgets = Array.from({length: operatorCardinality}, (_ignore, i) => {
        let vs = currentValueSrc.get(i) || null;
        let w = getWidgetForFieldOp(config, newField, newOperator, vs);
        return w;
    });
    const commonWidgetsCnt = Math.min(newWidgets.length, currentWidgets.length);
    const firstWidgetConfig = getFieldWidgetConfig(config, newField, newOperator, null, currentValueSrc.first());
    const valueSources = getValueSourcesForFieldOp(config, newField, newOperator);
    let canReuseValue = currentField && currentOperator && newOperator 
        && (!changedField 
            || changedField == 'field' && !config.settings.clearValueOnChangeField 
            || changedField == 'operator' && !config.settings.clearValueOnChangeOp)
        && (currentFieldConfig.type == newFieldConfig.type) 
        && JSON.stringify(currentWidgets.slice(0, commonWidgetsCnt)) == JSON.stringify(newWidgets.slice(0, commonWidgetsCnt))
    ;

    if (canReuseValue) {
        for (let i = 0 ; i < commonWidgetsCnt ; i++) {
            let v = currentValue.get(i);
            //let w = newWidgets[i];
            let vs = currentValueSrc.get(i) || null;
            if (v != null) {
                if (vs == 'field') {
                    const rightFieldDefinition = getFieldConfig(v, config);
                    if (v == currentField || !rightFieldDefinition) {
                        //can't compare field with itself or no such field
                        canReuseValue = false;
                        break;
                    }
                } else if (vs == 'value') {
                    if (newFieldConfig.listValues) {
                        if (v instanceof Array) {
                            for (let _v of v) {
                                if (newFieldConfig.listValues[_v] == undefined) {
                                    //prev value is not in new list of values!
                                    canReuseValue = false;
                                    break;
                                }
                            }
                        } else {
                            if (newFieldConfig.listValues[v] == undefined) {
                                //prev value is not in new list of values!
                                canReuseValue = false;
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    let newValue = null, newValueSrc = null;
    newValue = new Immutable.List(Array.from({length: operatorCardinality}, (_ignore, i) => {
        let v = undefined;
        if (canReuseValue) {
            if (i < currentValue.size)
                v = currentValue.get(i);
        } else if (operatorCardinality == 1 && firstWidgetConfig && firstWidgetConfig.defaultValue !== undefined) {
            v = firstWidgetConfig.defaultValue;
        }
        return v;
    }));
    newValueSrc = new Immutable.List(Array.from({length: operatorCardinality}, (_ignore, i) => {
        let vs = null;
        if (canReuseValue) {
            if (i < currentValueSrc.size)
                vs = currentValueSrc.get(i);
        } else if (valueSources.length == 1) {
            vs = valueSources[0];
        } else if (valueSources.length > 1) {
            vs = valueSources[0];
        }
        return vs;
    }));

    return {canReuseValue, newValue, newValueSrc};
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} field
 */
const setField = (state, path, newField, config) => {
    if (!newField)
        return removeItem(state, path);

    return state.updateIn(expandTreePath(path, 'properties'), (map) => map.withMutations((current) => {
        const currentField = current.get('field');
        const currentOperator = current.get('operator');
        const currentOperatorOptions = current.get('operatorOptions');
        const currentValue = current.get('value');
        const currentValueSrc = current.get('valueSrc', new Immutable.List());

        // If the newly selected field supports the same operator the rule currently
        // uses, keep it selected.
        const newFieldConfig = getFieldConfig(newField, config);
        const lastOp = newFieldConfig.operators.indexOf(currentOperator) !== -1 ? currentOperator : null;
        let newOperator = null;
        const availOps = getOperatorsForField(config, newField);
        if (availOps.length == 1)
            newOperator = availOps[0];
        else if (availOps.length > 1) {
            for (let strategy of config.settings.setOpOnChangeField || []) {
                if (strategy == 'keep')
                    newOperator = lastOp;
                else if (strategy == 'default')
                    newOperator = defaultOperator(config, newField, false);
                else if (strategy == 'first')
                    newOperator = getFirstOperator(config, newField);
                if (newOperator) //found op for strategy
                    break;
            }
        }

        let {canReuseValue, newValue, newValueSrc} = _getNewValueForFieldOp (config, config, current, newField, newOperator, 'field');
        let newOperatorOptions = canReuseValue ? currentOperatorOptions : defaultOperatorOptions(config, newOperator, newField);

        return current
            .set('field', newField)
            .set('operator', newOperator)
            .set('operatorOptions', newOperatorOptions)
            .set('value', newValue)
            .set('valueSrc', newValueSrc);
    }))
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} operator
 */
const setOperator = (state, path, newOperator, config) => {
    return state.updateIn(expandTreePath(path, 'properties'), (map) => map.withMutations((current) => {
        const currentValue = current.get('value', new Immutable.List());
        const currentValueSrc = current.get('valueSrc', new Immutable.List());
        const currentField = current.get('field');
        const currentOperator = current.get('operator');
        const currentOperatorOptions = current.get('operatorOptions');

        let {canReuseValue, newValue, newValueSrc} = _getNewValueForFieldOp (config, config, current, currentField, newOperator, 'operator');
        let newOperatorOptions = canReuseValue ? currentOperatorOptions : defaultOperatorOptions(config, newOperator, currentField);

        return current
            .set('operator', newOperator)
            .set('operatorOptions', newOperatorOptions)
            .set('value', newValue)
            .set('valueSrc', newValueSrc);
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
        state = state.setIn(expandTreePath(path, 'properties', 'value', delta + ''), undefined);
    } else {
        state = state.setIn(expandTreePath(path, 'properties', 'value', delta + ''), value);
    }
    return state;
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {integer} delta
 * @param {*} srcKey
 */
const setValueSrc = (state, path, delta, srcKey) => {
    state = state.setIn(expandTreePath(path, 'properties', 'value', delta + ''), undefined);

    if (typeof srcKey === "undefined") {
        state = state.setIn(expandTreePath(path, 'properties', 'valueSrc', delta + ''), null);
    } else {
        state = state.setIn(expandTreePath(path, 'properties', 'valueSrc', delta + ''), srcKey);
    }
    return state;
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

            case constants.SET_VALUE_SRC:
                return setValueSrc(state, action.path, action.delta, action.srcKey);

            case constants.SET_OPERATOR_OPTION:
                return setOperatorOption(state, action.path, action.name, action.value);

            case constants.MOVE_ITEM:
                return moveItem(state, action.fromPath, action.toPath, action.placement, action.config);

            default:
                return state;
        }
    };
};
