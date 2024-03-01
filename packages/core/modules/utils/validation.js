import {
  getFieldConfig, getOperatorConfig, getFieldWidgetConfig, getFuncConfig, getFieldSrc,
  extendConfig} from "./configUtils";
import {getOperatorsForField, getWidgetForFieldOp, getNewValueForFieldOp, whatRulePropertiesAreCompleted} from "../utils/ruleUtils";
import {defaultValue, deepEqual} from "../utils/stuff";
import {getItemInListValues} from "../utils/listValues";
import {defaultOperatorOptions} from "../utils/defaultUtils";
import {fixPathsInTree} from "../utils/treeUtils";
import {setFuncDefaultArg} from "../utils/funcUtils";
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

export const validateTree = (tree, config) => {
  if (!tree) return undefined;
  const extendedConfig = extendConfig(config, undefined, true);
  const removeEmptyGroups = false;
  const removeIncompleteRules = false;
  return _validateTree(tree, null, extendedConfig, extendedConfig, removeEmptyGroups, removeIncompleteRules, true);
};

export const sanitizeTree = (tree, config) => {
  if (!tree) return undefined;
  const extendedConfig = extendConfig(config, undefined, true);
  const removeEmptyGroups = config.settings.removeEmptyGroupsOnLoad;
  const removeIncompleteRules = config.settings.removeIncompleteRulesOnLoad;
  return _validateTree(tree, null, extendedConfig, extendedConfig, removeEmptyGroups, removeIncompleteRules, false);
};

export const validateAndFixTree = (newTree, _oldTree, newConfig, oldConfig, removeEmptyGroups, removeIncompleteRules) => {
  if (removeEmptyGroups === undefined) {
    removeEmptyGroups = newConfig.settings.removeEmptyGroupsOnLoad;
  }
  if (removeIncompleteRules === undefined) {
    removeIncompleteRules = newConfig.settings.removeIncompleteRulesOnLoad;
  }
  let tree = _validateTree(newTree, _oldTree, newConfig, oldConfig, removeEmptyGroups, removeIncompleteRules, false);
  tree = fixPathsInTree(tree);
  return tree;
};

export const _validateTree = (tree, _oldTree, config, oldConfig, removeEmptyGroups, removeIncompleteRules, returnErrors) => {
  const c = {
    config, oldConfig, removeEmptyGroups, removeIncompleteRules, returnErrors
  };
  const meta = {
    errors: {},
  };
  const fixedTree = validateItem(tree, [], null, meta, c);
  return returnErrors ? meta.errors : fixedTree;
};

function addError(meta, item, err) {
  const id = item.get("id");
  if (!meta.errors[id]) {
    meta.errors[id] = [];
  }
  meta.errors[id].push(err);
}

function validateItem (item, path, itemId, meta, c) {
  const type = item.get("type");

  if ((type === "group" || type === "rule_group" || type == "case_group" || type == "switch_group")) {
    return validateGroup(item, path, itemId, meta, c);
  } else if (type === "rule") {
    return validateRule(item, path, itemId, meta, c);
  } else {
    return item;
  }
}

function validateGroup (item, path, itemId, meta, c) {
  const {removeEmptyGroups, config} = c;
  let id = item.get("id");
  let children = item.get("children1");
  const oldChildren = children;
  const type = item.get("type");
  const mode = item.getIn(["properties", "mode"]);
  const operator = item.getIn(["properties", "operator"]);
  const isGroupExt = type === "rule_group" && mode === "array";
  const isCase = type === "case_group";
  const cardinality = operator ? config.operators[operator]?.cardinality ?? 1 : undefined;
  // tip: for group operators some/none/all children ARE required, for group operator count children are NOT required
  // tip: default case should contain only value
  const childrenAreRequired = isCase ? false : (isGroupExt ? cardinality == 0 : true);

  if (!id && itemId) {
    id = itemId;
    item = item.set("id", id);
    meta.sanitized = true;
  }

  if (isGroupExt) {
    item = validateRule(item, path, itemId, meta, c);
  }

  //validate children
  let submeta = {
    errors: {}
  };
  children = children
    ?.map( (currentChild, childId) => validateItem(currentChild, path.concat(id), childId, submeta, c) );
  const nonEmptyChildren = children?.filter((currentChild) => (currentChild != undefined));
  if (removeEmptyGroups)
    children = nonEmptyChildren;
  let sanitized = submeta.sanitized || (oldChildren?.size != children?.size);
  const isEmptyChildren = !nonEmptyChildren?.size && path.length;
  if (isEmptyChildren && childrenAreRequired) {
    addError(meta, item, {
      str: "Empty group"
    });
    if (removeEmptyGroups) {
      item = undefined;
    }
  }

  if (sanitized)
    meta.sanitized = true;
  if (sanitized && item)
    item = item.set("children1", children);

  meta.errors = {
    ...meta.errors,
    ...(submeta?.errors || {}),
  };
  return item;
}

