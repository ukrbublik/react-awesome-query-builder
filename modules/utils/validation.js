import {
  getFieldConfig, getOperatorsForField, getOperatorConfig, 
  getWidgetForFieldOp, getFieldWidgetConfig, getFuncConfig, getValueSourcesForFieldOp,
} from "./configUtils";
import {defaultValue, deepEqual, getTitleInListValues, getValueInListValues, getItemInListValues} from "../utils/stuff";
import {defaultOperatorOptions} from "../utils/defaultUtils";
import omit from "lodash/omit";
import Immutable from "immutable";


const typeOf = (v) => {
  if (typeof v == "object" && v !== null && Array.isArray(v))
    return "array";
  else
    return (typeof v);
};

const isTypeOf = (v, type) => {
  if (typeOf(v) == type)
    return true;
  if (type == "number" && !isNaN(v))
    return true; //can be casted
  return false;
};

export const validateTree = (tree, _oldTree, config, oldConfig, removeEmptyGroups = false, removeInvalidRules = false) => {
  const c = {
    config, oldConfig, removeEmptyGroups, removeInvalidRules
  };
  return validateItem(tree, [], null, {}, c);
};

function validateItem (item, path, itemId, meta, c) {
  const type = item.get("type");
  const children = item.get("children1");

  if ((type === "group" || type === "rule_group") && children && children.size) {
    return validateGroup(item, path, itemId, meta, c);
  } else if (type === "rule") {
    return validateRule(item, path, itemId, meta, c);
  } else {
    return item;
  }
}

function validateGroup (item, path, itemId, meta, c) {
  const {removeEmptyGroups} = c;
  let id = item.get("id");
  let children = item.get("children1");
  const oldChildren = children;

  if (!id && itemId) {
    id = itemId;
    item = item.set("id", id);
    meta.sanitized = true;
  }

  //validate children
  let submeta = {};
  children = children
    .map( (currentChild, childId) => validateItem(currentChild, path.concat(id), childId, submeta, c) );
  if (removeEmptyGroups)
    children = children.filter((currentChild) => (currentChild != undefined));
  let sanitized = submeta.sanitized || (oldChildren.size != children.size);
  if (!children.size && removeEmptyGroups && path.length) {
    sanitized = true;
    item = undefined;
  }

  if (sanitized)
    meta.sanitized = true;
  if (sanitized && item)
    item = item.set("children1", children);
  return item;
}


function validateRule (item, path, itemId, meta, c) {
  const {removeInvalidRules, config, oldConfig} = c;
  const {showErrorMessage} = config.settings;
  let id = item.get("id");
  let properties = item.get("properties");
  let field = properties.get("field");
  let operator = properties.get("operator");
  let operatorOptions = properties.get("operatorOptions");
  let valueSrc = properties.get("valueSrc");
  let value = properties.get("value");
  let valueError = properties.get("valueError");
  const oldSerialized = {
    field,
    operator,
    operatorOptions: operatorOptions ? operatorOptions.toJS() : {},
    valueSrc: valueSrc ? valueSrc.toJS() : null,
    value: value ? value.toJS() : null,
    valueError: valueError ? valueError.toJS() : null,
  };
  let _wasValid = field && operator && value && !value.find((v, ind) => (v === undefined));

  if (!id && itemId) {
    id = itemId;
    item = item.set("id", id);
    meta.sanitized = true;
  }

  //validate field
  const fieldDefinition = field ? getFieldConfig(field, config) : null;
  if (!fieldDefinition)
    field = null;
  if (field == null) {
    properties = ["operator", "operatorOptions", "valueSrc", "value"].reduce((map, key) => map.delete(key), properties);
    operator = null;
  }

  //validate operator
  operator = properties.get("operator");
  if (operator == "range_between" || operator == "range_not_between") {
    // fix obsolete operators
    operator = operator == "range_between" ? "between" : "not_between";
    properties = properties.set("operator", operator);
  }
  const operatorDefinition = operator ? getOperatorConfig(config, operator, field) : null;
  if (!operatorDefinition)
    operator = null;
  const availOps = field ? getOperatorsForField(config, field) : [];
  if (!availOps) {
    console.warn(`Type of field ${field} is not supported`);
    operator = null;
  } else if (availOps.indexOf(operator) == -1) {
    operator = null;
  }
  if (operator == null) {
    properties = properties.delete("operatorOptions");
    properties = properties.delete("valueSrc");
    properties = properties.delete("value");
  }

  //validate operator options
  operatorOptions = properties.get("operatorOptions");
  let _operatorCardinality = operator ? defaultValue(operatorDefinition.cardinality, 1) : null;
  if (!operator || operatorOptions && !operatorDefinition.options) {
    operatorOptions = null;
    properties = properties.delete("operatorOptions");
  } else if (operator && !operatorOptions && operatorDefinition.options) {
    operatorOptions = defaultOperatorOptions(config, operator, field);
    properties = properties.set("operatorOptions", operatorOptions);
  }

  //validate values
  valueSrc = properties.get("valueSrc");
  value = properties.get("value");
  let {newValue, newValueSrc, newValueError} = getNewValueForFieldOp(config, oldConfig, properties, field, operator, null, true);
  value = newValue;
  valueSrc = newValueSrc;
  valueError = newValueError;
  properties = properties.set("value", value);
  properties = properties.set("valueSrc", valueSrc);
  if (showErrorMessage) {
    properties = properties.set("valueError", valueError);
  }

  const newSerialized = {
    field,
    operator,
    operatorOptions: operatorOptions ? operatorOptions.toJS() : {},
    valueSrc: valueSrc ? valueSrc.toJS() : null,
    value: value ? value.toJS() : null,
    valueError: valueError ? valueError.toJS() : null,
  };
  const sanitized = !deepEqual(oldSerialized, newSerialized);
  const isValid = field && operator && value && !value.find((v, _ind) => (v === undefined));
  if (sanitized)
    meta.sanitized = true;

  if (sanitized && !isValid && removeInvalidRules)
    item = undefined;
  if (sanitized && item)
    item = item.set("properties", properties);

  return item;
}


