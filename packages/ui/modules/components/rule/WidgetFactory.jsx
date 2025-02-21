import React, { useMemo, memo } from "react";
import { Utils } from "@react-awesome-query-builder/core";
import omit from "lodash/omit";
const { getTitleInListValues } = Utils.ListUtils;
const { _widgetDefKeysToOmit } = Utils.ConfigUtils;
const { _fixImmutableValue, isImmutable } = Utils.TreeUtils;

const WidgetFactoryMemo = memo(({
  widgetFactory,
  ...widgetProps
}) => {
  const { config, isFuncArg, fieldDefinition } = widgetProps;
  const { fieldSettings, defaultValue, valueSources } = fieldDefinition || {};
  const isConst = isFuncArg && valueSources?.length == 1 && valueSources?.[0] === "const";
  const listValues = fieldSettings?.treeValues || fieldSettings?.listValues;

  if (isConst && defaultValue) {
    if (typeof defaultValue === "boolean") {
      return defaultValue ? (widgetProps.labelYes || "YES") : (widgetProps.labelNo || "NO");
    } else if (listValues) {
      if (Array.isArray(defaultValue))
        return defaultValue.map(v => getTitleInListValues(listValues, v) || v).join(", ");
      else
        return (getTitleInListValues(listValues, defaultValue) || defaultValue);  
    }
    return ""+defaultValue;
  }

  if (!widgetFactory) {
    return "?";
  }

  return widgetFactory(widgetProps, config.ctx);
});

WidgetFactoryMemo.displayName = "WidgetFactoryMemo";

const WidgetFactory = ({
  delta, isFuncArg, valueSrc,
  value: immValue, valueError: immValueError, fieldError, asyncListValues,
  isSpecialRange, fieldDefinition,
  widget, widgetDefinition, widgetValueLabel, valueLabels, textSeparators, setValue, setFuncValue,
  config, field, fieldSrc, fieldPath, fieldType, isLHS, operator, readonly, parentField, parentFuncs, id, groupId, widgetId,
}) => {
  const {factory: widgetFactory, ...fieldWidgetProps} = widgetDefinition;

  // Widget value (if it's not a func with args) should NOT be Immutable
  // Eg. for multiselect value should be a JS Array, not Immutable List
  const fixedImmValue = immValue ? immValue.map(v => _fixImmutableValue(v)) : undefined;
  const value = useMemo(() => {
    if (isSpecialRange) {
      let value = [ fixedImmValue?.get(0), fixedImmValue?.get(1) ];
      if (value[0] === undefined && value[1] === undefined)
        value = undefined;
      return value;
    }
    return fixedImmValue?.get(delta);
  }, [ isSpecialRange, immValue ]);
  const valueError = useMemo(() => {
    if (!immValueError) {
      return null;
    }
    if (isSpecialRange) {
      return [ immValueError.get(0), immValueError.get(1), immValueError.get(2) ];
    }
    return immValueError?.get?.(delta);
  }, [ isSpecialRange, immValue ]);
  const errorMessage = isLHS ? fieldError : valueError;
  const { fieldSettings } = fieldDefinition || {};
  const { label, placeholder } = widgetValueLabel;
  const placeholders = valueLabels ? valueLabels.placeholder : null;
  const simpleField = isImmutable(field) ? null : field;

  const widgetProps = omit({
    ...fieldWidgetProps, 
    ...fieldSettings,
    config,
    field: simpleField, // !!! using of field prop in widget is strongly discouraged
    fieldPath,
    fieldSrc,
    fieldType,
    isLHS,
    parentField,
    parentFuncs,
    fieldDefinition,
    operator,
    delta,
    isSpecialRange,
    isFuncArg,
    value,
    valueSrc,
    valueError,
    fieldError,
    errorMessage,
    label,
    placeholder,
    placeholders,
    textSeparators,
    setValue,
    setFuncValue,
    readonly,
    asyncListValues,
    id,
    groupId,
    widgetId,
    widgetFactory,
    widget,
  }, [
    ..._widgetDefKeysToOmit,
    "toJS"
  ]);

  return <WidgetFactoryMemo
    widgetFactory={widgetFactory}
    {...widgetProps}
  />;
};

WidgetFactory.displayName = "WidgetFactory";

export default WidgetFactory;
