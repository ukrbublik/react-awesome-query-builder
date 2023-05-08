import {
  getFieldConfig, getOperatorConfig, getFieldWidgetConfig, getFuncConfig, getFieldParts, extendConfig,
} from "../utils/configUtils";
import {
  getFieldPathLabels, getWidgetForFieldOp, formatFieldName, completeValue
} from "../utils/ruleUtils";
import omit from "lodash/omit";
import pick from "lodash/pick";
import {getOpCardinality, widgetDefKeysToOmit, opDefKeysToOmit} from "../utils/stuff";
import {defaultConjunction} from "../utils/defaultUtils";
import {List, Map} from "immutable";


export const queryString = (item, config, isForDisplay = false, isDebugMode = false) => {
  //meta is mutable
  let meta = {
    errors: [],
    settings: {
      isForDisplay,
      isDebugMode,
    }
  };

  const extendedConfig = extendConfig(config, undefined, false);
  const res = formatItem(item, extendedConfig, meta, null);

  if (meta.errors.length)
    console.warn("Errors while exporting to string:", meta.errors);
  return res;
};


const formatItem = (item, config, meta, parentField = null) => {
  if (!item) return undefined;
  const type = item.get("type");
  const children = item.get("children1");

  if ((type === "group" || type === "rule_group") ) {
    return formatGroup(item, config, meta, parentField);
  } else if (type === "rule") {
    return formatRule(item, config, meta, parentField);
  }

  return undefined;
};


const formatGroup = (item, config, meta, parentField = null) => {
  const { isForDisplay, isDebugMode } = meta.settings;
  const type = item.get("type");
  const properties = item.get("properties") || new Map();
  const mode = properties.get("mode");
  const children = item.get("children1") || new List();

  const isRuleGroup = (type === "rule_group");
  // TIP: don't cut group for mode == 'struct' and don't do aggr format (maybe later)
  const groupField = isRuleGroup && mode === "array" ? properties.get("field") : null;
  const groupOperator = type === "rule_group" ? properties.get("operator") : null;
  const groupOperatorCardinality = groupOperator ? config.operators[groupOperator]?.cardinality ?? 1 : undefined;
  const canHaveEmptyChildren = isRuleGroup && mode === "array" && groupOperatorCardinality >= 1;
  const not = properties.get("not");
  const list = children
    .map((currentChild) => formatItem(currentChild, config, meta, groupField))
    .filter((currentChild) => typeof currentChild !== "undefined");
  if (!canHaveEmptyChildren && !list.size && !isDebugMode) {
    return undefined;
  }

  let conjunction = properties.get("conjunction");
  if (!conjunction)
    conjunction = defaultConjunction(config);
  const conjunctionDefinition = config.conjunctions[conjunction];

  const conjStr = list.size ? conjunctionDefinition.formatConj(list, conjunction, not, isForDisplay, groupField) : null;
  
  let ret;
  if (groupField) {
    const aggrArgs = formatRule(item, config, meta, parentField, true);
    if (aggrArgs) {
      const isRev = aggrArgs.pop();
      const args = [
        conjStr,
        ...aggrArgs
      ];
      ret = config.settings.formatAggr(...args);
      if (isRev) {
        ret = config.settings.formatReverse(ret, null, null, null, null, isForDisplay);
      }
    }
  } else {
    ret = conjStr;
  }

  if (isDebugMode && ret == null) {
    ret = "?";
  }
  return ret;
};


const formatItemValue = (config, properties, meta, _operator, parentField) => {
  const { isForDisplay, isDebugMode } = meta.settings;
  const field = properties.get("field");
  const iValueSrc = properties.get("valueSrc");
  const iValueType = properties.get("valueType");
  const fieldDef = getFieldConfig(config, field) || {};
  const operator = _operator || properties.get("operator");
  const operatorDef = getOperatorConfig(config, operator, field) || {};
  const cardinality = getOpCardinality(operatorDef);
  const iValue = properties.get("value");
  const asyncListValues = properties.get("asyncListValues");

  let valueSrcs = [];
  let valueTypes = [];
  let formattedValue;
  let fvalue;

  if (iValue != undefined) {
    fvalue = iValue.map((currentValue, ind) => {
      const valueSrc = iValueSrc ? iValueSrc.get(ind) : null;
      const valueType = iValueType ? iValueType.get(ind) : null;
      const cValue = !isDebugMode ? completeValue(currentValue, valueSrc, config) : currentValue;
      const widget = getWidgetForFieldOp(config, field, operator, valueSrc);
      const fieldWidgetDef = omit(getFieldWidgetConfig(config, field, operator, widget, valueSrc), ["factory"]);
      let fv = formatValue(
        config, meta, cValue, valueSrc, valueType, fieldWidgetDef, fieldDef, operator, operatorDef, parentField, asyncListValues
      );
      if (fv !== undefined) {
        valueSrcs.push(valueSrc);
        valueTypes.push(valueType);
      }
      return fv;
    });
    const hasUndefinedValues = fvalue.filter(v => v === undefined).size > 0;
    const isOK = !hasUndefinedValues && fvalue.size === cardinality;
    if (isOK) {
      formattedValue = (cardinality == 1 ? fvalue.first() : fvalue);
    }
  }
  if (isDebugMode && !formattedValue) {
    formattedValue = cardinality > 1 ? new List(Array.from({length: cardinality}).map(
      (_, i) => fvalue?.get(i) ?? "?")
    ) : "?";
  }

  return [
    formattedValue, 
    (valueSrcs.length > 1 ? valueSrcs : valueSrcs[0]),
    (valueTypes.length > 1 ? valueTypes : valueTypes[0]),
  ];
};

