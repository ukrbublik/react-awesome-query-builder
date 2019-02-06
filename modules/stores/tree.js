import Immutable from 'immutable';
import {expandTreePath, expandTreeSubpath, getItemByPath, fixPathsInTree} from '../utils/treeUtils';
import {defaultRuleProperties, defaultGroupProperties, defaultOperator, defaultOperatorOptions, defaultRoot} from '../utils/defaultUtils';
import {getFirstOperator} from '../utils/configUtils';
import * as constants from '../constants';
import uuid from '../utils/uuid';
import omit from 'lodash/omit';
import {getFieldConfig, getOperatorConfig, getFieldWidgetConfig, getValueSourcesForFieldOp} from "../utils/configUtils";
import {defaultValue, eqArrSet} from "../utils/stuff";
import {getOperatorsForField, getWidgetForFieldOp} from "../utils/configUtils";
var stringify = require('json-stringify-safe');


const hasChildren = (tree, path) => tree.getIn(expandTreePath(path, 'children1')).size > 0;

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
    state = fixPathsInTree(state);
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
    state = fixPathsInTree(state);
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
    state = fixPathsInTree(state);
    return state;
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {bool} not
 */
const setNot = (state, path, not) =>
    state.setIn(expandTreePath(path, 'properties', 'not'), not);

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
    state = state.mergeIn(expandTreePath(path, 'children1'), new Immutable.OrderedMap({
        [id]: new Immutable.Map({type, id, properties})
    }));
    state = fixPathsInTree(state);
    return state;
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 */
const removeItem = (state, path) => {
    state = state.deleteIn(expandTreePath(path));
    state = fixPathsInTree(state);
    return state;
}

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

    state = fixPathsInTree(state);
    return state;
};

/**
 * @param {object} config
 * @param {object} oldConfig
 * @param {Immutable.Map} current
 * @param {string} newField
 * @param {string} newOperator
 * @param {string} changedField
 * @return {object} - {canReuseValue, newValue, newValueSrc, newValueType}
 */
export const _getNewValueForFieldOp = function (config, oldConfig = null, current, newField, newOperator, changedField = null) {
    if (!oldConfig)
        oldConfig = config;
    const currentField = current.get('field');
    const currentOperator = current.get('operator');
    let currentValue = current.get('value');
    if (currentValue !== undefined && currentValue.get(0) !== undefined && Immutable.List.isList(currentValue.get(0))) {
        currentValue = Immutable.List.of(currentValue.get(0).toJS())
    } // Unwrap nested Immutable Lists for use with tree conversion using Immutable-js toJS() and fromJS()
    const currentValueSrc = current.get('valueSrc', new Immutable.List());
    const currentValueType = current.get('valueType', new Immutable.List());

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
        && (currentFieldConfig && newFieldConfig && currentFieldConfig.type == newFieldConfig.type) 
        && JSON.stringify(currentWidgets.slice(0, commonWidgetsCnt)) == JSON.stringify(newWidgets.slice(0, commonWidgetsCnt))
    ;

    if (canReuseValue) {
        for (let i = 0 ; i < commonWidgetsCnt ; i++) {
            let v = currentValue.get(i);
            let vType = currentValueType.get(i) || null;
            let vSrc = currentValueSrc.get(i) || null;
            let isValidSrc = (valueSources.find(v => v == vSrc) != null);
            let isValid = _validateValue(config, newField, newOperator, v, vType, vSrc);
            if (!isValidSrc || !isValid) {
                canReuseValue = false;
                break;
            }
        }
    }

    let newValue = null, newValueSrc = null, newValueType = null;
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
    newValueType = new Immutable.List(Array.from({length: operatorCardinality}, (_ignore, i) => {
        let v = null;
        if (canReuseValue) {
            if (i < currentValueType.size)
                v = currentValueType.get(i);
        } else if (operatorCardinality == 1 && firstWidgetConfig && firstWidgetConfig.type !== undefined) {
            v = firstWidgetConfig.type;
        }
        return v;
    }));

    return {canReuseValue, newValue, newValueSrc, newValueType};
};

