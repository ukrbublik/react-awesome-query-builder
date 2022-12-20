import {
  getFieldConfig, getOperatorConfig, getFieldWidgetConfig, getFuncConfig,
} from "./configUtils";
import {getOperatorsForField, getWidgetForFieldOp, getNewValueForFieldOp} from "../utils/ruleUtils";
import {defaultValue, deepEqual, logger} from "../utils/stuff";
import {getItemInListValues} from "../utils/listValues";
import {defaultOperatorOptions} from "../utils/defaultUtils";
import {fixPathsInTree} from "../utils/treeUtils";
import omit from "lodash/omit";
import { List } from "immutable";


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

export const validateAndFixTree = (newTree, _oldTree, newConfig, oldConfig) => {
  let tree = validateTree(newTree, _oldTree, newConfig, oldConfig);
  tree = fixPathsInTree(tree);
  return tree;
};

export const validateTree = (tree, _oldTree, config, oldConfig, removeEmptyGroups, removeIncompleteRules) => {
  if (removeEmptyGroups === undefined) {
    removeEmptyGroups = config.settings.removeEmptyGroupsOnLoad;
  }
  if (removeIncompleteRules === undefined) {
    removeIncompleteRules = config.settings.removeIncompleteRulesOnLoad;
  }
  const c = {
    config, oldConfig, removeEmptyGroups, removeIncompleteRules
  };
  return validateItem(tree, [], null, {}, c);
};

