import {
  getFieldConfig, getOperatorConfig, getFieldWidgetConfig, getFieldRawConfig, getFuncConfig
} from "./configUtils";
import {defaultValue, getFirstDefined} from "../utils/stuff";
import Immutable from "immutable";
import {validateValue} from "../utils/validation";
import last from "lodash/last";
import {completeFuncValue} from "./funcUtils";

export const selectTypes = [
  "select",
  "multiselect",
  "treeselect",
  "treemultiselect",
];

/**
 * @param {object} config
 * @param {object} oldConfig
 * @param {Immutable.Map} current
 * @param {string} newField
 * @param {string} newOperator
 * @param {string} changedProp
 * @return {object} - {canReuseValue, newValue, newValueSrc, newValueType, newValueError}
 */
export const getNewValueForFieldOp = function (config, oldConfig = null, current, newField, newOperator, changedProp = null, canFix = true, isEndValue = false) {
  if (!oldConfig)
    oldConfig = config;
  const {keepInputOnChangeFieldSrc} = config.settings;
  const currentField = current.get("field");
  const currentFieldType = current.get("fieldType");
  const currentFieldSrc = current.get("fieldSrc");
  const currentOperator = current.get("operator");
  const currentValue = current.get("value");
  const currentValueSrc = current.get("valueSrc", new Immutable.List());
  const currentValueType = current.get("valueType", new Immutable.List());
  const currentAsyncListValues = current.get("asyncListValues");

  //const isValidatingTree = (changedProp === null);
  const {convertableWidgets, clearValueOnChangeField, clearValueOnChangeOp, showErrorMessage} = config.settings;

  //const currentOperatorConfig = getOperatorConfig(oldConfig, currentOperator, currentField);
  const newOperatorConfig = getOperatorConfig(config, newOperator, newField, currentFieldSrc);
  //const currentOperatorCardinality = currentOperator ? defaultValue(currentOperatorConfig.cardinality, 1) : null;
  const operatorCardinality = newOperator ? defaultValue(newOperatorConfig.cardinality, 1) : null;
  const currentFieldConfig = getFieldConfig(oldConfig, currentField, currentFieldSrc);
  const newFieldConfig = getFieldConfig(config, newField, currentFieldSrc);
  const isOkWithoutField = !currentField && currentFieldType && keepInputOnChangeFieldSrc;
  const currentType = currentFieldConfig?.type || currentFieldType;
  const newType = newFieldConfig?.type || !newField && isOkWithoutField && currentType;

  let canReuseValue = (currentField || isOkWithoutField) && currentOperator && newOperator && currentValue != undefined;
  canReuseValue = canReuseValue &&
    (!changedProp 
      || changedProp == "field" && !clearValueOnChangeField 
      || changedProp == "operator" && !clearValueOnChangeOp);
  canReuseValue = canReuseValue &&
    (currentType && newType && currentType == newType);
  if (canReuseValue && selectTypes.includes(newType) && changedProp == "field") {
    const newListValuesType = newFieldConfig?.listValuesType;
    const currentListValuesType = currentFieldConfig?.listValuesType;
    if (newListValuesType && newListValuesType === currentListValuesType) {
      // ok
    } else {
      // different fields of select types has different listValues
      canReuseValue = false;
    }
  }

  // compare old & new widgets
  for (let i = 0 ; i < operatorCardinality ; i++) {
    const vs = currentValueSrc.get(i) || null;
    const currentWidget = getWidgetForFieldOp(oldConfig, currentField, currentOperator, vs, currentFieldSrc);
    const newWidget = getWidgetForFieldOp(config, newField, newOperator, vs, currentFieldSrc);
    // need to also check value widgets if we changed operator and current value source was 'field'
    // cause for select type op '=' requires single value and op 'in' requires array value
    const currentValueWidget = vs == "value" ? currentWidget : getWidgetForFieldOp(oldConfig, currentField, currentOperator, "value", currentFieldSrc);
    const newValueWidget = vs == "value" ? newWidget : getWidgetForFieldOp(config, newField, newOperator, "value", currentFieldSrc);

    const canReuseWidget = newValueWidget == currentValueWidget || (convertableWidgets[currentValueWidget] || []).includes(newValueWidget);
    if (!canReuseWidget && !isOkWithoutField) {
      canReuseValue = false;
    }
  }

  if (currentOperator != newOperator && [currentOperator, newOperator].includes("proximity"))
    canReuseValue = false;

  const firstWidgetConfig = getFieldWidgetConfig(config, newField, newOperator, null, currentValueSrc.first(), currentFieldSrc);
  let valueSources = getValueSourcesForFieldOp(config, newField, newOperator, null, null, currentFieldSrc);
  if (!newField && isOkWithoutField) {
    valueSources = Object.keys(config.settings.valueSourcesInfo);
  }

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
      const asyncListValues = currentAsyncListValues;
      const [validateError, fixedValue] = validateValue(
        config, newField, newField, newOperator, v, vType, vSrc, asyncListValues, canFix, isEndValue, true, currentFieldSrc
      );
      const isValid = !validateError;
      // Allow bad value with error message
      // But not on field change - in that case just drop bad value that can't be reused
      // ? Maybe we should also drop bad value on op change?
      // For bad multiselect value we have both error message + fixed value.
      //  If we show error message, it will gone on next tree validation
      const fixValue = fixedValue !== v;
      const dropValue = !isValidSrc || !isValid && (changedProp == "field" || !showErrorMessage && !fixValue);
      const showValueError = !!validateError && showErrorMessage && !dropValue && !fixValue;
      if (showValueError) {
        valueErrors[i] = validateError;
      }
      if (fixValue) {
        valueFixes[i] = fixedValue;
      }
      if (dropValue) {
        canReuseValue = false;
        break;
      }
    }
  }

  // reuse value OR get defaultValue for cardinality 1 (it means default range values is not supported yet, todo)
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

  if (showErrorMessage) {
    if (newOperatorConfig && newOperatorConfig.validateValues && newValueSrc.toJS().filter(vs => vs == "value" || vs == null).length == operatorCardinality) {
      // last element in `valueError` list is for range validation error
      const jsValues = firstWidgetConfig && firstWidgetConfig.toJS 
        ? newValue.toJS().map(v => firstWidgetConfig.toJS.call(config.ctx, v, firstWidgetConfig)) 
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
    } else if (operatorCardinality == 1 && newFieldConfig && newFieldConfig.type !== undefined) {
      vt = newFieldConfig.type == "!group" ? "number" : newFieldConfig.type;
    }
    return vt;
  }));

  return {canReuseValue, newValue, newValueSrc, newValueType, newValueError, operatorCardinality};
};