/**
 * @param {Immutable.Map} item
 * @returns {Immutable.Map}
 */
function validateRule (item, path, itemId, meta, c) {
  const {removeIncompleteRules, config, oldConfig} = c;
  const {showErrorMessage} = config.settings;
  const origItem = item;
  let id = item.get("id");
  let properties = item.get("properties");
  let field = properties.get("field") || null;
  let fieldSrc = properties.get("fieldSrc") || null;
  let operator = properties.get("operator") || null;
  let operatorOptions = properties.get("operatorOptions");
  let valueSrc = properties.get("valueSrc");
  let value = properties.get("value");
  let valueError = properties.get("valueError");
  let fieldError = properties.get("fieldError");

  const serializeRule = () => {
    return {
      field: field?.toJS?.() || field,
      fieldSrc,
      operator,
      operatorOptions: operatorOptions ? operatorOptions.toJS() : {},
      valueSrc: valueSrc ? valueSrc.toJS() : null,
      value: value ? value.toJS() : null,
      valueError: valueError ? valueError.toJS() : null,
      fieldError: fieldError ? fieldError : null,
    };
  };

  const oldSerialized = serializeRule();
  //const _wasValid = field && operator && value && !value.includes(undefined);

  if (!id && itemId) {
    id = itemId;
    item = item.set("id", id);
    meta.sanitized = true;
  }

  //validate field
  const fieldDefinition = field ? getFieldConfig(config, field) : null;
  if (field && !fieldDefinition) {
    addError(meta, item, {
      str: `No config for field ${field}`,
    });
    field = null;
  }
  if (field == null) {
    properties = [
      "operator", "operatorOptions", "valueSrc", "value", "valueError", "fieldError", "field"
    ].reduce((map, key) => map.delete(key), properties);
    operator = null;
  }
  if (!fieldSrc) {
    fieldSrc = getFieldSrc(field);
    properties = properties.set("fieldSrc", fieldSrc);
  }

  //validate operator
  // Backward compatibility: obsolete operator range_between
  if (operator == "range_between" || operator == "range_not_between") {
    operator = operator == "range_between" ? "between" : "not_between";
    addError(meta, item, {
      str: `Fixed operator ${properties.get("operator")} to ${operator}`,
      type: "fix"
    });
    properties = properties.set("operator", operator);
  }
  const operatorDefinition = operator ? getOperatorConfig(config, operator, field) : null;
  if (operator && !operatorDefinition) {
    addError(meta, item, {
      str: `No config for operator ${operator}`
    });
    operator = null;
  }
  const availOps = field ? getOperatorsForField(config, field) : [];
  if (field) {
    if (!availOps?.length) {
      addError(meta, item, {
        str: `Type of field ${field} is not supported`
      });
      operator = null;
    } else if (operator && availOps.indexOf(operator) == -1) {
      if (operator == "is_empty" || operator == "is_not_empty") {
        // Backward compatibility: is_empty #494
        operator = operator == "is_empty" ? "is_null" : "is_not_null";
        addError(meta, item, {
          str: `Fixed operator ${properties.get("operator")} to ${operator} for ${field}`,
          type: "fix"
        });
        properties = properties.set("operator", operator);
      } else {
        addError(meta, item, {
          str: `Operator ${operator} is not supported for field ${field}`
        });
        operator = null;
      }
    }
  }
  if (operator == null) {
    // do not unset operator ?
    properties = [
      "operatorOptions", "valueSrc", "value", "valueError"
    ].reduce((map, key) => map.delete(key), properties);
  }

  //validate operator options
  operatorOptions = properties.get("operatorOptions");
  //const _operatorCardinality = operator ? defaultValue(operatorDefinition.cardinality, 1) : null;
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
  let {
    newValue, newValueSrc, newValueError, validationErrors, newFieldError,
  } = getNewValueForFieldOp(config, oldConfig, properties, field, operator, null, canFix, isEndValue);
  value = newValue;
  valueSrc = newValueSrc;
  valueError = newValueError;
  fieldError = newFieldError;
  properties = properties.set("value", value);
  properties = properties.set("valueSrc", valueSrc);
  if (showErrorMessage) {
    properties = properties
      .set("valueError", valueError)
      .set("fieldError", fieldError);
  } else {
    properties = properties
      .delete("valueError")
      .delete("fieldError");
  }

  const newSerialized = serializeRule();
  const hasBeenSanitized = !deepEqual(oldSerialized, newSerialized);
  const compl = whatRulePropertiesAreCompleted(properties.toObject(), config);
  if (hasBeenSanitized)
    meta.sanitized = true;
  if (compl.score < 3) {
    let reason = "Incomplete rule";
    if (!compl.parts.field) {
      reason = "Incomplete LHS";
    } else if(!compl.parts.value) {
      reason = "Incomplete RHS";
      if (newSerialized.valueSrc?.[0] && newSerialized.valueSrc?.[0] != oldSerialized.valueSrc?.[0]) {
        // eg. operator `starts_with` supports only valueSrc "value"
        reason = `Bad value src ${newSerialized.valueSrc}`;
      }
    }
    addError(meta, item, {
      str: reason,
    });
    if (removeIncompleteRules) {
      item = undefined;
    }
  } else {
    if (hasBeenSanitized) {
      item = item.set("properties", properties);
    }
    if (validationErrors.length) {
      addError(meta, origItem, {
        str: validationErrors.map(({src, delta, str}) => str).join(". ")
      });
    }
  }
  return item;
}