const _validateValue = (config, field, operator, value, valueType, valueSrc) => {
    let v = value,
        vType = valueType,
        vSrc = valueSrc;
    const fieldConfig = getFieldConfig(field, config);
    let w = getWidgetForFieldOp(config, field, operator, vSrc);
    let wConfig = config.widgets[w];
    let wType = wConfig.type;
    let fieldWidgetDefinition = omit(getFieldWidgetConfig(config, field, operator, w, vSrc), ['factory', 'formatValue']);
    let isValid = true;
    if (v != null) {
        const rightFieldDefinition = (vSrc == 'field' ? getFieldConfig(v, config) : null);
        if (vSrc == 'field') {
            if (v == field || !rightFieldDefinition) {
                //can't compare field with itself or no such field
                isValid = false;
            }
        } else if (vSrc == 'value') {
            if (vType != wType) {
                isValid = false;
            }
            if (fieldConfig && fieldConfig.listValues) {
                if (v instanceof Array) {
                    for (let _v of v) {
                        if (fieldConfig.listValues[_v] == undefined) {
                            //prev value is not in new list of values!
                            isValid = false;
                            break;
                        }
                    }
                } else {
                    if (fieldConfig.listValues[v] == undefined) {
                        //prev value is not in new list of values!
                        isValid = false;
                    }
                }
            }
            const fieldSettings = fieldConfig.fieldSettings;
            if (fieldSettings) {
                if (fieldSettings.min != null) {
                    isValid = isValid && (v >= fieldSettings.min);
                }
                if (fieldSettings.max != null) {
                    isValid = isValid && (v <= fieldSettings.max);
                }
            }
        }
        let fn = fieldWidgetDefinition.validateValue;
        if (typeof fn == 'function') {
            let args = [
                v, 
                //field,
                fieldConfig,
            ];
            if (vSrc == 'field')
                args.push(rightFieldDefinition);
            isValid = isValid && fn(...args);
        }
    }
    return isValid;
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
        //const currentValue = current.get('value');
        //const currentValueSrc = current.get('valueSrc', new Immutable.List());
        //const currentValueType = current.get('valueType', new Immutable.List());

        // If the newly selected field supports the same operator the rule currently
        // uses, keep it selected.
        const newFieldConfig = getFieldConfig(newField, config);
        const lastOp = newFieldConfig && newFieldConfig.operators.indexOf(currentOperator) !== -1 ? currentOperator : null;
        let newOperator = null;
        const availOps = getOperatorsForField(config, newField);
        if (availOps && availOps.length == 1)
            newOperator = availOps[0];
        else if (availOps && availOps.length > 1) {
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

        let {canReuseValue, newValue, newValueSrc, newValueType} = _getNewValueForFieldOp (config, config, current, newField, newOperator, 'field');
        let newOperatorOptions = canReuseValue ? currentOperatorOptions : defaultOperatorOptions(config, newOperator, newField);

        return current
            .set('field', newField)
            .set('operator', newOperator)
            .set('operatorOptions', newOperatorOptions)
            .set('value', newValue)
            .set('valueSrc', newValueSrc)
            .set('valueType', newValueType);
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

        let {canReuseValue, newValue, newValueSrc, newValueType} = _getNewValueForFieldOp (config, config, current, currentField, newOperator, 'operator');
        let newOperatorOptions = canReuseValue ? currentOperatorOptions : defaultOperatorOptions(config, newOperator, currentField);

        return current
            .set('operator', newOperator)
            .set('operatorOptions', newOperatorOptions)
            .set('value', newValue)
            .set('valueSrc', newValueSrc)
            .set('valueType', newValueType);
    }));
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {integer} delta
 * @param {*} value
 * @param {string} valueType
 */