export const getFirstField = (config, parentRuleGroupPath = null) => {
  const fieldSeparator = config.settings.fieldSeparator;
  const parentPathArr = typeof parentRuleGroupPath == "string" ? parentRuleGroupPath.split(fieldSeparator) : parentRuleGroupPath;
  const parentField = parentRuleGroupPath ? getFieldRawConfig(config, parentRuleGroupPath) : config;

  let firstField = parentField, key = null, keysPath = [];
  do {
    const subfields = firstField === config ? config.fields : firstField.subfields;
    if (!subfields || !Object.keys(subfields).length) {
      firstField = key = null;
      break;
    }
    key = Object.keys(subfields)[0];
    keysPath.push(key);
    firstField = subfields[key];
  } while (firstField.type == "!struct" || firstField.type == "!group");
  return (parentPathArr || []).concat(keysPath).join(fieldSeparator);
};

export const getOperatorsForType = (config, fieldType) => {
  return config.types[fieldType]?.operators || null;
};

export const getOperatorsForField = (config, field, fieldSrc) => {
  const fieldConfig = getFieldConfig(config, field, fieldSrc);
  const fieldOps = fieldConfig ? fieldConfig.operators : [];
  return fieldOps;
};

export const getFirstOperator = (config, field, fieldSrc) => {
  const fieldOps = getOperatorsForField(config, field, fieldSrc);
  return fieldOps ? fieldOps[0] : null;
};

export const getFieldPath = (field, config, onlyKeys = false) => {
  if (!field)
    return null;
  const fieldSeparator = config.settings.fieldSeparator;
  const parts = Array.isArray(field) ? field : field.split(fieldSeparator);
  if (onlyKeys)
    return parts;
  else
    return parts
      .map((_curr, ind, arr) => arr.slice(0, ind+1))
      .map((parts) => parts.join(fieldSeparator));
};

export const getFuncPathLabels = (field, config, parentField = null) => {
  return getFieldPathLabels(field, config, parentField, "funcs", "subfields");
};

