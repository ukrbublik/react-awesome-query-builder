import React from "react";
import { Utils } from "@react-awesome-query-builder/core";
import omit from "lodash/omit";
const { getTitleInListValues } = Utils.ListUtils;
const { _widgetDefKeysToOmit } = Utils.ConfigUtils;
const { _fixImmutableValue } = Utils.TreeUtils;

export default ({
  delta, isFuncArg, valueSrc,
  value: immValue, valueError: immValueError, fieldError, asyncListValues,
  isSpecialRange, fieldDefinition,
  widget, widgetDefinition, widgetValueLabel, valueLabels, textSeparators, setValueHandler,
  config, field, fieldSrc, fieldType, isLHS, operator, readonly, parentField, parentFuncs, id, groupId
}) => {
  const {factory: widgetFactory, ...fieldWidgetProps} = widgetDefinition;
  const isConst = isFuncArg && fieldDefinition.valueSources && fieldDefinition.valueSources.length == 1 && fieldDefinition.valueSources[0] == "const";
  const defaultValue = fieldDefinition.defaultValue;

  if (!widgetFactory) {
    return "?";
  }
  
  // Widget value (if it's not a func with args) should NOT be Immutable
  // Eg. for multiselect value should be a JS Array, not Immutable List
  const fixedImmValue = immValue ? immValue.map(v => _fixImmutableValue(v)) : undefined;
  let value = isSpecialRange 
    ? [fixedImmValue?.get(0), fixedImmValue?.get(1)] 
    : (fixedImmValue ? fixedImmValue.get(delta) : undefined);
  const valueError = immValueError?.get && (isSpecialRange 
    ? [immValueError.get(0), immValueError.get(1)]
    : immValueError.get(delta)
  ) || null;
  const errorMessage = isLHS ? fieldError : valueError;
  if (isSpecialRange && value[0] === undefined && value[1] === undefined)
    value = undefined;
  const {fieldSettings} = fieldDefinition || {};

  const widgetProps = omit({
    ...fieldWidgetProps, 
    ...fieldSettings,
    config: config,
    field: field,
    fieldSrc: fieldSrc,
    fieldType: fieldType,
    isLHS: isLHS,
    parentField: parentField,
    parentFuncs: parentFuncs,
    fieldDefinition: fieldDefinition,
    operator: operator,
    delta: delta,
    isSpecialRange: isSpecialRange,
    isFuncArg: isFuncArg,
    value: value,
    valueError,
    fieldError,
    errorMessage,
    label: widgetValueLabel.label,
    placeholder: widgetValueLabel.placeholder,
    placeholders: valueLabels ? valueLabels.placeholder : null,
    textSeparators: textSeparators,
    setValue: setValueHandler,
    readonly: readonly,
    asyncListValues: asyncListValues,
    id, groupId
  }, [
    ..._widgetDefKeysToOmit,
    "toJS"
  ]);

  if (widget == "field") {
    //
  }

  if (isConst && defaultValue) {
    const listValues = fieldSettings?.treeValues || fieldSettings?.listValues;
    if (typeof defaultValue == "boolean") {
      return defaultValue ? (widgetProps.labelYes || "YES") : (widgetProps.labelNo || "NO");
    } else if (listValues) {
      if (Array.isArray(defaultValue))
        return defaultValue.map(v => getTitleInListValues(listValues, v) || v).join(", ");
      else
        return (getTitleInListValues(listValues, defaultValue) || defaultValue);  
    }
    return ""+defaultValue;
  }
    
  return widgetFactory(widgetProps, config.ctx);
};
