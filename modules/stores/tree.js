import Immutable from "immutable";
import {expandTreePath, expandTreeSubpath, getItemByPath, fixPathsInTree} from "../utils/treeUtils";
import {defaultRuleProperties, defaultGroupProperties, defaultOperator, defaultOperatorOptions, defaultRoot} from "../utils/defaultUtils";
import * as constants from "../constants";
import uuid from "../utils/uuid";
import {
  getFirstOperator, getFuncConfig, getFieldConfig, getOperatorsForField
} from "../utils/configUtils";
import {deepEqual, defaultValue} from "../utils/stuff";
import {validateValue, getNewValueForFieldOp} from "../utils/validation";
import {
  getOperatorConfig, getWidgetForFieldOp, getFieldWidgetConfig
} from "../utils/configUtils";


const hasChildren = (tree, path) => tree.getIn(expandTreePath(path, "children1")).size > 0;

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {Immutable.Map} properties
 */
const addNewGroup = (state, path, properties, config) => {
  const groupUuid = uuid();
  state = addItem(state, path, "group", groupUuid, defaultGroupProperties(config).merge(properties || {}));

  const groupPath = path.push(groupUuid);
  // If we don't set the empty map, then the following merge of addItem will create a Map rather than an OrderedMap for some reason
  state = state.setIn(expandTreePath(groupPath, "children1"), new Immutable.OrderedMap());
  state = addItem(state, groupPath, "rule", uuid(), defaultRuleProperties(config));
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
    state = addItem(state, parentPath, "rule", uuid(), defaultRuleProperties(config));
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

  const parentPath = path.pop();
  const parent = state.getIn(expandTreePath(parentPath));
  const parentField = parent.getIn(["properties", "field"]);
  const isParentRuleGroup = parent.get("type") == "rule_group";
  const isEmptyGroup = !hasChildren(state, parentPath);
  const isEmptyRoot = isEmptyGroup && parentPath.size == 1;
  const canLeaveEmpty = isEmptyGroup && (isParentRuleGroup ? true : config.settings.canLeaveEmptyGroup && !isEmptyRoot);
  if (isEmptyGroup) {
    if (isParentRuleGroup) {
      state = state.deleteIn(expandTreePath(parentPath));
    } else if (!canLeaveEmpty) {
      state = addItem(state, parentPath, "rule", uuid(), defaultRuleProperties(config, parentField));
    }
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
  state.setIn(expandTreePath(path, "properties", "not"), not);

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} conjunction
 */
const setConjunction = (state, path, conjunction) =>
  state.setIn(expandTreePath(path, "properties", "conjunction"), conjunction);

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} type
 * @param {string} id
 * @param {Immutable.OrderedMap} properties
 */
