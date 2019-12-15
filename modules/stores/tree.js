import Immutable from 'immutable';
import {expandTreePath, expandTreeSubpath, getItemByPath, fixPathsInTree} from '../utils/treeUtils';
import {defaultRuleProperties, defaultGroupProperties, defaultOperator, defaultOperatorOptions, defaultRoot} from '../utils/defaultUtils';
import * as constants from '../constants';
import uuid from '../utils/uuid';
import omit from 'lodash/omit';
import {
    getFirstOperator, getFuncConfig, getFieldConfig, getOperatorConfig, getFieldWidgetConfig, 
    getValueSourcesForFieldOp, getOperatorsForField, getWidgetForFieldOp
} from "../utils/configUtils";
import {defaultValue, deepEqual} from "../utils/stuff";


const hasChildren = (tree, path) => tree.getIn(expandTreePath(path, 'children1')).size > 0;

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {Immutable.Map} properties
 */
const addNewGroup = (state, path, properties, config) => {
    const groupUuid = uuid();
    state = addItem(state, path, 'group', groupUuid, defaultGroupProperties(config).merge(properties || {}));

    const groupPath = path.push(groupUuid);
    // If we don't set the empty map, then the following merge of addItem will create a Map rather than an OrderedMap for some reason
    state = state.setIn(expandTreePath(groupPath, 'children1'), new Immutable.OrderedMap());
    state = addItem(state, groupPath, 'rule', uuid(), defaultRuleProperties(config));
    state = fixPathsInTree(state);
    return state;
};

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {Immutable.Map} properties
 */