function validateItem (item, path, itemId, meta, c) {
  const type = item.get("type");
  const children = item.get("children1");

  if ((type === "group" || type === "rule_group" || type == "case_group" || type == "switch_group") && children && children.size) {
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
  const {removeIncompleteRules, config, oldConfig} = c;
  const {showErrorMessage} = config.settings;
  let id = item.get("id");
  let properties = item.get("properties");
  let field = properties.get("field") || null;
  let operator = properties.get("operator") || null;
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
  let _wasValid = field && operator && value && !value.includes(undefined);

  if (!id && itemId) {
    id = itemId;
    item = item.set("id", id);
    meta.sanitized = true;
  }

  //validate field
  const fieldDefinition = field ? getFieldConfig(config, field) : null;
  if (field && !fieldDefinition) {
    logger.warn(`No config for field ${field}`);
    field = null;
  }
  if (field == null) {
    properties = ["operator", "operatorOptions", "valueSrc", "value"].reduce((map, key) => map.delete(key), properties);
    operator = null;
  }

  //validate operator
  // Backward compatibility: obsolete operator range_between
  if (operator == "range_between" || operator == "range_not_between") {
    operator = operator == "range_between" ? "between" : "not_between";
    console.info(`Fixed operator ${properties.get("operator")} to ${operator}`);
    properties = properties.set("operator", operator);
  }
  const operatorDefinition = operator ? getOperatorConfig(config, operator, field) : null;
  if (operator && !operatorDefinition) {
    console.warn(`No config for operator ${operator}`);
    operator = null;
  }
  const availOps = field ? getOperatorsForField(config, field) : [];
  if (!availOps) {
    console.warn(`Type of field ${field} is not supported`);
    operator = null;
  } else if (operator && availOps.indexOf(operator) == -1) {
    if (operator == "is_empty" || operator == "is_not_empty") {
      // Backward compatibility: is_empty #494
      operator = operator == "is_empty" ? "is_null" : "is_not_null";
      console.info(`Fixed operator ${properties.get("operator")} to ${operator} for ${field}`);
      properties = properties.set("operator", operator);
    } else {
      console.warn(`Operator ${operator} is not supported for field ${field}`);
      operator = null;
    }
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
  const canFix = !showErrorMessage;
  const isEndValue = true;
  let {newValue, newValueSrc, newValueError} = getNewValueForFieldOp(config, oldConfig, properties, field, operator, null, canFix, isEndValue);
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
  const isComplete = field && operator && value && !value.includes(undefined);
  if (sanitized)
    meta.sanitized = true;
  if (!isComplete && removeIncompleteRules)
    item = undefined;
  else if (sanitized)
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
export const validateValue = (config, leftField, field, operator, value, valueType, valueSrc, asyncListValues, canFix = false, isEndValue = false, isRawValue = true) => {
  let validError = null;
  let fixedValue = value;

  if (value != null) {
    if (valueSrc == "field") {
      [validError, fixedValue] = validateFieldValue(leftField, field, value, valueSrc, valueType, asyncListValues, config, operator, isEndValue, canFix);
    } else if (valueSrc == "func") {
      [validError, fixedValue] = validateFuncValue(leftField, field, value, valueSrc, valueType, asyncListValues, config, operator, isEndValue, canFix);
    } else if (valueSrc == "value" || !valueSrc) {
      [validError, fixedValue] = validateNormalValue(leftField, field, value, valueSrc, valueType, asyncListValues, config, operator, isEndValue, canFix);
    }

    if (!validError) {
      const fieldConfig = getFieldConfig(config, field);
      const w = getWidgetForFieldOp(config, field, operator, valueSrc);
      const operatorDefinition = operator ? getOperatorConfig(config, operator, field) : null;
      const fieldWidgetDefinition = omit(getFieldWidgetConfig(config, field, operator, w, valueSrc), ["factory"]);
      const rightFieldDefinition = (valueSrc == "field" ? getFieldConfig(config, value) : null);
      const fieldSettings = fieldWidgetDefinition; // widget definition merged with fieldSettings

      const fn = fieldWidgetDefinition.validateValue;
      if (typeof fn == "function") {
        const args = [
          fixedValue, 
          fieldSettings,
          operator,
          operatorDefinition
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
  
  return [validError, fixedValue];
};

const validateValueInList = (value, listValues, canFix, isEndValue, removeInvalidMultiSelectValuesOnLoad) => {
  const values = List.isList(value) ? value.toJS() : (value instanceof Array ? [...value] : undefined);
  if (values) {
    const [goodValues, badValues] = values.reduce(([goodVals, badVals], val) => {
      const vv = getItemInListValues(listValues, val);
      if (vv == undefined) {
        return [goodVals, [...badVals, val]];
      } else {
        return [[...goodVals, vv.value], badVals];
      }
    }, [[], []]);
    const plural = badValues.length > 1;
    const err = badValues.length ? `${plural ? "Values" : "Value"} ${badValues.join(", ")} ${plural ? "are" : "is"} not in list of values` : null;
    // always remove bad values at tree validation as user can't unselect them (except AntDesign widget)
    if (removeInvalidMultiSelectValuesOnLoad !== undefined) {
      canFix = removeInvalidMultiSelectValuesOnLoad;
    } else {
      canFix = canFix || isEndValue;
    }
    return [err, canFix ? goodValues : value];
  } else {
    const vv = getItemInListValues(listValues, value);
    if (vv == undefined) {
      return [`Value ${value} is not in list of values`, value];
    } else {
      value = vv.value;
    }
    return [null, value];
  }
};

/**
* 
*/
const validateNormalValue = (leftField, field, value, valueSrc, valueType, asyncListValues, config, operator = null, isEndValue = false, canFix = false) => {
  if (field) {
    const fieldConfig = getFieldConfig(config, field);
    const w = getWidgetForFieldOp(config, field, operator, valueSrc);
    const wConfig = config.widgets[w];
    const wType = wConfig.type;
    const jsType = wConfig.jsType;
    const fieldSettings = fieldConfig.fieldSettings;

    if (valueType && valueType != wType)
      return [`Value should have type ${wType}, but got value of type ${valueType}`, value];
    if (jsType && !isTypeOf(value, jsType) && !fieldSettings.listValues) { //tip: can skip tye check for listValues
      return [`Value should have JS type ${jsType}, but got value of type ${typeof value}`, value];
    }

    if (fieldSettings) {
      const listValues = asyncListValues || fieldSettings.listValues;
      if (listValues && !fieldSettings.allowCustomValues) {
        return validateValueInList(value, listValues, canFix, isEndValue, config.settings.removeInvalidMultiSelectValuesOnLoad);
      }
      if (fieldSettings.min != null && value < fieldSettings.min) {
        return [`Value ${value} < min ${fieldSettings.min}`, canFix ? fieldSettings.min : value];
      }
      if (fieldSettings.max != null && value > fieldSettings.max) {
        return [`Value ${value} > max ${fieldSettings.max}`, canFix ? fieldSettings.max : value];
      }
    }
  }

  return [null, value];
};


/**
* 
*/
const validateFieldValue = (leftField, field, value, _valueSrc, valueType, asyncListValues, config, operator = null, isEndValue = false, canFix = false) => {
  const {fieldSeparator} = config.settings;
  const isFuncArg = typeof field == "object" && field?._isFuncArg;
  const leftFieldStr = Array.isArray(leftField) ? leftField.join(fieldSeparator) : leftField;
  const rightFieldStr = Array.isArray(value) ? value.join(fieldSeparator) : value;
  const rightFieldDefinition = getFieldConfig(config, value);
  if (!rightFieldDefinition)
    return [`Unknown field ${value}`, value];
  if (rightFieldStr == leftFieldStr && !isFuncArg)
    return [`Can't compare field ${leftField} with itself`, value];
  if (valueType && valueType != rightFieldDefinition.type)
    return [`Field ${value} is of type ${rightFieldDefinition.type}, but expected ${valueType}`, value];
  return [null, value];
};

/**
* 
*/
const validateFuncValue = (leftField, field, value, _valueSrc, valueType, asyncListValues, config, operator = null, isEndValue = false, canFix = false) => {
  let fixedValue = value;

  if (value) {
    const funcKey = value.get("func");
    if (funcKey) {
      const funcConfig = getFuncConfig(config, funcKey);
      if (funcConfig) {
        if (valueType && funcConfig.returnType != valueType)
          return [`Function ${funcKey} should return value of type ${funcConfig.returnType}, but got ${valueType}`, value];
        for (const argKey in funcConfig.args) {
          const argConfig = funcConfig.args[argKey];
          const args = fixedValue.get("args");
          const argVal = args ? args.get(argKey) : undefined;
          const fieldDef = getFieldConfig(config, argConfig);
          const argValue = argVal ? argVal.get("value") : undefined;
          const argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
          if (argValue !== undefined) {
            const [argValidError, fixedArgVal] = validateValue(
              config, leftField, fieldDef, operator, argValue, argConfig.type, argValueSrc, asyncListValues, canFix, isEndValue, false
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