const buildFnToFormatOp = (operator, operatorDefinition, meta) => {
  const { isDebugMode } = meta.settings;
  const fop = operatorDefinition?.labelForFormat || operator;
  const cardinality = getOpCardinality(operatorDefinition);
  let fn;
  if (cardinality == 0) {
    fn = (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
      return `${field} ${fop}`;
    };
  } else if (cardinality == 1) {
    fn = (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
      if (isDebugMode && op === "?" && values === "?") {
        return field && field !== "?" ? `${field} ?` : "?";
      }
      return `${field} ${fop} ${values}`;
    };
  } else if (cardinality == 2) {
    // between
    fn = (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
      const valFrom = values?.first?.();
      const valTo = values?.get?.(1);
      return `${field} ${fop} ${valFrom} AND ${valTo}`;
    };
  }
  return fn;
};

const formatRule = (item, config, meta, parentField = null, returnArgs = false) => {
  const { isForDisplay, isDebugMode } = meta.settings;
  const properties = item.get("properties") || new Map();
  const field = properties.get("field");
  const fieldSrc = properties.get("fieldSrc");
  let operator = properties.get("operator");
  let operatorOptions = properties.get("operatorOptions");
  if ((field == null || operator == null) && !isDebugMode)
    return undefined;
  
  const fieldDef = getFieldConfig(config, field) || {};
  let operatorDef = getOperatorConfig(config, operator, field) || {};
  let reversedOp = operatorDef.reversedOp;
  let revOperatorDef = getOperatorConfig(config, reversedOp, field) || {};
  
  //check op
  let isRev = false;
  let fn = operatorDef.formatOp;
  if (!fn && reversedOp) {
    fn = revOperatorDef.formatOp;
    if (fn) {
      isRev = true;
      [operator, reversedOp] = [reversedOp, operator];
      [operatorDef, revOperatorDef] = [revOperatorDef, operatorDef];
    }
  }

  if (isDebugMode && !operator) {
    operator = "?";
  }

  //find fn to format expr
  if (!fn)
    fn = buildFnToFormatOp(operator, operatorDef, meta);
  if (!fn)
    return undefined;

  //format field
  const formattedField = fieldSrc === "func"
    ? formatFunc(config, meta, field, parentField)
    : formatField(config, meta, field, parentField);
  if (formattedField == undefined)
    return undefined;

  //format value
  const [formattedValue, valueSrc, valueType] = formatItemValue(
    config, properties, meta, operator, parentField
  );
  if (formattedValue === undefined) {
    return undefined;
  }

  const args = [
    formattedField,
    operator,
    formattedValue,
    valueSrc,
    valueType,
    omit(operatorDef, opDefKeysToOmit),
    operatorOptions,
    isForDisplay,
    fieldDef,
    isRev,
  ];

  if (returnArgs) {
    return args;
  } else {
    if (formattedValue === undefined)
      return undefined;

    //format expr
    let ret = fn.call(config.ctx, ...args);

    //rev
    if (isRev) {
      ret = config.settings.formatReverse(ret, operator, reversedOp, operatorDef, revOperatorDef, isForDisplay);
    }

    return ret;
  }
};


const formatValue = (config, meta, value, valueSrc, valueType, fieldWidgetDef, fieldDef, operator, opDef, parentField = null, asyncListValues) => {
  const { isForDisplay, isDebugMode } = meta.settings;
  if (value === undefined) {
    if (isDebugMode) {
      if (fieldWidgetDef?.jsType === "array") {
        return [];
      }
      return "?";
    } else {
      return undefined;
    }
  }
  let ret;
  if (valueSrc == "field") {
    ret = formatField(config, meta, value, parentField);
  } else if (valueSrc == "func") {
    ret = formatFunc(config, meta, value, parentField);
  } else {
    if (typeof fieldWidgetDef.formatValue === "function") {
      const fn = fieldWidgetDef.formatValue;
      const args = [
        value,
        {
          ...pick(fieldDef, ["fieldSettings", "listValues"]),
          asyncListValues
        },
        //useful options: valueFormat for date/time
        omit(fieldWidgetDef, widgetDefKeysToOmit),
        isForDisplay
      ];
      if (operator) {
        args.push(operator);
        args.push(opDef);
      }
      if (valueSrc == "field") {
        const valFieldDefinition = getFieldConfig(config, value) || {}; 
        args.push(valFieldDefinition);
      }
      ret = fn.call(config.ctx, ...args);
    } else {
      ret = value;
    }
  }
  return ret;
};


