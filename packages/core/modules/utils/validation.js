import omit from "lodash/omit";
import Immutable from "immutable";
import {
  getFieldConfig, getOperatorConfig, getFieldWidgetConfig, getFuncConfig, getFieldSrc,
  extendConfig} from "./configUtils";
import {
  getOperatorsForField, getWidgetForFieldOp, whatRulePropertiesAreCompleted,
  selectTypes, getValueSourcesForFieldOp,
} from "../utils/ruleUtils";
import {defaultValue, getFirstDefined, deepEqual} from "../utils/stuff";
import {getItemInListValues} from "../utils/listValues";
import {defaultOperatorOptions} from "../utils/defaultUtils";
import {fixPathsInTree} from "../utils/treeUtils";
import {setFuncDefaultArg} from "../utils/funcUtils";

import * as constants from "../i18n/validation/constains";
import i18next from 'i18next';
import { translations, custom, I18NS, I18NSP } from "../i18n/validation/translations";

// todo
i18next.init({
});
i18next.addResources("dev", I18NS, translations)
i18next.addResources("dev", "custom", custom)

export const tr = (key, args) => {
  if (key?.key && key?.args) {
    return tr(key, key, key.args);
  }
  if (args === null) {
    return key;
  }
  return i18next.t(
    key.includes(":") ? key : I18NSP+key,
    args
  );
};


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
  const [_t, errors, _s] = _validateTree(tree, null, extendedConfig, extendedConfig, removeEmptyGroups, removeIncompleteRules);
  for (let id in errors) {
    console.log(errors)
    //errors[id] = 
  }
  return errors;
};

export const sanitizeTree = (tree, config) => {
  if (!tree) return undefined;
  const extendedConfig = extendConfig(config, undefined, true);
  const removeEmptyGroups = config.settings.removeEmptyGroupsOnLoad;
  const removeIncompleteRules = config.settings.removeIncompleteRulesOnLoad;
  const [fixedTree, _e, _s] = _validateTree(tree, null, extendedConfig, extendedConfig, removeEmptyGroups, removeIncompleteRules);
  return fixedTree;
};

export const validateAndFixTree = (newTree, _oldTree, newConfig, oldConfig, removeEmptyGroups, removeIncompleteRules) => {
  if (removeEmptyGroups === undefined) {
    removeEmptyGroups = newConfig.settings.removeEmptyGroupsOnLoad;
  }
  if (removeIncompleteRules === undefined) {
    removeIncompleteRules = newConfig.settings.removeIncompleteRulesOnLoad;
  }
  let [fixedTree, _e, _s] = _validateTree(newTree, _oldTree, newConfig, oldConfig, removeEmptyGroups, removeIncompleteRules);
  fixedTree = fixPathsInTree(fixedTree);
  return fixedTree;
};

export const _validateTree = (tree, _oldTree, config, oldConfig, removeEmptyGroups, removeIncompleteRules) => {
  const c = {
    config, oldConfig, removeEmptyGroups, removeIncompleteRules
  };
  const meta = {
    errors: {},
  };
  const fixedTree = validateItem(tree, [], null, meta, c);
  return [fixedTree, meta.errors, meta.sanitized];
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
      str: "Empty group",
      key: constants.EMPTY_GROUP,
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
      key: constants.NO_CONFIG_FOR_FIELD,
      args: {
        field
      },
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
      type: "fix",
      key: constants.FIXED_OPERATOR,
      args: {
        from: properties.get("operator"),
        to: operator
      }
    });
    properties = properties.set("operator", operator);
  }
  const operatorDefinition = operator ? getOperatorConfig(config, operator, field) : null;
  if (operator && !operatorDefinition) {
    addError(meta, item, {
      str: `No config for operator ${operator}`,
      key: constants.NO_CONFIG_FOR_OPERATOR,
      args: {
        operator
      }
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
    validationErrors?.map(e => addError(meta, origItem, e));
  }
  return item;
}


/**
 * 
 * @param {bool} canFix true is useful for func values to remove bad args
 * @param {bool} isEndValue false if value is in process of editing by user
 * @return {array} [fixedValue, errorKey, errorArgs] - if errorKey === null and canFix == true, fixedValue can differ from value if was fixed
 *   If errorArgs === null, errorKey should not be translated
 */
export const validateValue = (
  config, leftField, field, operator, value, valueType, valueSrc, asyncListValues,
  canFix = false, isEndValue = false, canDropArgs = false
) => {
  let errorKey, errorArgs;
  let fixedValue = value;

  if (value != null) {
    if (valueSrc == "field") {
      [fixedValue, errorKey, errorArgs] = validateFieldValue(leftField, field, value, valueSrc, valueType, asyncListValues, config, operator, canFix, isEndValue);
    } else if (valueSrc == "func") {
      [fixedValue, errorKey, errorArgs] = validateFuncValue(leftField, field, value, valueSrc, valueType, asyncListValues, config, operator, canFix, isEndValue, canDropArgs);
    } else if (valueSrc == "value" || !valueSrc) {
      [fixedValue, errorKey, errorArgs] = validateNormalValue(field, value, valueSrc, valueType, asyncListValues, config, operator, canFix, isEndValue);
    }

    if (!errorKey && field) {
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
          if (validResult.error?.key) {
            errorKey = validResult.error.key;
            errorArgs = validResult.error.args;
          } else {
            errorKey = validResult.error;
            errorArgs = null; // Note: `null` means it's not translated string!
          }
          if (validResult.fixedValue !== undefined && canFix) {
            fixedValue = validResult.fixedValue;
          }
        } else if (typeof validResult === "boolean") {
          if (validResult == false) {
            errorKey = constants.INVALID_VALUE;
            errorArgs = {};
          }
        } else {
          errorKey = validResult;
        }
      }
    }
  }
  
  return [fixedValue, errorKey, errorArgs];
};