export const getFieldPathLabels = (field, config, parentField = null, fieldsKey = "fields", subfieldsKey = "subfields", fieldSrc = null) => {
  if (!field)
    return null;
  const fieldSeparator = config.settings.fieldSeparator;
  const parts = fieldSrc === "func" ? [field] : (Array.isArray(field) ? field : field.split(fieldSeparator));
  const parentParts = parentField ? (Array.isArray(parentField) ? parentField : parentField.split(fieldSeparator)) : [];
  return parts
    .slice(parentParts.length)
    .map((_curr, ind, arr) => arr.slice(0, ind+1))
    .map((parts) => [...parentParts, ...parts].join(fieldSeparator))
    .map(part => {
      const cnf = getFieldRawConfig(config, part, fieldsKey, subfieldsKey);
      return cnf && cnf.label || last(part.split(fieldSeparator));
    })
    .filter(label => label != null);
};

export const getFieldPartsConfigs = (field, config, parentField = null) => {
  if (!field)
    return null;
  const parentFieldDef = parentField && getFieldRawConfig(config, parentField) || null;
  const fieldSeparator = config.settings.fieldSeparator;
  const parts = Array.isArray(field) ? field : field.split(fieldSeparator);
  const parentParts = parentField ? (Array.isArray(parentField) ? parentField : parentField.split(fieldSeparator)) : [];
  return parts
    .slice(parentParts.length)
    .map((_curr, ind, arr) => arr.slice(0, ind+1))
    .map((parts) => ({
      part: [...parentParts, ...parts].join(fieldSeparator),
      key: parts[parts.length - 1]
    }))
    .map(({part, key}) => {
      const cnf = getFieldRawConfig(config, part);
      return {key, cnf};
    })
    .map(({key, cnf}, ind, arr) => {
      const parentCnf = ind > 0 ? arr[ind - 1].cnf : parentFieldDef;
      return [key, cnf, parentCnf];
    });
};

export const getValueLabel = (config, field, operator, delta, valueSrc = null, isSpecialRange = false, fieldSrc = null) => {
  const isFuncArg = field && typeof field == "object" && !!field.func && !!field.arg;
  const {showLabels} = config.settings;
  const fieldConfig = getFieldConfig(config, field, fieldSrc);
  const fieldWidgetConfig = getFieldWidgetConfig(config, field, operator, null, valueSrc, fieldSrc) || {};
  const mergedOpConfig = getOperatorConfig(config, operator, field, fieldSrc) || {};
    
  const cardinality = isSpecialRange ? 1 : mergedOpConfig.cardinality;
  let ret = null;
  if (cardinality > 1) {
    const valueLabels = fieldWidgetConfig.valueLabels || mergedOpConfig.valueLabels;
    if (valueLabels)
      ret = valueLabels[delta];
    if (ret && typeof ret != "object") {
      ret = {label: ret, placeholder: ret};
    }
    if (!ret) {
      ret = {
        label: config.settings.valueLabel + " " + (delta+1),
        placeholder: config.settings.valuePlaceholder + " " + (delta+1),
      };
    }
  } else {
    let label = fieldWidgetConfig.valueLabel;
    let placeholder = fieldWidgetConfig.valuePlaceholder;
    if (isFuncArg) {
      if (!label)
        label = fieldConfig.label || field.arg;
      if (!placeholder && !showLabels)
        placeholder = fieldConfig.label || field.arg;
    }

    ret = {
      label: label || config.settings.valueLabel, 
      placeholder: placeholder || config.settings.valuePlaceholder,
    };
  }
  return ret;
};