const formatField = (config, meta, field, parentField = null, cutParentField = true) => {
  const { isForDisplay, isDebugMode } = meta.settings;
  const {fieldSeparator, fieldSeparatorDisplay} = config.settings;
  let ret = null;
  if (field) {
    const fieldDefinition = getFieldConfig(config, field) || {};
    const fieldParts = getFieldParts(field, config);
    const fieldPartsLabels = getFieldPathLabels(field, config, cutParentField ? parentField : null);
    const fieldFullLabel = fieldPartsLabels ? fieldPartsLabels.join(fieldSeparatorDisplay) : null;
    const fieldLabel2 = fieldDefinition.label2 || fieldFullLabel;
    const formatFieldFn = config.settings.formatField;
    const fieldName = formatFieldName(field, config, meta, cutParentField ? parentField : null, {useTableName: true});
    ret = formatFieldFn(fieldName, fieldParts, fieldLabel2, fieldDefinition, config, isForDisplay, parentField);
  } else if(isDebugMode) {
    ret = "?";
  }
  return ret;
};


const formatFunc = (config, meta, funcValue, parentField = null) => {
  const { isForDisplay, isDebugMode } = meta.settings;
  const funcKey = funcValue?.get?.("func");
  if (!funcKey) {
    return isDebugMode ? "?()" : undefined;
  }
  const args = funcValue.get?.("args");
  const funcConfig = getFuncConfig(config, funcKey);
  if (!funcConfig) {
    if (!isDebugMode) {
      meta.errors.push(`Func ${funcKey} is not defined in config`);
      return undefined;
    }
  }
  const funcParts = getFieldParts(funcKey, config);
  const funcLastKey = funcParts[funcParts.length-1];
  const funcName = isForDisplay && funcConfig?.label || funcLastKey;

  let formattedArgs = {};
  let gaps = [];
  let missingArgKeys = [];
  let formattedArgsWithNames = {};
  const argsKeys = funcConfig ? Object.keys(funcConfig.args || {}) : args?.keySeq?.().toArray() || [];
  for (const argKey of argsKeys) {
    const argConfig = funcConfig?.args[argKey];
    const fieldDef = getFieldConfig(config, argConfig);
    const {defaultValue, isOptional} = argConfig || {};
    const defaultValueSrc = defaultValue?.func ? "func" : "value";
    const argName = isForDisplay && argConfig?.label || argKey;
    const argVal = args ? args.get(argKey) : undefined;
    let argValue = argVal ? argVal.get("value") : undefined;
    const argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
    if (argValueSrc !== "func" && argValue?.toJS) {
      // value should not be Immutable
      argValue = argValue.toJS();
    }
    const argAsyncListValues = argVal ? argVal.get("asyncListValues") : undefined;
    const formattedArgVal = formatValue(
      config, meta, argValue, argValueSrc, argConfig?.type, fieldDef, argConfig, null, null, parentField, argAsyncListValues
    );
    if (argValue != undefined && formattedArgVal === undefined) {
      if (argValueSrc != "func") // don't triger error if args value is another incomplete function
        meta.errors.push(`Can't format value of arg ${argKey} for func ${funcKey}`);
    }

    let formattedDefaultVal;
    if (formattedArgVal === undefined && !isOptional && defaultValue != undefined) {
      formattedDefaultVal = formatValue(
        config, meta, defaultValue, defaultValueSrc, argConfig?.type, fieldDef, argConfig, null, null, parentField, argAsyncListValues
      );
      if (formattedDefaultVal === undefined) {
        if (defaultValueSrc != "func") // don't triger error if args value is another incomplete function
          meta.errors.push(`Can't format default value of arg ${argKey} for func ${funcKey}`);
        return undefined;
      }
    }

    const finalFormattedVal = formattedArgVal ?? formattedDefaultVal;
    if (finalFormattedVal !== undefined) {
      if (gaps.length) {
        for (const [missedArgKey, missedArgName] of argKey) {
          formattedArgs[missedArgKey] = undefined;
          //formattedArgsWithNames[missedArgName] = undefined;
        }
        gaps = [];
      }
      formattedArgs[argKey] = finalFormattedVal;
      formattedArgsWithNames[argName] = finalFormattedVal;
    } else {
      if (!isOptional)
        missingArgKeys.push(argKey);
      gaps.push([argKey, argName]);
    }
  }
  if (missingArgKeys.length) {
    //meta.errors.push(`Missing vals for args ${missingArgKeys.join(", ")} for func ${funcKey}`);
    if (!isDebugMode) {
      return undefined; // incomplete
    }
  }

  let ret = null;
  if (typeof funcConfig?.formatFunc === "function") {
    const fn = funcConfig.formatFunc;
    const args = [
      formattedArgs,
      isForDisplay
    ];
    ret = fn.call(config.ctx, ...args);
  } else {
    const argsStr = Object.entries(isForDisplay ? formattedArgsWithNames : formattedArgs)
      .map(([k, v]) => (isForDisplay ? `${k}: ${v}` : `${v}`))
      .join(", ");
    ret = `${funcName}(${argsStr})`;
  }
  return ret;
};