/**
 * 
 * @param {bool} canFix true is useful for func values to remove bad args
 * @param {bool} isEndValue false if value is in process of editing by user
 * @return {array} [validationError, fixedValue] - if validationError === null and canFix == true, fixedValue can differ from value if was fixed
 */
export const validateValue = (
  config, leftField, field, operator, value, valueType, valueSrc, asyncListValues,
  canFix = false, isEndValue = false, canDropArgs = false
) => {
  let validationError = null;
  let fixedValue = value;

  if (value != null) {
    if (valueSrc == "field") {
      [validationError, fixedValue] = validateFieldValue(leftField, field, value, valueSrc, valueType, asyncListValues, config, operator, canFix, isEndValue);
    } else if (valueSrc == "func") {
      [validationError, fixedValue] = validateFuncValue(leftField, field, value, valueSrc, valueType, asyncListValues, config, operator, canFix, isEndValue, canDropArgs);
    } else if (valueSrc == "value" || !valueSrc) {
      [validationError, fixedValue] = validateNormalValue(field, value, valueSrc, valueType, asyncListValues, config, operator, canFix, isEndValue);
    }

    if (!validationError && field) {
      //const _fieldConfig = getFieldConfig(config, field);
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
        const validResult = fn.call(config.ctx, ...args);
        if (typeof validResult === "object" && validResult !== null && !Array.isArray(validResult)) {
          validationError = validResult.error;
          if (validResult.fixedValue !== undefined && canFix) {
            fixedValue = validResult.fixedValue;
          }
        } else if (typeof validResult === "boolean") {
          if (validResult == false)
            validationError = "Invalid value";
        } else {
          validationError = validResult;
        }
      }
    }
  }
  
  return [validationError, fixedValue];
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
const validateNormalValue = (field, value, valueSrc, valueType, asyncListValues, config, operator = null, canFix = false, isEndValue = false) => {
  if (field) {
    const fieldConfig = getFieldConfig(config, field);
    const w = getWidgetForFieldOp(config, field, operator, valueSrc);
    const wConfig = config.widgets[w];
    const wType = wConfig?.type;
    const jsType = wConfig?.jsType;
    const fieldSettings = fieldConfig.fieldSettings;
    const listValues = fieldSettings?.treeValues || fieldSettings?.listValues;
    const isAsyncListValues = !!fieldSettings?.asyncFetch;
    // todo: for select/multiselect value can be string or number
    const canSkipCheck = listValues || isAsyncListValues;

    if (valueType && wType && valueType != wType)
      return [`Value should have type ${wType}, but got value of type ${valueType}`, value];
    if (jsType && !isTypeOf(value, jsType) && !canSkipCheck) {
      return [`Value should have JS type ${jsType}, but got value of type ${typeof value}`, value];
    }

    if (fieldSettings) {
      const realListValues = asyncListValues || listValues;
      if (realListValues && !fieldSettings.allowCustomValues) {
        return validateValueInList(value, realListValues, canFix, isEndValue, config.settings.removeInvalidMultiSelectValuesOnLoad);
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
const validateFieldValue = (leftField, field, value, _valueSrc, valueType, asyncListValues, config, operator = null, canFix = false, isEndValue = false) => {
  const {fieldSeparator} = config.settings;
  const isFuncArg = typeof field == "object" && field?._isFuncArg;
  const leftFieldStr = Array.isArray(leftField) ? leftField.join(fieldSeparator) : leftField;
  const rightFieldStr = Array.isArray(value) ? value.join(fieldSeparator) : value;
  const rightFieldDefinition = getFieldConfig(config, value);
  if (!rightFieldDefinition)
    return [`Unknown field ${value}`, value];
  if (leftField && rightFieldStr == leftFieldStr && !isFuncArg)
    return [`Can't compare field ${leftField} with itself`, value];
  if (valueType && valueType != rightFieldDefinition.type)
    return [`Field ${value} is of type ${rightFieldDefinition.type}, but expected ${valueType}`, value];
  return [null, value];
};

/**
* 
*/
const validateFuncValue = (
  leftField, field, value, _valueSrc, valueType, asyncListValues, config, operator = null,
  canFix = false, isEndValue = false, canDropArgs = false
) => {
  let fixedValue = value;

  if (value) {
    const funcKey = value.get("func");
    if (funcKey) {
      const fieldDef = getFieldConfig(config, field);
      if (fieldDef?.funcs) {
        if (!fieldDef.funcs.includes(funcKey)) {
          return [`Unsupported function ${funcKey}`, value];
        }
      }
      if (fixedValue) {
        const funcConfig = getFuncConfig(config, funcKey);
        if (funcConfig) {
          if (valueType && funcConfig.returnType != valueType)
            return [`Function ${funcKey} should return value of type ${funcConfig.returnType}, but got ${valueType}`, value];
          for (const argKey in funcConfig.args) {
            const argConfig = funcConfig.args[argKey];
            const args = fixedValue.get("args");
            const argVal = args ? args.get(argKey) : undefined;
            const argDef = getFieldConfig(config, argConfig);
            const argValue = argVal ? argVal.get("value") : undefined;
            const argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
            if (argValue !== undefined) {
              const [argValidationError, fixedArgVal] = validateValue(
                config, leftField, argDef, operator, argValue, argConfig.type, argValueSrc, asyncListValues, canFix, isEndValue, canDropArgs,
              );
              const willFix = fixedArgVal !== argValue;
              const hasError = argValidationError !== null;
              //tip: reset to default ONLY if isEndValue==true
              const canDrop = canFix && hasError && !willFix && (isEndValue || canDropArgs);
              if (willFix) {
                fixedValue = fixedValue.setIn(["args", argKey, "value"], fixedArgVal);
              }
              if (canDrop) {
                // reset to default
                fixedValue = fixedValue.deleteIn(["args", argKey]);
                fixedValue = setFuncDefaultArg(config, fixedValue, funcConfig, argKey);
              }
              if (hasError)
                return [`Invalid value of arg ${argKey} for func ${funcKey}: ${argValidationError}`, fixedValue];
            } else if (!argConfig.isOptional && isEndValue) {
              const canDrop = canFix && argConfig.defaultValue !== undefined && (isEndValue || canDropArgs);
              if (canDrop) {
                // set default
                fixedValue = fixedValue.deleteIn(["args", argKey]);
                fixedValue = setFuncDefaultArg(config, fixedValue, funcConfig, argKey);
              } else {
                return [`Value of arg ${argKey} for func ${funcKey} is required`, value];
              }
            }
          }
        } else return [`Unknown function ${funcKey}`, value];
      }
    } // else it's not function value
  } // empty value

  return [null, fixedValue];
};

/**
* 
*/
export const validateRange = (config, field, operator, values, valueSrcs) => {
  const operatorConfig = getOperatorConfig(config, operator, field);
  const operatorCardinality = operator ? defaultValue(operatorConfig.cardinality, 1) : null;
  const valueSrcsArr = (valueSrcs.toJS ? valueSrcs.toJS() : valueSrcs);
  const valuesArr = (values.toJS ? values.toJS() : values);
  const areValueSrcsPureValues = valueSrcsArr.filter(vs => vs == "value" || vs == null).length == operatorCardinality;
  let rangeValidationError;
  if (operatorConfig?.validateValues && areValueSrcsPureValues) {
    const valueSrc = valueSrcsArr[0];
    const w = getWidgetForFieldOp(config, field, operator, valueSrc);
    const fieldWidgetDefinition = getFieldWidgetConfig(config, field, operator, w, valueSrc);
    const jsValues = fieldWidgetDefinition?.toJS
      ? valuesArr.map(v => {
        let jsVal = fieldWidgetDefinition.toJS.call(config.ctx, v, fieldWidgetDefinition);
        if (jsVal instanceof Date) {
          jsVal = jsVal.getTime();
        }
        return jsVal;
      })
      : valuesArr;
    rangeValidationError = operatorConfig.validateValues(jsValues);
  }
  return rangeValidationError;
};
