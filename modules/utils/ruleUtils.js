import {
  getFieldConfig, getOperatorConfig, getFieldWidgetConfig, getFieldRawConfig
} from "./configUtils";
import {defaultValue} from "../utils/stuff";
import Immutable from "immutable";
import {validateValue} from "../utils/validation";
import last from "lodash/last";

const selectTypes = [
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
  const currentAsyncListValues = current.get("asyncListValues");

  //const isValidatingTree = (changedField === null);
  const {convertableWidgets, clearValueOnChangeField, clearValueOnChangeOp, showErrorMessage} = config.settings;

  //const currentOperatorConfig = getOperatorConfig(oldConfig, currentOperator, currentField);
  const newOperatorConfig = getOperatorConfig(config, newOperator, newField);
  //const currentOperatorCardinality = currentOperator ? defaultValue(currentOperatorConfig.cardinality, 1) : null;
  const operatorCardinality = newOperator ? defaultValue(newOperatorConfig.cardinality, 1) : null;
  const currentFieldConfig = getFieldConfig(oldConfig, currentField);
  const newFieldConfig = getFieldConfig(config, newField);

  let canReuseValue = currentField && currentOperator && newOperator && currentValue != undefined
    && (!changedField 
      || changedField == "field" && !clearValueOnChangeField 
      || changedField == "operator" && !clearValueOnChangeOp)
    && (currentFieldConfig && newFieldConfig && currentFieldConfig.type == newFieldConfig.type);
  if (canReuseValue && selectTypes.includes(currentFieldConfig.type) && changedField == "field") {
    // different fields of select types has different listValues
    canReuseValue = false;
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
      const asyncListValues = currentAsyncListValues;
      const [validateError, fixedValue] = validateValue(
        config, newField, newField, newOperator, v, vType, vSrc, asyncListValues, canFix, isEndValue
      );
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

export const getOperatorsForField = (config, field) => {
  const fieldConfig = getFieldConfig(config, field);
  const fieldOps = fieldConfig ? fieldConfig.operators : [];
  return fieldOps;
};

export const getFirstOperator = (config, field) => {
  const fieldOps = getOperatorsForField(config, field);
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

export const getFieldPathLabels = (field, config, parentField = null, fieldsKey = "fields", subfieldsKey = "subfields") => {
  if (!field)
    return null;
  const fieldSeparator = config.settings.fieldSeparator;
  const parts = Array.isArray(field) ? field : field.split(fieldSeparator);
  const parentParts = parentField ? (Array.isArray(parentField) ? parentField : parentField.split(fieldSeparator)) : [];
  return parts
    .slice(parentParts.length)
    .map((_curr, ind, arr) => arr.slice(0, ind+1))
    .map((parts) => [...parentParts, ...parts].join(fieldSeparator))
    .map(part => {
      const cnf = getFieldRawConfig(config, part, fieldsKey, subfieldsKey);
      return cnf && cnf.label || cnf && last(part.split(fieldSeparator));
    })
    .filter(label => label != null);
};

export const getValueLabel = (config, field, operator, delta, valueSrc = null, isSpecialRange = false) => {
  const isFuncArg = typeof field == "object" && !!field.func && !!field.arg;
  const {showLabels} = config.settings;
  const fieldConfig = getFieldConfig(config, field);
  const fieldWidgetConfig = getFieldWidgetConfig(config, field, operator, null, valueSrc) || {};
  const mergedOpConfig = getOperatorConfig(config, operator, field) || {};
    
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

function _getWidgetsAndSrcsForFieldOp (config, field, operator = null, valueSrc = null) {
  let widgets = [];
  let valueSrcs = [];
  if (!field)
    return {widgets, valueSrcs};
  const isFuncArg = typeof field == "object" && (!!field.func && !!field.arg || field._isFuncArg);
  const fieldConfig = getFieldConfig(config, field);
  const opConfig = operator ? config.operators[operator] : null;
  
  if (fieldConfig && fieldConfig.widgets) {
    for (const widget in fieldConfig.widgets) {
      const widgetConfig = fieldConfig.widgets[widget];
      // if (!config.widgets[widget]) {
      //   continue;
      // }
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
      if (valueSrc == "value" && !widgetConfig.operators && !isFuncArg)
        canAdd = false;
      if (widgetConfig.operators && operator)
        canAdd = canAdd && widgetConfig.operators.indexOf(operator) != -1;
      if (valueSrc && valueSrc != widgetValueSrc && valueSrc != "const")
        canAdd = false;
      if (opConfig && opConfig.cardinality == 0 && (widgetValueSrc != "value"))
        canAdd = false;
      if (canAdd) {
        widgets.push(widget);
        let canAddValueSrc = fieldConfig.valueSources && fieldConfig.valueSources.indexOf(widgetValueSrc) != -1;
        if (opConfig && opConfig.valueSources && opConfig.valueSources.indexOf(widgetValueSrc) == -1)
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

export const getWidgetsForFieldOp = (config, field, operator, valueSrc = null) => {
  const {widgets} = _getWidgetsAndSrcsForFieldOp(config, field, operator, valueSrc);
  return widgets;
};

export const filterValueSourcesForField = (config, valueSrcs, fieldDefinition) => {
  if (!fieldDefinition)
    return valueSrcs;
  return valueSrcs.filter(vs => {
    let canAdd = true;
    if (vs == "field") {
      if (config._fieldsCntByType) {
        // tip: LHS field can be used as arg in RHS function
        const minCnt = fieldDefinition._isFuncArg ? 0 : 1;
        canAdd = canAdd && config._fieldsCntByType[fieldDefinition.type] > minCnt;
      }
    }
    if (vs == "func") {
      if (config._funcsCntByType)
        canAdd = canAdd && !!config._funcsCntByType[fieldDefinition.type];
      if (fieldDefinition.funcs)
        canAdd = canAdd && fieldDefinition.funcs.length > 0;
    }
    return canAdd;
  });
};

export const getValueSourcesForFieldOp = (config, field, operator, fieldDefinition = null, leftFieldForFunc = null) => {
  const {valueSrcs} = _getWidgetsAndSrcsForFieldOp(config, field, operator, null);
  const filteredValueSrcs = filterValueSourcesForField(config, valueSrcs, fieldDefinition);
  return filteredValueSrcs;
};

export const getWidgetForFieldOp = (config, field, operator, valueSrc = null) => {
  const {widgets} = _getWidgetsAndSrcsForFieldOp(config, field, operator, valueSrc);
  let widget = null;
  if (widgets.length)
    widget = widgets[0];
  return widget;
};

export const formatFieldName = (field, config, meta, parentField = null) => {
  const fieldDef = getFieldConfig(config, field) || {};
  const {fieldSeparator} = config.settings;
  const fieldParts = Array.isArray(field) ? field : field.split(fieldSeparator);
  let fieldName = Array.isArray(field) ? field.join(fieldSeparator) : field;
  if (fieldDef.tableName) { // legacy
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
    } else {
      meta.errors.push(`Can't cut group ${parentFieldName} from field ${fieldName}`);
    }
  }
  return fieldName;
};