const validateValueInList = (value, listValues, canFix, isEndValue, removeInvalidMultiSelectValuesOnLoad) => {
  const values = Immutable.List.isList(value) ? value.toJS() : (value instanceof Array ? [...value] : undefined);
  if (values) {
    const [goodValues, badValues] = values.reduce(([goodVals, badVals], val) => {
      const vv = getItemInListValues(listValues, val);
      if (vv == undefined) {
        return [goodVals, [...badVals, val]];
      } else {
        return [[...goodVals, vv.value], badVals];
      }
    }, [[], []]);
    const needFix = badValues.length > 0;
    const plural = badValues.length > 1;
    const err = badValues.length ? `${plural ? "Values" : "Value"} ${badValues.join(", ")} ${plural ? "are" : "is"} not in list of values` : null;
    // always remove bad values at tree validation as user can't unselect them (except AntDesign widget)
    canFix = canFix || removeInvalidMultiSelectValuesOnLoad === true;
    return [canFix && needFix ? goodValues : value, err];
  } else {
    const vv = getItemInListValues(listValues, value);
    if (vv == undefined) {
      return [value, `Value ${value} is not in list of values`];
    } else {
      value = vv.value;
    }
    return [value];
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
      return [value, `Value should have type ${wType}, but got value of type ${valueType}`];
    if (jsType && !isTypeOf(value, jsType) && !canSkipCheck) {
      return [value, `Value should have JS type ${jsType}, but got value of type ${typeof value}`];
    }

    if (fieldSettings) {
      const realListValues = asyncListValues || listValues;
      if (realListValues && !fieldSettings.allowCustomValues) {
        return validateValueInList(value, realListValues, canFix, isEndValue, config.settings.removeInvalidMultiSelectValuesOnLoad);
      }
      if (fieldSettings.min != null && value < fieldSettings.min) {
        return [canFix ? fieldSettings.min : value, `Value ${value} < min ${fieldSettings.min}`];
      }
      if (fieldSettings.max != null && value > fieldSettings.max) {
        return [canFix ? fieldSettings.max : value, `Value ${value} > max ${fieldSettings.max}`];
      }
    }
  }

  return [value];
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
    return [value, `Unknown field ${value}`];
  if (leftField && rightFieldStr == leftFieldStr && !isFuncArg)
    return [value, `Can't compare field ${leftField} with itself`];
  if (valueType && valueType != rightFieldDefinition.type)
    return [value, `Field ${value} is of type ${rightFieldDefinition.type}, but expected ${valueType}`];
  return [value];
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
          return [value, `Unsupported function ${funcKey}`];
        }
      }
      if (fixedValue) {
        const funcConfig = getFuncConfig(config, funcKey);
        if (funcConfig) {
          if (valueType && funcConfig.returnType != valueType)
            return [value, `Function ${funcKey} should return value of type ${funcConfig.returnType}, but got ${valueType}`];
          for (const argKey in funcConfig.args) {
            const argConfig = funcConfig.args[argKey];
            const args = fixedValue.get("args");
            const argVal = args ? args.get(argKey) : undefined;
            const argDef = getFieldConfig(config, argConfig);
            const argValue = argVal ? argVal.get("value") : undefined;
            const argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
            if (argValue !== undefined) {
              const [fixedArgVal, errorKey, errorArgs] = validateValue(
                config, leftField, argDef, operator, argValue, argConfig.type, argValueSrc, asyncListValues, canFix, isEndValue, canDropArgs,
              );
              const willFix = fixedArgVal !== argValue;
              const hasError = !!errorKey;
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
              if (hasError) {
                const argValidationError = tr(errorKey, errorArgs);
                return [fixedValue, constants.INVALID_FUNC_ARG_VALUE, {funcKey, argKey, argValidationError}];
              }
            } else if (!argConfig.isOptional && isEndValue) {
              const canDrop = canFix && argConfig.defaultValue !== undefined && (isEndValue || canDropArgs);
              if (canDrop) {
                // set default
                fixedValue = fixedValue.deleteIn(["args", argKey]);
                fixedValue = setFuncDefaultArg(config, fixedValue, funcConfig, argKey);
              } else {
                return [value, `Value of arg ${argKey} for func ${funcKey} is required`];
              }
            }
          }
        } else return [value, constants.NO_CONFIG_FOR_FUNCTION, {funcKey}];
      }
    } // else it's not function value
  } // empty value

  return [fixedValue];
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