const setValue = (state, path, delta, value, valueType, config) => {
    const valueSrc = state.getIn(expandTreePath(path, 'properties', 'valueSrc', delta + '')) || null;
    const field = state.getIn(expandTreePath(path, 'properties', 'field')) || null;
    const operator = state.getIn(expandTreePath(path, 'properties', 'operator')) || null;
    const calculatedValueType = valueType || (valueSrc === 'field' && value ? getFieldConfig(value, config).type : valueType);
    let isValid = _validateValue(config, field, operator, value, calculatedValueType, valueSrc);

    if (isValid) {
        if (typeof value === "undefined") {
            state = state.setIn(expandTreePath(path, 'properties', 'value', delta + ''), undefined);
            state = state.setIn(expandTreePath(path, 'properties', 'valueType', delta + ''), null);
        } else {
            state = state.setIn(expandTreePath(path, 'properties', 'value', delta + ''), value);
            state = state.setIn(expandTreePath(path, 'properties', 'valueType', delta + ''), calculatedValueType);
        }
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
    state = state.setIn(expandTreePath(path, 'properties', 'valueType', delta + ''), null);

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


const emptyDrag = {
  dragging: {
    id: null,
    x: null,
    y: null,
    w: null,
    h: null
  },
  mousePos: {},
  dragStart: {
    id: null,
  },
};


/**
 * @param {Immutable.Map} state
 * @param {object} action
 */
export default (config) => {
    const emptyTree = defaultRoot(config);
    const emptyState = Object.assign({}, {tree: emptyTree}, emptyDrag);
    
    return (state = emptyState, action) => {
        switch (action.type) {
            case constants.SET_TREE:
                return Object.assign({}, state, {tree: action.tree});

            case constants.ADD_NEW_GROUP:
                return Object.assign({}, state, {tree: addNewGroup(state.tree, action.path, action.properties, action.config)});

            case constants.ADD_GROUP:
                return Object.assign({}, state, {tree: addItem(state.tree, action.path, 'group', action.id, action.properties)});

            case constants.REMOVE_GROUP:
                return Object.assign({}, state, {tree: removeGroup(state.tree, action.path, action.config)});

            case constants.ADD_RULE:
                return Object.assign({}, state, {tree: addItem(state.tree, action.path, 'rule', action.id, action.properties)});

            case constants.REMOVE_RULE:
                return Object.assign({}, state, {tree: removeRule(state.tree, action.path, action.config)});

            case constants.SET_CONJUNCTION:
                return Object.assign({}, state, {tree: setConjunction(state.tree, action.path, action.conjunction)});

            case constants.SET_NOT:
                return Object.assign({}, state, {tree: setNot(state.tree, action.path, action.not)});

            case constants.SET_FIELD:
                return Object.assign({}, state, {tree: setField(state.tree, action.path, action.field, action.config)});

            case constants.SET_OPERATOR:
                return Object.assign({}, state, {tree: setOperator(state.tree, action.path, action.operator, action.config)});

            case constants.SET_VALUE:
                return Object.assign({}, state, {tree: setValue(state.tree, action.path, action.delta, action.value, action.valueType, action.config)});

            case constants.SET_VALUE_SRC:
                return Object.assign({}, state, {tree: setValueSrc(state.tree, action.path, action.delta, action.srcKey)});

            case constants.SET_OPERATOR_OPTION:
                return Object.assign({}, state, {tree: setOperatorOption(state.tree, action.path, action.name, action.value)});

            case constants.MOVE_ITEM:
                return Object.assign({}, state, {tree: moveItem(state.tree, action.fromPath, action.toPath, action.placement, action.config)});


            case constants.SET_DRAG_START:
                return Object.assign({}, state, {dragStart: action.dragStart, dragging: action.dragging, mousePos: action.mousePos});

            case constants.SET_DRAG_PROGRESS:
                return Object.assign({}, state, {mousePos: action.mousePos, dragging: action.dragging});

            case constants.SET_DRAG_END:
                return Object.assign({}, state, emptyDrag);


            default:
                return state;
        }
    };
};