/**
 * 
 * @param {bool} canFix true is useful for func values to remove bad args
 * @param {bool} isEndValue false if value is in process of editing by user
 * @param {bool} isRawValue false is used only internally from validateFuncValue
 * @return {array} [validError, fixedValue] - if validError === null and canFix == true, fixedValue can differ from value if was fixed
 */
export const validateValue = (config, leftField, field, operator, value, valueType, valueSrc, canFix = false, isEndValue = false, isRawValue = true) => {
  let validError = null;
  let fixedValue = value;

  if (value != null) {
    if (valueSrc == "field") {
      [validError, fixedValue] = validateFieldValue(leftField, field, value, valueSrc, valueType, config, operator, isEndValue, canFix);
    } else if (valueSrc == "func") {
      [validError, fixedValue] = validateFuncValue(leftField, field, value, valueSrc, valueType, config, operator, isEndValue, canFix);
    } else if (valueSrc == "value" || !valueSrc) {
      [validError, fixedValue] = validateNormalValue(leftField, field, value, valueSrc, valueType, config, operator, isEndValue, canFix);
    }

    if (!validError) {
      const fieldConfig = getFieldConfig(field, config);
      const w = getWidgetForFieldOp(config, field, operator, valueSrc);
      const fieldWidgetDefinition = omit(getFieldWidgetConfig(config, field, operator, w, valueSrc), ["factory"]);
      const rightFieldDefinition = (valueSrc == "field" ? getFieldConfig(value, config) : null);
      const fieldSettings = fieldWidgetDefinition; // widget definition merged with fieldSettings

      const fn = fieldWidgetDefinition.validateValue;
      if (typeof fn == "function") {
        const args = [
          fixedValue, 
          fieldSettings,
        ];
        if (valueSrc == "field")
          args.push(rightFieldDefinition);
        const validResult = fn(...args);
        if (typeof validResult == "boolean") {
          if (validResult == false)
            validError = "Invalid value";
        } else {
          validError = validResult;
        }
      }
    }
  }

  if (isRawValue && validError) {
    console.warn("[RAQB validate]", `Field ${field}: ${validError}`);
  }

  return [validError, validError ? value : fixedValue];
};