const addItem = (state, path, type, id, properties) => {
  state = state.mergeIn(expandTreePath(path, "children1"), new Immutable.OrderedMap({
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
};

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
  const sourceChildren = source ? source.get("children1") : null;

  const to = getItemByPath(state, toPath);
  const targetPath = (placement == constants.PLACEMENT_APPEND || placement == constants.PLACEMENT_PREPEND) ? toPath : toPath.pop();
  const target = (placement == constants.PLACEMENT_APPEND || placement == constants.PLACEMENT_PREPEND) 
    ? to
    : toPath.size > 1 ? getItemByPath(state, targetPath) : null;
  const targetChildren = target ? target.get("children1") : null;

  if (!source || !target)
    return state;

  const isSameParent = (source.get("id") == target.get("id"));
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
    newSourceChildren = newSourceChildren.delete(from.get("id"));
  if (isSameParent) {
    newTargetChildren = newSourceChildren;
  } else if (isSourceInsideTarget) {
    newTargetChildren = newTargetChildren.updateIn(expandTreeSubpath(sourceSubpathFromTarget, "children1"), (_oldChildren) => newSourceChildren);
  }

  if (placement == constants.PLACEMENT_BEFORE || placement == constants.PLACEMENT_AFTER) {
    newTargetChildren = Immutable.OrderedMap().withMutations(r => {
      for (let [itemId, item] of newTargetChildren.entries()) {
        if (itemId == to.get("id") && placement == constants.PLACEMENT_BEFORE) {
          r.set(from.get("id"), from);
        }
                
        r.set(itemId, item);

        if (itemId == to.get("id") && placement == constants.PLACEMENT_AFTER) {
          r.set(from.get("id"), from);
        }
      }
    });
  } else if (placement == constants.PLACEMENT_APPEND) {
    newTargetChildren = newTargetChildren.merge({[from.get("id")]: from});
  } else if (placement == constants.PLACEMENT_PREPEND) {
    newTargetChildren = Immutable.OrderedMap({[from.get("id")]: from}).merge(newTargetChildren);
  }

  if (isTargetInsideSource) {
    newSourceChildren = newSourceChildren.updateIn(expandTreeSubpath(targetSubpathFromSource, "children1"), (_oldChildren) => newTargetChildren);
    newSourceChildren = newSourceChildren.delete(from.get("id"));
  }

  if (!isSameParent && !isSourceInsideTarget)
    state = state.updateIn(expandTreePath(sourcePath, "children1"), (_oldChildren) => newSourceChildren);
  if (!isTargetInsideSource)
    state = state.updateIn(expandTreePath(targetPath, "children1"), (_oldChildren) => newTargetChildren);

  state = fixPathsInTree(state);
  return state;
};


/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} field
 */
const setField = (state, path, newField, config) => {
  if (!newField)
    return removeItem(state, path);

  const {showErrorMessage, fieldSeparator, setOpOnChangeField} = config.settings;
  if (Array.isArray(newField))
    newField = newField.join(fieldSeparator);

  const currentType = state.getIn(expandTreePath(path, "type"));
  const wasRuleGroup = currentType == "rule_group";
  const newFieldConfig = getFieldConfig(newField, config);
  const isRuleGroup = newFieldConfig.type == "!group";

  if (!isRuleGroup && !newFieldConfig.operators) {
    console.warn(`Type ${newFieldConfig.type} is not supported`);
    return state;
  }

  if (wasRuleGroup && !isRuleGroup) {
    state = state.setIn(expandTreePath(path, "type"), "rule");
    state = state.deleteIn(expandTreePath(path, "children1"));
    state = state.setIn(expandTreePath(path, "properties"), new Immutable.OrderedMap());
  }

  if (isRuleGroup) {
    state = state.setIn(expandTreePath(path, "type"), "rule_group");
    let groupProperties = defaultGroupProperties(config).merge({
      field: newField,
    });
    state = state.setIn(expandTreePath(path, "properties"), groupProperties);
    state = state.setIn(expandTreePath(path, "children1"), new Immutable.OrderedMap());
    state = addItem(state, path, "rule", uuid(), defaultRuleProperties(config, newField));
    state = fixPathsInTree(state);

    return state;
  }

  return state.updateIn(expandTreePath(path, "properties"), (map) => map.withMutations((current) => {
    const currentOperator = current.get("operator");
    const currentOperatorOptions = current.get("operatorOptions");
    const _currentField = current.get("field");
    const _currentValue = current.get("value");
    const _currentValueSrc = current.get("valueSrc", new Immutable.List());
    const _currentValueType = current.get("valueType", new Immutable.List());

    // If the newly selected field supports the same operator the rule currently
    // uses, keep it selected.
    const lastOp = newFieldConfig && newFieldConfig.operators.indexOf(currentOperator) !== -1 ? currentOperator : null;
    let newOperator = null;
    const availOps = getOperatorsForField(config, newField);
    if (availOps && availOps.length == 1)
      newOperator = availOps[0];
    else if (availOps && availOps.length > 1) {
      for (let strategy of setOpOnChangeField || []) {
        if (strategy == "keep")
          newOperator = lastOp;
        else if (strategy == "default")
          newOperator = defaultOperator(config, newField, false);
        else if (strategy == "first")
          newOperator = getFirstOperator(config, newField);
        if (newOperator) //found op for strategy
          break;
      }
    }

    const {canReuseValue, newValue, newValueSrc, newValueType, newValueError} = getNewValueForFieldOp(
      config, config, current, newField, newOperator, "field", true
    );
    if (showErrorMessage) {
      current = current
        .set("valueError", newValueError);
    }
    const newOperatorOptions = canReuseValue ? currentOperatorOptions : defaultOperatorOptions(config, newOperator, newField);

    return current
      .set("field", newField)
      .set("operator", newOperator)
      .set("operatorOptions", newOperatorOptions)
      .set("value", newValue)
      .set("valueSrc", newValueSrc)
      .set("valueType", newValueType);
  }));
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {string} operator
 */
const setOperator = (state, path, newOperator, config) => {
  const {showErrorMessage} = config.settings;
  return state.updateIn(expandTreePath(path, "properties"), (map) => map.withMutations((current) => {
    const currentField = current.get("field");
    const currentOperatorOptions = current.get("operatorOptions");
    const _currentValue = current.get("value", new Immutable.List());
    const _currentValueSrc = current.get("valueSrc", new Immutable.List());
    const _currentOperator = current.get("operator");

    const {canReuseValue, newValue, newValueSrc, newValueType, newValueError} = getNewValueForFieldOp(
      config, config, current, currentField, newOperator, "operator", true
    );
    if (showErrorMessage) {
      current = current
        .set("valueError", newValueError);
    }
    const newOperatorOptions = canReuseValue ? currentOperatorOptions : defaultOperatorOptions(config, newOperator, currentField);

    return current
      .set("operator", newOperator)
      .set("operatorOptions", newOperatorOptions)
      .set("value", newValue)
      .set("valueSrc", newValueSrc)
      .set("valueType", newValueType);
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
  const {fieldSeparator, showErrorMessage} = config.settings;
  const valueSrc = state.getIn(expandTreePath(path, "properties", "valueSrc", delta + "")) || null;
  if (valueSrc === "field" && Array.isArray(value))
    value = value.join(fieldSeparator);

  const field = state.getIn(expandTreePath(path, "properties", "field")) || null;
  const operator = state.getIn(expandTreePath(path, "properties", "operator")) || null;

  const isEndValue = false;
  const canFix = false;
  const calculatedValueType = valueType || calculateValueType(value, valueSrc, config);
  const [validateError, fixedValue] = validateValue(config, field, field, operator, value, calculatedValueType, valueSrc, canFix, isEndValue);
    
  const isValid = !validateError;
  if (isValid && fixedValue !== value) {
    // eg, get exact value from listValues (not string)
    value = fixedValue;
  }

  // Additional validation for range values
  if (showErrorMessage) {
    const w = getWidgetForFieldOp(config, field, operator, valueSrc);
    const fieldWidgetDefinition = getFieldWidgetConfig(config, field, operator, w, valueSrc);
    const operatorConfig = getOperatorConfig(config, operator, field);
    const operatorCardinality = operator ? defaultValue(operatorConfig.cardinality, 1) : null;
    const valueSrcs = Array.from({length: operatorCardinality}, (_, i) => (state.getIn(expandTreePath(path, "properties", "valueSrc", i + "")) || null));
        
    if (operatorConfig && operatorConfig.validateValues && valueSrcs.filter(vs => vs == "value" || vs == null).length == operatorCardinality) {
      const values = Array.from({length: operatorCardinality}, (_, i) => (i == delta ? value : state.getIn(expandTreePath(path, "properties", "value", i + "")) || null));
      const jsValues = fieldWidgetDefinition && fieldWidgetDefinition.toJS ? values.map(v => fieldWidgetDefinition.toJS(v, fieldWidgetDefinition)) : values;
      const rangeValidateError = operatorConfig.validateValues(jsValues);

      state = state.setIn(expandTreePath(path, "properties", "valueError", operatorCardinality), rangeValidateError);
    }
  }
    
  const lastValue = state.getIn(expandTreePath(path, "properties", "value", delta + ""));
  const lastError = state.getIn(expandTreePath(path, "properties", "valueError", delta));
  const isLastEmpty = lastValue == undefined;
  const isLastError = !!lastError;
  if (isValid || showErrorMessage) {
    // set only good value
    if (typeof value === "undefined") {
      state = state.setIn(expandTreePath(path, "properties", "value", delta + ""), undefined);
      state = state.setIn(expandTreePath(path, "properties", "valueType", delta + ""), null);
    } else {
      state = state.setIn(expandTreePath(path, "properties", "value", delta + ""), value);
      state = state.setIn(expandTreePath(path, "properties", "valueType", delta + ""), calculatedValueType);
      state.__isInternalValueChange = __isInternal && !isLastEmpty && !isLastError;
    }
  }
  if (showErrorMessage) {
    state = state.setIn(expandTreePath(path, "properties", "valueError", delta), validateError);
  }
  if (__isInternal && (isValid && isLastError || !isValid && !isLastError)) {
    state = state.setIn(expandTreePath(path, "properties", "valueError", delta), validateError);
    state.__isInternalValueChange = false;
  }

  return state;
};

/**
 * @param {Immutable.Map} state
 * @param {Immutable.List} path
 * @param {integer} delta
 * @param {*} srcKey
 */
const setValueSrc = (state, path, delta, srcKey, config) => {
  const {showErrorMessage} = config.settings;

  state = state.setIn(expandTreePath(path, "properties", "value", delta + ""), undefined);
  state = state.setIn(expandTreePath(path, "properties", "valueType", delta + ""), null);

  if (showErrorMessage) {
    // clear value error
    state = state.setIn(expandTreePath(path, "properties", "valueError", delta), null);

    // if current operator is range, clear possible range error
    const field = state.getIn(expandTreePath(path, "properties", "field")) || null;
    const operator = state.getIn(expandTreePath(path, "properties", "operator")) || null;
    const operatorConfig = getOperatorConfig(config, operator, field);
    const operatorCardinality = operator ? defaultValue(operatorConfig.cardinality, 1) : null;
    if (operatorConfig.validateValues) {
      state = state.setIn(expandTreePath(path, "properties", "valueError", operatorCardinality), null);
    }
  }
    
  if (typeof srcKey === "undefined") {
    state = state.setIn(expandTreePath(path, "properties", "valueSrc", delta + ""), null);
  } else {
    state = state.setIn(expandTreePath(path, "properties", "valueSrc", delta + ""), srcKey);
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
  return state.setIn(expandTreePath(path, "properties", "operatorOptions", name), value);
};


/**
 * 
 */
const calculateValueType = (value, valueSrc, config) => {
  let calculatedValueType = null;
  if (value) {
    if (valueSrc === "field") {
      const fieldConfig = getFieldConfig(value, config);
      if (fieldConfig) {
        calculatedValueType = fieldConfig.type;
      }
    } else if (valueSrc === "func") {
      const funcKey = value.get("func");
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
      return Object.assign({}, state, {...unset}, {tree: addItem(state.tree, action.path, "group", action.id, action.properties)});

    case constants.REMOVE_GROUP:
      return Object.assign({}, state, {...unset}, {tree: removeGroup(state.tree, action.path, action.config)});

    case constants.ADD_RULE:
      return Object.assign({}, state, {...unset}, {tree: addItem(state.tree, action.path, "rule", action.id, action.properties)});

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

    case constants.SET_VALUE: {
      let set = {};
      const tree = setValue(state.tree, action.path, action.delta, action.value, action.valueType, action.config, action.__isInternal);
      if (tree.__isInternalValueChange)
        set.__isInternalValueChange = true;
      return Object.assign({}, state, {...unset, ...set}, {tree});
    }

    case constants.SET_VALUE_SRC:
      return Object.assign({}, state, {...unset}, {tree: setValueSrc(state.tree, action.path, action.delta, action.srcKey, action.config)});

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