/**
 * @param {Immutable.Map} current
 * @param {string} changedProp
 * @param {boolean} canFix (default: false) true - eg. set value to max if it > max or revert or drop
 * @param {boolean} isEndValue (default: false) true - if value is in process of editing by user
 * @param {boolean} canDropArgs (default: false)
 * @return {{canReuseValue, newValue, newValueSrc, newValueType, fixedField, operatorCardinality,  newValueError, newFieldError, validationErrors}}
 */
export const getNewValueForFieldOp = function (
  config, oldConfig = null, current, newField, newOperator, changedProp = null,
  canFix = false, isEndValue = false, canDropArgs = false
) {
  if (!oldConfig)
    oldConfig = config;
  const {
    keepInputOnChangeFieldSrc, convertableWidgets, clearValueOnChangeField, clearValueOnChangeOp,
  } = config.settings;
  const currentField = current.get("field");
  const currentFieldType = current.get("fieldType");
  const currentFieldSrc = current.get("fieldSrc");
  const currentOperator = current.get("operator");
  const currentValue = current.get("value");
  const currentValueSrc = current.get("valueSrc", new Immutable.List());
  const currentValueType = current.get("valueType", new Immutable.List());
  const asyncListValues = current.get("asyncListValues");

  //const isValidatingTree = (changedProp === null);

  //const currentOperatorConfig = getOperatorConfig(oldConfig, currentOperator);
  const newOperatorConfig = getOperatorConfig(config, newOperator, newField);
  //const currentOperatorCardinality = currentOperator ? defaultValue(currentOperatorConfig.cardinality, 1) : null;
  const operatorCardinality = newOperator ? defaultValue(newOperatorConfig.cardinality, 1) : null;
  const currentFieldConfig = getFieldConfig(oldConfig, currentField);
  const newFieldConfig = getFieldConfig(config, newField);
  const isOkWithoutField = !currentField && currentFieldType && keepInputOnChangeFieldSrc;
  const currentType = currentFieldConfig?.type || currentFieldType;
  const newType = newFieldConfig?.type || !newField && isOkWithoutField && currentType;
  const currentListValuesType = currentFieldConfig?.listValuesType;
  const newListValuesType = newFieldConfig?.listValuesType;
  const currentFieldSimpleValue = currentField?.get?.("func") || currentField;
  const newFieldSimpleValue = newField?.get?.("func") || newField;
  const hasFieldChanged = newFieldSimpleValue != currentFieldSimpleValue;

  let valueFixes = [];
  let valueErrors = Array.from({length: operatorCardinality}, () => null);
  let validationErrors = [];
  let newFieldError;
  let rangeValidationError;

  let canReuseValue = (currentField || isOkWithoutField) && currentOperator && newOperator && currentValue != undefined;
  if (
    !(currentType && newType && currentType == newType)
    || changedProp === "field" && hasFieldChanged && clearValueOnChangeField
    || changedProp === "operator" && clearValueOnChangeOp
  ) {
    canReuseValue = false;
  }
  if (hasFieldChanged && selectTypes.includes(newType)) {
    if (newListValuesType && newListValuesType === currentListValuesType) {
      // ok
    } else {
      // different fields of select types has different listValues
      canReuseValue = false;
    }
  }

  // validate func LHS
  if (currentFieldSrc === "func" && newField) {
    const [fixedField, errorKey, errorArgs] = validateValue(
      config, null, null, newOperator, newField, newType, currentFieldSrc, asyncListValues, canFix, isEndValue, canDropArgs
    );
    const isValid = !errorKey;
    const willFix = fixedField !== newField;
    const willRevert = !isValid && !willFix && canFix;
    if (willFix) {
      newField = fixedField;
    } else if (willRevert) {
      newField = currentField;
    }
    if (!isValid) {
      newFieldError = tr(errorKey, errorArgs);
      // tip: even if we don't show errors, but revert LHS, put the reason of revert
      validationErrors.push({
        src: "lhs",
        key: errorKey,
        args: errorArgs,
      });
    }
  }

  // compare old & new widgets
  for (let i = 0 ; i < operatorCardinality ; i++) {
    const vs = currentValueSrc.get(i) || null;
    const currentWidget = getWidgetForFieldOp(oldConfig, currentField, currentOperator, vs);
    const newWidget = getWidgetForFieldOp(config, newField, newOperator, vs);
    // need to also check value widgets if we changed operator and current value source was 'field'
    // cause for select type op '=' requires single value and op 'in' requires array value
    const currentValueWidget = vs == "value" ? currentWidget : getWidgetForFieldOp(oldConfig, currentField, currentOperator, "value");
    const newValueWidget = vs == "value" ? newWidget : getWidgetForFieldOp(config, newField, newOperator, "value");

    const canReuseWidget = newValueWidget == currentValueWidget
      || (convertableWidgets[currentValueWidget] || []).includes(newValueWidget)
      || !currentValueWidget && isOkWithoutField;
    if (!canReuseWidget) {
      canReuseValue = false;
    }
  }

  if (currentOperator != newOperator && [currentOperator, newOperator].includes("proximity"))
    canReuseValue = false;

  const firstValueSrc = currentValueSrc.first();
  const firstWidgetConfig = getFieldWidgetConfig(config, newField, newOperator, null, firstValueSrc);
  let valueSources = getValueSourcesForFieldOp(config, newField, newOperator, null);
  if (!newField && isOkWithoutField) {
    valueSources = Object.keys(config.settings.valueSourcesInfo);
  }

  if (canReuseValue) {
    for (let i = 0 ; i < operatorCardinality ; i++) {
      const v = currentValue.get(i);
      const vType = currentValueType.get(i) || null;
      const vSrc = currentValueSrc.get(i) || null;
      let isValidSrc = (valueSources.find(v => v == vSrc) != null);
      if (!isValidSrc && i > 0 && vSrc == null)
        isValidSrc = true; // make exception for range widgets (when changing op from '==' to 'between')
      const [fixedValue, errorKey, errorArgs] = validateValue(
        config, newField, newField, newOperator, v, vType, vSrc, asyncListValues, canFix, isEndValue, canDropArgs
      );
      const isValid = !errorKey;
      // Allow bad value with error message
      // But not on field change - in that case just drop bad value that can't be reused
      // ? Maybe we should also drop bad value on op change?
      // For bad multiselect value we have both error message + fixed value.
      //  If we show error message, it will gone on next tree validation
      const willFix = fixedValue !== v;
      const willDrop = !isValidSrc || !isValid && (hasFieldChanged || !willFix && canFix);
      if (!isValid) {
        // tip: even if we don't show errors, but drop bad values, put the reason of removal
        validationErrors.push({
          src: "rhs",
          delta: i,
          key: errorKey,
          args: errorArgs,
        });
      }
      if (willDrop) {
        canReuseValue = false;
        // revert changes
        valueFixes = [];
        valueErrors = Array.from({length: operatorCardinality}, () => null);
        break;
      }
      if (!isValid) {
        valueErrors[i] = tr(errorKey, errorArgs);
      }
      if (willFix) {
        valueFixes[i] = fixedValue;
      }
    }
  }

  // reuse value OR get defaultValue (for cardinality 1 - it means default range values is not supported yet, todo)
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
    } else if (operatorCardinality == 1) {
      v = getFirstDefined([
        newFieldConfig?.defaultValue,
        newFieldConfig?.fieldSettings?.defaultValue,
        firstWidgetConfig?.defaultValue
      ]);
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

  // Validate range
  rangeValidationError = validateRange(config, newField, newOperator, newValue, newValueSrc);
  if (rangeValidationError) {
    // last element in `valueError` list is for range validation error
    valueErrors.push(rangeValidationError);
    validationErrors.push({
      src: "rhs",
      delta: -1,
      str: rangeValidationError
    });
  }

  newValueError = new Immutable.List(valueErrors);

  newValueType = new Immutable.List(Array.from({length: operatorCardinality}, (_ignore, i) => {
    let vt = null;
    if (canReuseValue) {
      if (i < currentValueType.size)
        vt = currentValueType.get(i);
    } else if (operatorCardinality == 1 && firstWidgetConfig && firstWidgetConfig.type !== undefined) {
      vt = firstWidgetConfig.type;
    } else if (operatorCardinality == 1 && newFieldConfig && newFieldConfig.type !== undefined) {
      vt = newFieldConfig.type == "!group" ? "number" : newFieldConfig.type;
    }
    return vt;
  }));

  return {
    canReuseValue, newValue, newValueSrc, newValueType, operatorCardinality, fixedField: newField,
    newValueError, newFieldError, validationErrors,
  };
};