const removeGroup = (state, path, config) => {
    state = removeItem(state, path);

    const parentPath = path.slice(0, -1);
    const isEmptyGroup = !hasChildren(state, parentPath);
    const isEmptyRoot = isEmptyGroup && parentPath.size == 1;
    const canLeaveEmpty = isEmptyGroup && config.settings.canLeaveEmptyGroup && !isEmptyRoot;
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
    const isEmptyGroup = !hasChildren(state, parentPath);
    const isEmptyRoot = isEmptyGroup && parentPath.size == 1;
    const canLeaveEmpty = isEmptyGroup && config.settings.canLeaveEmptyGroup && !isEmptyRoot;
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
    const from = getItemByPath(state, fromPath);
    const sourcePath = fromPath.pop();
    const source = fromPath.size > 1 ? getItemByPath(state, sourcePath) : null;
    const sourceChildren = source ? source.get('children1') : null;

    const to = getItemByPath(state, toPath);
    const targetPath = (placement == constants.PLACEMENT_APPEND || placement == constants.PLACEMENT_PREPEND) ? toPath : toPath.pop();
    const target = (placement == constants.PLACEMENT_APPEND || placement == constants.PLACEMENT_PREPEND) ? 
        to
        : toPath.size > 1 ? getItemByPath(state, targetPath) : null;
    const targetChildren = target ? target.get('children1') : null;

    if (!source || !target)
        return state;

    const isSameParent = (source.get('id') == target.get('id'));
    const isSourceInsideTarget = targetPath.size < sourcePath.size 
        && deepEqual(targetPath.toArray(), sourcePath.toArray().slice(0, targetPath.size));
    const isTargetInsideSource = targetPath.size > sourcePath.size 
        && deepEqual(sourcePath.toArray(), targetPath.toArray().slice(0, sourcePath.size));
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
        newTargetChildren = newTargetChildren.updateIn(expandTreeSubpath(sourceSubpathFromTarget, 'children1'), (_oldChildren) => newSourceChildren);
    }

    if (placement == constants.PLACEMENT_BEFORE || placement == constants.PLACEMENT_AFTER) {
        newTargetChildren = Immutable.OrderedMap().withMutations(r => {
            for (let [itemId, item] of newTargetChildren.entries()) {
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
        newSourceChildren = newSourceChildren.updateIn(expandTreeSubpath(targetSubpathFromSource, 'children1'), (_oldChildren) => newTargetChildren);
        newSourceChildren = newSourceChildren.delete(from.get('id'));
    }

    if (!isSameParent && !isSourceInsideTarget)
        state = state.updateIn(expandTreePath(sourcePath, 'children1'), (_oldChildren) => newSourceChildren);
    if (!isTargetInsideSource)
        state = state.updateIn(expandTreePath(targetPath, 'children1'), (_oldChildren) => newTargetChildren);

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
export const getNewValueForFieldOp = function (config, oldConfig = null, current, newField, newOperator, changedField = null, canFix = true) {
    if (!oldConfig)
        oldConfig = config;
    const currentField = current.get('field');
    const currentOperator = current.get('operator');
    const currentValue = current.get('value');
    const currentValueSrc = current.get('valueSrc', new Immutable.List());
    const currentValueType = current.get('valueType', new Immutable.List());

    const _currentOperatorConfig = getOperatorConfig(oldConfig, currentOperator, currentField);
    const newOperatorConfig = getOperatorConfig(config, newOperator, newField);
    const operatorCardinality = newOperator ? defaultValue(newOperatorConfig.cardinality, 1) : null;
    const currentFieldConfig = getFieldConfig(currentField, oldConfig);
    const newFieldConfig = getFieldConfig(newField, config);

    // get widgets info
    const widgetsMeta = Array.from({length: operatorCardinality}, (_ignore, i) => {
        const vs = currentValueSrc.get(i) || null;
        const currentWidgets = getWidgetForFieldOp(oldConfig, currentField, currentOperator, vs);
        const newWidgets = getWidgetForFieldOp(config, newField, newOperator, vs);
        // need to also check value widgets if we changed operator and current value source was 'field'
        // cause for select type op '=' requires single value and op 'in' requires array value
        const currentValueWidgets = vs == 'value' ? currentWidgets : getWidgetForFieldOp(oldConfig, currentField, currentOperator, 'value');
        const newValueWidgets = vs == 'value' ? newWidgets : getWidgetForFieldOp(config, newField, newOperator, 'value');
        return {currentWidgets, newWidgets, currentValueWidgets, newValueWidgets};
    });
    const currentWidgets = widgetsMeta.map(({currentWidgets}) => currentWidgets);
    const newWidgets = widgetsMeta.map(({newWidgets}) => newWidgets);
    const currentValueWidgets = widgetsMeta.map(({currentValueWidgets}) => currentValueWidgets);
    const newValueWidgets = widgetsMeta.map(({newValueWidgets}) => newValueWidgets);
    const commonWidgetsCnt = Math.min(newWidgets.length, currentWidgets.length);
    const reusableWidgets = newValueWidgets.filter(w => currentValueWidgets.includes(w));
    const firstWidgetConfig = getFieldWidgetConfig(config, newField, newOperator, null, currentValueSrc.first());
    const valueSources = getValueSourcesForFieldOp(config, newField, newOperator);
    let canReuseValue = currentField && currentOperator && newOperator 
        && (!changedField 
            || changedField == 'field' && !config.settings.clearValueOnChangeField 
            || changedField == 'operator' && !config.settings.clearValueOnChangeOp)
        && (currentFieldConfig && newFieldConfig && currentFieldConfig.type == newFieldConfig.type) 
        && reusableWidgets.length > 0;
    ;

    let valueFixes = {};
    if (canReuseValue) {
        for (let i = 0 ; i < commonWidgetsCnt ; i++) {
            const v = currentValue.get(i);
            const vType = currentValueType.get(i) || null;
            const vSrc = currentValueSrc.get(i) || null;
            const isValidSrc = (valueSources.find(v => v == vSrc) != null);
            const isEndValue = !canFix;
            const [validateError, fixedValue] = _validateValue(config, newField, newField, newOperator, v, vType, vSrc, canFix, isEndValue);
            const isValid = !validateError;
            if (!isValidSrc || !isValid) {
                canReuseValue = false;
                break;
            } else if (canFix && fixedValue !== v) {
                valueFixes[i] = fixedValue;
            }
        }
    }

    let newValue = null, newValueSrc = null, newValueType = null;
    newValue = new Immutable.List(Array.from({length: operatorCardinality}, (_ignore, i) => {
        let v = undefined;
        if (canReuseValue) {
            if (i < currentValue.size) {
                v = currentValue.get(i);
                if (valueFixes[i] !== undefined) {
                    v = valueFixes[i];
                }
            }
        } else if (operatorCardinality == 1 && (firstWidgetConfig || newFieldConfig)) {
            if (newFieldConfig.defaultValue !== undefined)
                v = newFieldConfig.defaultValue;
            else if (newFieldConfig.fieldSettings && newFieldConfig.fieldSettings.defaultValue !== undefined)
                v = newFieldConfig.fieldSettings.defaultValue;
            else if (firstWidgetConfig.defaultValue !== undefined)
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
        let vt = null;
        if (canReuseValue) {
            if (i < currentValueType.size)
                vt = currentValueType.get(i);
        } else if (operatorCardinality == 1 && firstWidgetConfig && firstWidgetConfig.type !== undefined) {
            vt = firstWidgetConfig.type;
        }
        return vt;
    }));

    return {canReuseValue, newValue, newValueSrc, newValueType};
};

/**
 * 
 * @param {bool} canFix true is useful for func values to remove bad args
 * @param {bool} isEndValue false if value is in process of editing by user
 * @param {bool} isRawValue false is used only internally from _validateFuncValue
 * @return {array} [validError, fixedValue] - if validError === null and canFix == true, fixedValue can differ from value if was fixed
 */
const _validateValue = (config, leftField, field, operator, value, valueType, valueSrc, canFix = false, isEndValue = false, isRawValue = true) => {
    let validError = null;
    let fixedValue = value;

    if (value != null) {
        if (valueSrc == 'field') {
            [validError, fixedValue] = _validateFieldValue(leftField, field, value, valueSrc, valueType, config, operator, isEndValue, canFix);
        } else if (valueSrc == 'func') {
            [validError, fixedValue] = _validateFuncValue(leftField, field, value, valueSrc, valueType, config, operator, isEndValue, canFix);
        } else if (valueSrc == 'value' || !valueSrc) {
            [validError, fixedValue] = _validateNormalValue(leftField, field, value, valueSrc, valueType, config, operator, isEndValue, canFix);
        }

        if (!validError) {
            const fieldConfig = getFieldConfig(field, config);
            const w = getWidgetForFieldOp(config, field, operator, valueSrc);
            const fieldWidgetDefinition = omit(getFieldWidgetConfig(config, field, operator, w, valueSrc), ['factory', 'formatValue']);
            const rightFieldDefinition = (valueSrc == 'field' ? getFieldConfig(value, config) : null);
    
            const fn = fieldWidgetDefinition.validateValue;
            if (typeof fn == 'function') {
                const args = [
                    fixedValue, 
                    //field,
                    fieldConfig,
                ];
                if (valueSrc == 'field')
                    args.push(rightFieldDefinition);
                const validResult = fn(...args);
                if (typeof validResult == "string" || validResult === null) {
                    validError = validResult;
                } else {
                    if (validError == false)
                        validError = `Invalid value`;
                }
            }
        }
    }

    if (isRawValue && validError) {
        validError = `Field ${field}: ${validError}`;
        console.warn("[RAQB validate]", validError);
    }
    
    return [validError, validError ? value : fixedValue];
};

/**
 * 
 */
const _validateNormalValue = (leftField, field, value, valueSrc, valueType, config, operator = null, isEndValue = false, canFix = false) => {
    let fixedValue = value;
    const fieldConfig = getFieldConfig(field, config);
    const w = getWidgetForFieldOp(config, field, operator, valueSrc);
    const wConfig = config.widgets[w];
    const wType = wConfig.type;

    if (valueType != wType)
        return [`Value should have type ${wType}, but got value of type ${valueType}`, value];
    
    const fieldSettings = fieldConfig.fieldSettings;
    if (fieldSettings) {
        if (fieldSettings.listValues && !fieldSettings.allowCustomValues) {
            if (value instanceof Array) {
                for (let v of value) {
                    if (fieldSettings.listValues[v] == undefined) {
                        return [`Value ${v} is not in list of values`, value];
                    }
                }
            } else {
                if (fieldSettings.listValues[value] == undefined) {
                    return [`Value ${value} is not in list of values`, value];
                }
            }
        }
        if (fieldSettings.min != null && value < fieldSettings.min) {
            return [`Value ${value} < min ${fieldSettings.min}`, value];
        }
        if (fieldSettings.max != null && value > fieldSettings.max) {
            return [`Value ${value} > max ${fieldSettings.max}`, value];
        }
    }
    
    return [null, value];
};


/**
 * 
 */
const _validateFieldValue = (leftField, field, value, _valueSrc, valueType, config, operator = null, isEndValue = false, canFix = false) => {
    let fixedValue = value;
    const rightFieldDefinition = getFieldConfig(value, config);
    if (!rightFieldDefinition)
        return [`Unknown field ${value}`, value];
    if (value == leftField)
        return [`Can't compare field ${leftField} with itself`, value];
    if (valueType && valueType != rightFieldDefinition.type)
        return [`Field ${value} is of type ${rightFieldDefinition.type}, but expected ${valueType}`, value];
    return [null, value];
};

/**
 * 
 */
const _validateFuncValue = (leftField, field, value, _valueSrc, valueType, config, operator = null, isEndValue = false, canFix = false) => {
    let fixedValue = value;
    
    if (value) {
        const funcKey = value.get('func');
        if (funcKey) {
            const funcConfig = getFuncConfig(funcKey, config);
            if (funcConfig) {
                if (valueType && funcConfig.returnType != valueType)
                    return [`Function ${funcKey} should return value of type ${funcConfig.returnType}, but got ${valueType}`, value];
                for (const argKey in funcConfig.args) {
                    const argConfig = funcConfig.args[argKey];
                    const args = fixedValue.get('args');
                    const argVal = args ? args.get(argKey) : undefined;
                    const fieldDef = getFieldConfig(argConfig, config);
                    const argValue = argVal ? argVal.get('value') : undefined;
                    const argValueSrc = argVal ? argVal.get('valueSrc') : undefined;
                    if (argValue !== undefined) {
                        const [argValidError, fixedArgVal] = _validateValue(
                            config, leftField, fieldDef, operator, argValue, argConfig.type, argValueSrc, canFix, isEndValue, false
                        );
                        if (argValidError !== null) {
                            if (canFix) {
                                fixedValue = fixedValue.deleteIn(['args', argKey]);
                                if (argConfig.defaultValue !== undefined) {
                                    fixedValue = fixedValue.setIn(['args', argKey, 'value'], argConfig.defaultValue);
                                    fixedValue = fixedValue.setIn(['args', argKey, 'valueSrc'], 'value');
                                }
                            } else {
                                return [`Invalid value of arg ${argKey} for func ${funcKey}: ${argValidError}`, value];
                            }
                        } else if (fixedArgVal !== argValue) {
                            fixedValue = fixedValue.setIn(['args', argKey, 'value'], fixedArgVal);
                        }
                    } else if (isEndValue && argConfig.defaultValue === undefined && !canFix) {
                        return [`Value of arg ${argKey} for func ${funcKey} is required`, value];
                    }
                }
            } else return [`Unknown function ${funcKey}`, value];
        } // else it's not function value
    } // empty value

    return [null, fixedValue];
};



/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} field
 */
const setField = (state, path, newField, config) => {
    if (!newField)
        return removeItem(state, path);

    const fieldSeparator = config.settings.fieldSeparator;
    if (Array.isArray(newField))
        newField = newField.join(fieldSeparator);

    return state.updateIn(expandTreePath(path, 'properties'), (map) => map.withMutations((current) => {
        const currentOperator = current.get('operator');
        const currentOperatorOptions = current.get('operatorOptions');
        const _currentField = current.get('field');
        const _currentValue = current.get('value');
        const _currentValueSrc = current.get('valueSrc', new Immutable.List());
        const _currentValueType = current.get('valueType', new Immutable.List());

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

        const {canReuseValue, newValue, newValueSrc, newValueType} = getNewValueForFieldOp(
            config, config, current, newField, newOperator, 'field', true
        );
        const newOperatorOptions = canReuseValue ? currentOperatorOptions : defaultOperatorOptions(config, newOperator, newField);

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
        const currentField = current.get('field');
        const currentOperatorOptions = current.get('operatorOptions');
        const _currentValue = current.get('value', new Immutable.List());
        const _currentValueSrc = current.get('valueSrc', new Immutable.List());
        const _currentOperator = current.get('operator');

        const {canReuseValue, newValue, newValueSrc, newValueType} = getNewValueForFieldOp(
            config, config, current, currentField, newOperator, 'operator', true
        );
        const newOperatorOptions = canReuseValue ? currentOperatorOptions : defaultOperatorOptions(config, newOperator, currentField);

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
 * @param {boolean} __isInternal
 */
const setValue = (state, path, delta, value, valueType, config, __isInternal) => {
    const fieldSeparator = config.settings.fieldSeparator;
    if (valueSrc === 'field' && Array.isArray(value))
        value = value.join(fieldSeparator);

    const valueSrc = state.getIn(expandTreePath(path, 'properties', 'valueSrc', delta + '')) || null;
    const field = state.getIn(expandTreePath(path, 'properties', 'field')) || null;
    const operator = state.getIn(expandTreePath(path, 'properties', 'operator')) || null;

    const isEndValue = false;
    const canFix = false;
    const calculatedValueType = valueType || _calculateValueType(value, valueSrc, config);
    const [validateError, fixedValue] = _validateValue(config, field, field, operator, value, calculatedValueType, valueSrc, canFix, isEndValue);
    const isValid = !validateError;
    if (isValid && canFix && fixedValue !== value) {
        value = fixedValue;
    }

    if (isValid) {
        if (typeof value === "undefined") {
            state = state.setIn(expandTreePath(path, 'properties', 'value', delta + ''), undefined);
            state = state.setIn(expandTreePath(path, 'properties', 'valueType', delta + ''), null);
        } else {
            const lastValue = state.getIn(expandTreePath(path, 'properties', 'value', delta + ''));
            const isLastEmpty = lastValue == undefined;
            state = state.setIn(expandTreePath(path, 'properties', 'value', delta + ''), value);
            state = state.setIn(expandTreePath(path, 'properties', 'valueType', delta + ''), calculatedValueType);
            state.__isInternalValueChange = __isInternal && !isLastEmpty;
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


/**
 * 
 */
const _calculateValueType = (value, valueSrc, config) => {
    let calculatedValueType = null;
    if (value) {
        if (valueSrc === 'field') {
            const fieldConfig = getFieldConfig(value, config);
            if (fieldConfig) {
                calculatedValueType = fieldConfig.type;
            }
        } else if (valueSrc === 'func') {
            const funcKey = value.get('func');
            if (funcKey) {
                const funcConfig = getFuncConfig(funcKey, config);
                if (funcConfig) {
                    calculatedValueType = funcConfig.returnType;
                }
            }
        }
    }
    return calculatedValueType;
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
    const unset = {__isInternalValueChange: undefined};
    
    return (state = emptyState, action) => {
        switch (action.type) {
            case constants.SET_TREE:
                return Object.assign({}, state, {...unset}, {tree: action.tree});

            case constants.ADD_NEW_GROUP:
                return Object.assign({}, state, {...unset}, {tree: addNewGroup(state.tree, action.path, action.properties, action.config)});

            case constants.ADD_GROUP:
                return Object.assign({}, state, {...unset}, {tree: addItem(state.tree, action.path, 'group', action.id, action.properties)});

            case constants.REMOVE_GROUP:
                return Object.assign({}, state, {...unset}, {tree: removeGroup(state.tree, action.path, action.config)});

            case constants.ADD_RULE:
                return Object.assign({}, state, {...unset}, {tree: addItem(state.tree, action.path, 'rule', action.id, action.properties)});

            case constants.REMOVE_RULE:
                return Object.assign({}, state, {...unset}, {tree: removeRule(state.tree, action.path, action.config)});

            case constants.SET_CONJUNCTION:
                return Object.assign({}, state, {...unset}, {tree: setConjunction(state.tree, action.path, action.conjunction)});

            case constants.SET_NOT:
                return Object.assign({}, state, {...unset}, {tree: setNot(state.tree, action.path, action.not)});

            case constants.SET_FIELD:
                return Object.assign({}, state, {...unset}, {tree: setField(state.tree, action.path, action.field, action.config)});

            case constants.SET_OPERATOR:
                return Object.assign({}, state, {...unset}, {tree: setOperator(state.tree, action.path, action.operator, action.config)});

            case constants.SET_VALUE:
                let set = {};
                const tree = setValue(state.tree, action.path, action.delta, action.value, action.valueType, action.config, action.__isInternal);
                if (tree.__isInternalValueChange)
                    set.__isInternalValueChange = true;
                return Object.assign({}, state, {...unset, ...set}, {tree});

            case constants.SET_VALUE_SRC:
                return Object.assign({}, state, {...unset}, {tree: setValueSrc(state.tree, action.path, action.delta, action.srcKey)});

            case constants.SET_OPERATOR_OPTION:
                return Object.assign({}, state, {...unset}, {tree: setOperatorOption(state.tree, action.path, action.name, action.value)});

            case constants.MOVE_ITEM:
                return Object.assign({}, state, {...unset}, {tree: moveItem(state.tree, action.fromPath, action.toPath, action.placement, action.config)});


            case constants.SET_DRAG_START:
                return Object.assign({}, state, {...unset}, {dragStart: action.dragStart, dragging: action.dragging, mousePos: action.mousePos});

            case constants.SET_DRAG_PROGRESS:
                return Object.assign({}, state, {...unset}, {mousePos: action.mousePos, dragging: action.dragging});

            case constants.SET_DRAG_END:
                return Object.assign({}, state, {...unset}, emptyDrag);


            default:
                return state;
        }
    };
};