function _getWidgetsAndSrcsForFieldOp (config, field, operator = null, valueSrc = null, fieldSrc = null) {
  let widgets = [];
  let valueSrcs = [];
  if (!field)
    return {widgets, valueSrcs};
  const isFuncArg = typeof field == "object" && (!!field.func && !!field.arg || field._isFuncArg);
  const fieldConfig = getFieldConfig(config, field, fieldSrc);
  const opConfig = operator ? config.operators[operator] : null;
  
  if (fieldConfig?.widgets) {
    for (const widget in fieldConfig.widgets) {
      const widgetConfig = fieldConfig.widgets[widget];
      if (!config.widgets[widget]) {
        continue;
      }
      const widgetValueSrc = config.widgets[widget].valueSrc || "value";
      let canAdd = true;
      if (widget == "field") {
        canAdd = canAdd && filterValueSourcesForField(config, ["field"], fieldConfig).length > 0;
      }
      if (widget == "func") {
        canAdd = canAdd && filterValueSourcesForField(config, ["func"], fieldConfig).length > 0;
      }
      // If can't check operators, don't add
      // Func args don't have operators
      if (valueSrc == "value" && !widgetConfig.operators && !isFuncArg && field != "!case_value")
        canAdd = false;
      if (widgetConfig.operators && operator)
        canAdd = canAdd && widgetConfig.operators.indexOf(operator) != -1;
      if (valueSrc && valueSrc != widgetValueSrc && valueSrc != "const")
        canAdd = false;
      if (opConfig && opConfig.cardinality == 0 && (widgetValueSrc != "value"))
        canAdd = false;
      if (canAdd) {
        widgets.push(widget);
        let canAddValueSrc = fieldConfig.valueSources?.indexOf(widgetValueSrc) != -1;
        if (opConfig?.valueSources?.indexOf(widgetValueSrc) == -1)
          canAddValueSrc = false;
        if (canAddValueSrc && !valueSrcs.find(v => v == widgetValueSrc))
          valueSrcs.push(widgetValueSrc);
      }
    }
  }

  const widgetWeight = (w) => {
    let wg = 0;
    if (fieldConfig.preferWidgets) {
      if (fieldConfig.preferWidgets.includes(w))
        wg += (10 - fieldConfig.preferWidgets.indexOf(w));
    } else if (w == fieldConfig.mainWidget) {
      wg += 100;
    }
    if (w == "field") {
      wg -= 1;
    }
    if (w == "func") {
      wg -= 2;
    }
    return wg;
  };

  widgets.sort((w1, w2) => (widgetWeight(w2) - widgetWeight(w1)));
    
  return {widgets, valueSrcs};
}

export const getWidgetsForFieldOp = (config, field, operator, valueSrc = null, fieldSrc = null) => {
  const {widgets} = _getWidgetsAndSrcsForFieldOp(config, field, operator, valueSrc, fieldSrc);
  return widgets;
};

export const filterValueSourcesForField = (config, valueSrcs, fieldDefinition) => {
  if (!fieldDefinition)
    return valueSrcs;
  const fieldType = fieldDefinition.type ?? fieldDefinition.returnType;
  if (!valueSrcs)
    valueSrcs = Object.keys(config.settings.valueSourcesInfo);
  return valueSrcs.filter(vs => {
    let canAdd = true;
    if (vs == "field") {
      if (config._fieldsCntByType) {
        // tip: LHS field can be used as arg in RHS function
        const minCnt = fieldDefinition._isFuncArg ? 0 : 1;
        canAdd = canAdd && config._fieldsCntByType[fieldType] > minCnt;
      }
    }
    if (vs == "func") {
      if (config._funcsCntByType)
        canAdd = canAdd && !!config._funcsCntByType[fieldType];
      if (fieldDefinition.funcs)
        canAdd = canAdd && fieldDefinition.funcs.length > 0;
    }
    return canAdd;
  });
};

export const getValueSourcesForFieldOp = (config, field, operator, fieldDefinition = null, leftFieldForFunc = null, fieldSrc = null) => {
  const {valueSrcs} = _getWidgetsAndSrcsForFieldOp(config, field, operator, null, fieldSrc);
  const filteredValueSrcs = filterValueSourcesForField(config, valueSrcs, fieldDefinition);
  return filteredValueSrcs;
};

export const getWidgetForFieldOp = (config, field, operator, valueSrc = null, fieldSrc = null) => {
  const {widgets} = _getWidgetsAndSrcsForFieldOp(config, field, operator, valueSrc, fieldSrc);
  let widget = null;
  if (widgets.length)
    widget = widgets[0];
  return widget;
};

export const formatFieldName = (field, config, meta, parentField = null, options = {}) => {
  if (!field) return;
  const fieldDef = getFieldConfig(config, field) || {};
  const {fieldSeparator} = config.settings;
  const fieldParts = Array.isArray(field) ? field : field.split(fieldSeparator);
  let fieldName = Array.isArray(field) ? field.join(fieldSeparator) : field;
  if (options?.useTableName && fieldDef.tableName) { // legacy
    const fieldPartsCopy = [...fieldParts];
    fieldPartsCopy[0] = fieldDef.tableName;
    fieldName = fieldPartsCopy.join(fieldSeparator);
  }
  if (fieldDef.fieldName) {
    fieldName = fieldDef.fieldName;
  }
  if (parentField) {
    const parentFieldDef = getFieldConfig(config, parentField) || {};
    let parentFieldName = parentField;
    if (parentFieldDef.fieldName) {
      parentFieldName = parentFieldDef.fieldName;
    }
    if (fieldName.indexOf(parentFieldName + fieldSeparator) == 0) {
      fieldName = fieldName.slice((parentFieldName + fieldSeparator).length);
      // fieldName = "#this." + fieldName; // ? for spel
    } else {
      meta.errors.push(`Can't cut group ${parentFieldName} from field ${fieldName}`);
    }
  }
  return fieldName;
};