/**
* 
*/
const validateNormalValue = (leftField, field, value, valueSrc, valueType, config, operator = null, isEndValue = false, canFix = false) => {
  let fixedValue = value;
  const fieldConfig = getFieldConfig(field, config);
  const w = getWidgetForFieldOp(config, field, operator, valueSrc);
  const wConfig = config.widgets[w];
  const wType = wConfig.type;
  const jsType = wConfig.jsType;
  const fieldSettings = fieldConfig.fieldSettings;

  if (valueType != wType)
    return [`Value should have type ${wType}, but got value of type ${valueType}`, value];
  if (jsType && !isTypeOf(value, jsType) && !fieldSettings.listValues) { //tip: can skip tye check for listValues
    return [`Value should have JS type ${jsType}, but got value of type ${typeof value}`, value];
  }

  if (fieldSettings) {
    if (fieldSettings.listValues && !fieldSettings.allowCustomValues) {
      if (value instanceof Array) {
        for (let i = 0 ; i < value.length ; i++) {
          const vv = getItemInListValues(fieldSettings.listValues, value[i]);
          if (vv == undefined) {
            return [`Value ${value[i]} is not in list of values`, value];
          } else {
            value[i] = vv.value;
          }
        }
      } else {
        const vv = getItemInListValues(fieldSettings.listValues, value);
        if (vv == undefined) {
          return [`Value ${value} is not in list of values`, value];
        } else {
          value = vv.value;
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
const validateFieldValue = (leftField, field, value, _valueSrc, valueType, config, operator = null, isEndValue = false, canFix = false) => {
  const {fieldSeparator} = config.settings;
  const leftFieldStr = Array.isArray(leftField) ? leftField.join(fieldSeparator) : leftField;
  const rightFieldStr = Array.isArray(value) ? value.join(fieldSeparator) : value;
  const rightFieldDefinition = getFieldConfig(value, config);
  if (!rightFieldDefinition)
    return [`Unknown field ${value}`, value];
  if (rightFieldStr == leftFieldStr)
    return [`Can't compare field ${leftField} with itself`, value];
  if (valueType && valueType != rightFieldDefinition.type)
    return [`Field ${value} is of type ${rightFieldDefinition.type}, but expected ${valueType}`, value];
  return [null, value];
};

/**
* 
*/
const validateFuncValue = (leftField, field, value, _valueSrc, valueType, config, operator = null, isEndValue = false, canFix = false) => {
  let fixedValue = value;

  if (value) {
    const funcKey = value.get("func");
    if (funcKey) {
      const funcConfig = getFuncConfig(funcKey, config);
      if (funcConfig) {
        if (valueType && funcConfig.returnType != valueType)
          return [`Function ${funcKey} should return value of type ${funcConfig.returnType}, but got ${valueType}`, value];
        for (const argKey in funcConfig.args) {
          const argConfig = funcConfig.args[argKey];
          const args = fixedValue.get("args");
          const argVal = args ? args.get(argKey) : undefined;
          const fieldDef = getFieldConfig(argConfig, config);
          const argValue = argVal ? argVal.get("value") : undefined;
          const argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
          if (argValue !== undefined) {
            const [argValidError, fixedArgVal] = validateValue(
              config, leftField, fieldDef, operator, argValue, argConfig.type, argValueSrc, canFix, isEndValue, false
            );
            if (argValidError !== null) {
              if (canFix) {
                fixedValue = fixedValue.deleteIn(["args", argKey]);
                if (argConfig.defaultValue !== undefined) {
                  fixedValue = fixedValue.setIn(["args", argKey, "value"], argConfig.defaultValue);
                  fixedValue = fixedValue.setIn(["args", argKey, "valueSrc"], "value");
                }
              } else {
                return [`Invalid value of arg ${argKey} for func ${funcKey}: ${argValidError}`, value];
              }
            } else if (fixedArgVal !== argValue) {
              fixedValue = fixedValue.setIn(["args", argKey, "value"], fixedArgVal);
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
 * @param {object} config
 * @param {object} oldConfig
 * @param {Immutable.Map} current
 * @param {string} newField
 * @param {string} newOperator
 * @param {string} changedField
 * @return {object} - {canReuseValue, newValue, newValueSrc, newValueType, newValueError}
 */
export const getNewValueForFieldOp = function (config, oldConfig = null, current, newField, newOperator, changedField = null, canFix = true) {
  if (!oldConfig)
    oldConfig = config;
  const currentField = current.get("field");
  const currentOperator = current.get("operator");
  const currentValue = current.get("value");
  const currentValueSrc = current.get("valueSrc", new Immutable.List());
  const currentValueType = current.get("valueType", new Immutable.List());

  //const isValidatingTree = (changedField === null);
  const {convertableWidgets, clearValueOnChangeField, clearValueOnChangeOp, showErrorMessage} = config.settings;

  //const currentOperatorConfig = getOperatorConfig(oldConfig, currentOperator, currentField);
  const newOperatorConfig = getOperatorConfig(config, newOperator, newField);
  //const currentOperatorCardinality = currentOperator ? defaultValue(currentOperatorConfig.cardinality, 1) : null;
  const operatorCardinality = newOperator ? defaultValue(newOperatorConfig.cardinality, 1) : null;
  const currentFieldConfig = getFieldConfig(currentField, oldConfig);
  const newFieldConfig = getFieldConfig(newField, config);

  let canReuseValue = currentField && currentOperator && newOperator 
    && (!changedField 
      || changedField == "field" && !clearValueOnChangeField 
      || changedField == "operator" && !clearValueOnChangeOp)
    && (currentFieldConfig && newFieldConfig && currentFieldConfig.type == newFieldConfig.type);

  // compare old & new widgets
  for (let i = 0 ; i < operatorCardinality ; i++) {
    const vs = currentValueSrc.get(i) || null;
    const currentWidget = getWidgetForFieldOp(oldConfig, currentField, currentOperator, vs);
    const newWidget = getWidgetForFieldOp(config, newField, newOperator, vs);
    // need to also check value widgets if we changed operator and current value source was 'field'
    // cause for select type op '=' requires single value and op 'in' requires array value
    const currentValueWidget = vs == "value" ? currentWidget : getWidgetForFieldOp(oldConfig, currentField, currentOperator, "value");
    const newValueWidget = vs == "value" ? newWidget : getWidgetForFieldOp(config, newField, newOperator, "value");

    const canReuseWidget = newValueWidget == currentValueWidget || (convertableWidgets[currentValueWidget] || []).includes(newValueWidget);
    if (!canReuseWidget)
      canReuseValue = false;
  }

  if (currentOperator != newOperator && [currentOperator, newOperator].includes("proximity"))
    canReuseValue = false;

  const firstWidgetConfig = getFieldWidgetConfig(config, newField, newOperator, null, currentValueSrc.first());
  const valueSources = getValueSourcesForFieldOp(config, newField, newOperator);

  let valueFixes = {};
  let valueErrors = Array.from({length: operatorCardinality}, () => null);
  if (canReuseValue) {
    for (let i = 0 ; i < operatorCardinality ; i++) {
      const v = currentValue.get(i);
      const vType = currentValueType.get(i) || null;
      const vSrc = currentValueSrc.get(i) || null;
      let isValidSrc = (valueSources.find(v => v == vSrc) != null);
      if (!isValidSrc && i > 0 && vSrc == null)
        isValidSrc = true; // make exception for range widgets (when changing op from '==' to 'between')
      const isEndValue = !canFix;
      const [validateError, fixedValue] = validateValue(config, newField, newField, newOperator, v, vType, vSrc, canFix, isEndValue);
      const isValid = !validateError;
      if (!isValid && showErrorMessage && changedField != "field") {
        // allow bad value
        // but not on field change - in that case just drop bad value that can't be reused
        // ? maybe we should also drop bad value on op change?
        valueErrors[i] = validateError;
      } else if (!isValidSrc || !isValid) {
        canReuseValue = false;
        break;
      } else if (canFix && fixedValue !== v) {
        valueFixes[i] = fixedValue;
      }
    }
  }

  let newValue = null, newValueSrc = null, newValueType = null, newValueError = null;
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
  if (showErrorMessage) {
    if (newOperatorConfig && newOperatorConfig.validateValues && newValueSrc.toJS().filter(vs => vs == "value" || vs == null).length == operatorCardinality) {
      // last element in `valueError` list is for range validation error
      const jsValues = firstWidgetConfig && firstWidgetConfig.toJS 
        ? newValue.toJS().map(v => firstWidgetConfig.toJS(v, firstWidgetConfig)) 
        : newValue.toJS();
      const rangeValidateError = newOperatorConfig.validateValues(jsValues);
      if (showErrorMessage) {
        valueErrors.push(rangeValidateError);
      }
    }
    newValueError = new Immutable.List(valueErrors);
  }
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

  return {canReuseValue, newValue, newValueSrc, newValueType, newValueError};
};