import Immutable from "immutable";
import {
  getFieldConfig, getOperatorConfig, getFieldWidgetConfig, getWidgetForFieldOp, getValueSourcesForFieldOp, selectTypes,
} from "./configUtils";
import { getOpCardinality, getFirstDefined } from "./stuff";
import { translateValidation } from "../i18n";

/**
 * @param {Immutable.Map} current
 * @param {string} changedProp
 * @param {boolean} canFix (default: false) true - eg. set value to max if it > max or revert or drop
 * @param {boolean} isEndValue (default: false) true - if value is in process of editing by user
 * @param {boolean} canDropArgs (default: false)
 * @return {{canReuseValue, newValue, newValueSrc, newValueType, fixedField, operatorCardinality,  newValueError, newFieldError, validationErrors}}
 */
export const getNewValueForFieldOp = function (
  {
    // DO NOT import { validateValue, validateRange } from "./validation"
    // it will create import loop
    validateValue,
    validateRange,
  },
  config, oldConfig = null, current, newField, newOperator, changedProp = null,
  canFix = false, isEndValue = false, canDropArgs = false
) {
  //const isValidatingTree = (changedProp === null);
  if (!oldConfig)
    oldConfig = config;
  const {
    keepInputOnChangeFieldSrc, convertableWidgets, clearValueOnChangeField, clearValueOnChangeOp,
  } = config.settings;
  const isCase = newField == "!case_value";
  let currentField = current.get("field");
  if (!currentField && isCase) {
    currentField = newField;
  }
  const currentFieldType = current.get("fieldType");
  const currentFieldSrc = current.get("fieldSrc");
  const currentOperator = current.get("operator");
  const currentValue = current.get("value");
  const currentValueSrc = current.get("valueSrc", new Immutable.List());
  const currentValueType = current.get("valueType", new Immutable.List());
  const currentValueError = current.get("valueError", new Immutable.List());
  const asyncListValues = current.get("asyncListValues");

  const isOkWithoutOperator = isCase;
  const currentOperatorConfig = getOperatorConfig(oldConfig, currentOperator);
  const newOperatorConfig = getOperatorConfig(config, newOperator, newField);
  const currentOperatorCardinality = isCase ? 1 : currentOperator ? getOpCardinality(currentOperatorConfig) : null;
  const operatorCardinality = isCase ? 1 : newOperator ? getOpCardinality(newOperatorConfig) : null;
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

  let validationErrors = [];

  let canReuseValue = (currentField || isOkWithoutField)
    && (currentOperator && newOperator || isOkWithoutOperator)
    && currentValue != undefined;
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
  if (!isOkWithoutOperator && (!currentValue?.size && operatorCardinality || currentValue?.size && !operatorCardinality)) {
    canReuseValue = false;
  }

  // validate func LHS
  let newFieldError;
  if (currentFieldSrc === "func" && newField) {
    const [fixedField, fieldErrors] = validateValue(
      config, null, null, newOperator, newField, newType, currentFieldSrc, asyncListValues, canFix, isEndValue, canDropArgs
    );
    const isValid = !fieldErrors?.length;
    const willFix = fixedField !== newField;
    const willFixAllErrors = !isValid && willFix && !fieldErrors.find(e => !e.fixed);
    const willRevert = canFix && !isValid && !willFixAllErrors && !!changedProp && newField !== currentField;
    const willDrop = false; //canFix && !isValid && !willFixAllErrors && !willRevert && !changedProp;
    if (willDrop) {
      newField = null;
    } else if (willRevert) {
      newField = currentField;
    } else if (willFix) {
      newField = fixedField;
    }
    if (!isValid) {
      const showError = !isValid && !willFixAllErrors && !willDrop && !willRevert;
      const firstError = fieldErrors.find(e => !e.fixed && !e.ignore);
      if (showError && firstError) {
        newFieldError = translateValidation(firstError);
      }
      // tip: even if we don't show errors, but revert LHS, put the reason of revert
      fieldErrors.map(e => validationErrors.push({
        side: "lhs",
        ...e,
        fixed: e.fixed || willRevert || willDrop,
      }));
    }
  }

  // compare old & new widgets
  for (let i = 0 ; i < operatorCardinality ; i++) {
    const vs = currentValueSrc.get(i) || null;
    const currentWidget = getWidgetForFieldOp(oldConfig, currentField, currentOperator, vs);
    const newWidget = getWidgetForFieldOp(config, newField, newOperator, vs);
    // need to also check value widgets if we changed operator and current value source was 'field'
    // cause for select type op '=' requires single value and op 'in' requires array value
    const currentValueWidget = vs === "value" ? currentWidget
      : getWidgetForFieldOp(oldConfig, currentField, currentOperator, "value");
    const newValueWidget = vs === "value" ? newWidget
      : getWidgetForFieldOp(config, newField, newOperator, "value");

    const canReuseWidget = newValueWidget == currentValueWidget
      || (convertableWidgets[currentValueWidget] || []).includes(newValueWidget)
      || !currentValueWidget && isOkWithoutField;
    if (!canReuseWidget) {
      canReuseValue = false;
    }
  }

  if (currentOperator != newOperator && [currentOperator, newOperator].includes("proximity")) {
    canReuseValue = false;
  }

  const firstValueSrc = currentValueSrc.first();
  const firstWidgetConfig = getFieldWidgetConfig(config, newField, newOperator, null, firstValueSrc);
  let valueSources = getValueSourcesForFieldOp(config, newField, newOperator, null);
  if (!newField && isOkWithoutField) {
    valueSources = Object.keys(config.settings.valueSourcesInfo);
  }
  const defaultValueSrc = valueSources[0];
  let defaultValueType;
  if (operatorCardinality === 1 && firstWidgetConfig && firstWidgetConfig.type !== undefined) {
    defaultValueType = firstWidgetConfig.type;
  } else if (operatorCardinality === 1 && newFieldConfig && newFieldConfig.type !== undefined) {
    defaultValueType = newFieldConfig.type === "!group" ? "number" : newFieldConfig.type;
  }

  // changed operator from '==' to 'between'
  let canExtendValueToRange = canReuseValue && changedProp === "operator"
    && currentOperatorCardinality === 1 && operatorCardinality === 2;

  let valueFixes = [];
  let valueSrcFixes = [];
  let valueTypeFixes = [];
  let valueErrors = Array.from({length: operatorCardinality}, () => null);
  if (canReuseValue) {
    for (let i = 0 ; i < operatorCardinality ; i++) {
      let v = currentValue.get(i);
      let vType = currentValueType.get(i) || null;
      let vSrc = currentValueSrc.get(i) || null;
      if (canExtendValueToRange && i === 1) {
        v = valueFixes[0] !== undefined ? valueFixes[0] : currentValue.get(0);
        valueFixes[i] = v;
        vType = currentValueType.get(0) || null;
        vSrc = currentValueSrc.get(0) || null;
      }
      const isValidSrc = vSrc ? (valueSources.find(v => v == vSrc) !== undefined) : true;
      const [fixedValue, allErrors] = validateValue(
        config, newField, newField, newOperator, v, vType, vSrc, asyncListValues, canFix, isEndValue, canDropArgs
      );
      const isValid = !allErrors?.length;
      // Allow bad value with error message
      // But not on field change - in that case just drop bad value that can't be reused
      // ? Maybe we should also drop bad value on op change?
      // For bad multiselect value we have both error message + fixed value.
      //  If we show error message, it will gone on next tree validation
      const willFix = fixedValue !== v;
      const willFixAllErrors = !isValid && willFix && !allErrors?.find(e => !e.fixed);
      const allErrorsHandled = !allErrors?.find(e => !e.fixed && !e.ignore);
     
      // tip: is value src is invalid, drop ANYWAY
      // tip: Edge case in demo:
      //      Given "login = LOWER(?)", change config to not show errors -> "LOWER(?)" will be dropped
      //      We don't want to drop func completely, so need to add `allErrorsAheHandled` or `vSrc !== "func"`
      // todo: `hasFieldChanged` is not needed ?
      const willDrop = !isValidSrc
        || canFix && !isValid && !willFixAllErrors && (!allErrorsHandled || hasFieldChanged);
      if (!isValid) {
        // tip: even if we don't show errors, but drop bad values, put the reason of removal
        allErrors?.map(e => validationErrors.push({
          side: "rhs",
          delta: i,
          ...e,
          fixed: e.fixed || willDrop,
        }));
      }
      if (willDrop) {
        valueFixes[i] = null;
        if (i === 0) {
          delete valueFixes[1];
        }
      }
      const showError = !isValid && !willFix;
      const firstError = allErrors?.find(e => !e.fixed && !e.ignore);
      if (showError && firstError) {
        valueErrors[i] = translateValidation(firstError);
      }
      if (willFix) {
        valueFixes[i] = fixedValue;
      }
      if (canExtendValueToRange && i === 0 && !isValid && !willFix) {
        // don't extend bad value to range
        canExtendValueToRange = false;
      }
      if (canExtendValueToRange && i === 0 && ["func", "field"].includes(vSrc)) {
        // don't extend func/field value, only primitive value
        canExtendValueToRange = false;
      }
    }
  }

  // if can't reuse, get defaultValue
  if (!canReuseValue) {
    for (let i = 0 ; i < operatorCardinality ; i++) {
      if (operatorCardinality === 1) {
        // tip: default range values (for cardinality > 1) are not supported yet, todo
        const dv = getFirstDefined([
          newFieldConfig?.defaultValue,
          newFieldConfig?.fieldSettings?.defaultValue,
          firstWidgetConfig?.defaultValue
        ]);
        valueFixes[i] = dv;
        if (dv?.func) {
          valueSrcFixes[i] = "func";
          //tip: defaultValue of src "field" is not supported, todo
        }
      }
    }
  }

  // set default valueSrc and valueType
  for (let i = 0 ; i < operatorCardinality ; i++) {
    let vs = canReuseValue && currentValueSrc.get(i) || null;
    let vt = canReuseValue && currentValueType.get(i) || null;
    if (canReuseValue && canExtendValueToRange && i === 1) {
      vs = valueSrcFixes[i] ?? currentValueSrc.get(0);
      vt = valueTypeFixes[i] ?? currentValueType.get(0);
      valueSrcFixes[i] = vs;
      valueTypeFixes[i] = vt;
    }
    const isValidSrc = valueSources.includes(vs);
    if (!isValidSrc) {
      valueSrcFixes[i] = defaultValueSrc;
    }
    if (!vt) {
      valueTypeFixes[i] = defaultValueType;
    }
  }

  // build new values
  let newValue = currentValue;
  if (valueFixes.length > 0 || !canReuseValue) {
    newValue = new Immutable.List(Array.from({length: operatorCardinality}, (_ignore, i) => {
      return valueFixes[i] !== undefined ? valueFixes[i] : (canReuseValue ? currentValue.get(i) : undefined);
    }));
  }
  let newValueSrc = currentValueSrc;
  if (valueSrcFixes.length > 0 || !canReuseValue) {
    newValueSrc = new Immutable.List(Array.from({length: operatorCardinality}, (_ignore, i) => {
      return valueSrcFixes[i] ?? (canReuseValue && currentValueSrc.get(i) || null);
    }));
  }
  let newValueType = currentValueType;
  if (valueTypeFixes.length > 0 || !canReuseValue) {
    newValueType = new Immutable.List(Array.from({length: operatorCardinality}, (_ignore, i) => {
      return valueTypeFixes[i] ?? (canReuseValue && currentValueType.get(i) || null);
    }));
  }

  // Validate range
  const rangeErrorObj = validateRange(config, newField, newOperator, newValue, newValueSrc);
  if (rangeErrorObj) {
    // last element in `valueError` list is for range validation error
    const rangeValidationError = translateValidation(rangeErrorObj);
    const willFix = canFix && operatorCardinality >= 2;
    const badValue = newValue;
    if (willFix) {
      valueFixes[1] = newValue.get(0);
      newValue = newValue.set(1, valueFixes[1]);
      valueErrors[1] = valueErrors[0];
    }
    const showError = !willFix;
    if (showError) {
      valueErrors.push(rangeValidationError);
    }
    validationErrors.push({
      side: "rhs",
      delta: -1,
      ...rangeErrorObj,
      fixed: willFix,
      fixedFrom: willFix ? [badValue.get(0), badValue.get(1)] : undefined,
      fixedTo: willFix ? [newValue.get(0), newValue.get(1)] : undefined
    });
  }

  let newValueError = currentValueError;
  const hasValueErrorChanged = currentValueError?.size !== valueErrors.length
    || valueErrors.filter((v, i) => (v != currentValueError.get(i))).length > 0;
  if (hasValueErrorChanged) {
    newValueError = new Immutable.List(valueErrors);
  }

  return {
    canReuseValue, newValue, newValueSrc, newValueType, operatorCardinality, fixedField: newField,
    newValueError, newFieldError, validationErrors,
  };
};