export const isEmptyItem = (item, config, liteCheck = false) => {
  const type = item.get("type");
  const mode = item.getIn(["properties", "mode"]);
  if (type == "rule_group" && mode == "array") {
    return isEmptyRuleGroupExt(item, config, liteCheck);
  } else if (type == "group" || type == "rule_group") {
    return isEmptyGroup(item, config, liteCheck);
  } else {
    return isEmptyRule(item, config, liteCheck);
  }
};

const isEmptyRuleGroupExt = (item, config, liteCheck = false) => {
  const children = item.get("children1");
  const properties = item.get("properties");
  return isEmptyRuleGroupExtPropertiesAndChildren(properties.toObject(), children, config, liteCheck);
};

export const isEmptyRuleGroupExtPropertiesAndChildren = (properties, children, config, liteCheck = false) => {
  const operator = properties.operator;
  const cardinality = config.operators[operator]?.cardinality ?? 1;
  const filledParts = [
    !isEmptyRuleProperties(properties, config, false),
    cardinality > 0 ? true : !isEmptyGroupChildren(children, config, liteCheck),
  ];
  const filledCnt = filledParts.filter(f => !!f).length;
  const isFilled = filledCnt == 2;
  return !isFilled;
};

const isEmptyGroup = (group, config, liteCheck = false) => {
  const children = group.get("children1");
  return isEmptyGroupChildren(children, config, liteCheck);
};

export const isEmptyGroupChildren = (children, config, liteCheck = false) => {
  return !children || children.size == 0
    || children.size > 0 && children.filter(ch => !isEmptyItem(ch, config, liteCheck)).size == 0
};

export const isEmptyRuleProperties = ({
  field, fieldSrc, fieldType,
  operator,
  value, valueSrc, valueType,
}, config, liteCheck = false) => {
  const cardinality = config.operators[operator]?.cardinality ?? 1;
  const filledParts = [
    liteCheck ? (field !== null || fieldType != null) : isCompletedValue(field, fieldSrc, config, liteCheck),
    !!operator,
    value.filter((val, delta) => isCompletedValue(val, valueSrc.get(delta), config, liteCheck)).size >= cardinality
  ];
  const filledCnt = filledParts.filter(f => !!f).length;
  const isFilled = filledCnt == 3;
  return !isFilled;
};

const isEmptyRule = (rule, config, liteCheck = false) => {
  const properties = rule.get("properties");
  return isEmptyRuleProperties(properties.toObject(), config, liteCheck);
};

export const isCompletedValue = (value, valueSrc, config, liteCheck = false) => {
  if (!liteCheck && valueSrc == "func" && value) {
    const funcKey = value.get("func");
    const funcConfig = getFuncConfig(config, funcKey);
    if (funcConfig) {
      const args = value.get("args");
      for (const argKey in funcConfig.args) {
        const argConfig = funcConfig.args[argKey];
        const argVal = args ? args.get(argKey) : undefined;
        // const argDef = getFieldConfig(config, argConfig);
        const argValue = argVal ? argVal.get("value") : undefined;
        const argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
        if (argValue == undefined && argConfig.defaultValue === undefined && !argConfig.isOptional) {
          // arg is not completed
          return false;
        }
        if (argValue != undefined) {
          if (!isCompletedValue(argValue, argValueSrc, config, liteCheck)) {
            // arg is complex and is not completed
            return false;
          }
        }
      }
      // all args are completed
      return true;
    }
  }
  return value != undefined;
};

/**
 * @param {*} value
 * @param {string} valueSrc - 'value' | 'field' | 'func'
 * @param {object} config
 * @return {* | undefined} - undefined if func value is not complete (missing required arg vals); can return completed value != value
 */
export const completeValue = (value, valueSrc, config) => {
  if (valueSrc == "func")
    return completeFuncValue(value, config);
  else
    return value;
};
