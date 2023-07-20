import {
  getFieldConfig, getOperatorConfig, getFieldWidgetConfig, getFuncConfig, getFieldParts, extendConfig,
} from "../utils/configUtils";
import {
  getFieldPathLabels, getWidgetForFieldOp, formatFieldName, completeValue
} from "../utils/ruleUtils";
import omit from "lodash/omit";
import pick from "lodash/pick";
import {defaultValue, widgetDefKeysToOmit, opDefKeysToOmit} from "../utils/stuff";
import {defaultConjunction} from "../utils/defaultUtils";
import {List, Map} from "immutable";
import {SqlString} from "../utils/export";

export const sqlFormat = (tree, config) => {
  return _sqlFormat(tree, config, false);
};

export const _sqlFormat = (tree, config, returnErrors = true) => {
  //meta is mutable
  let meta = {
    errors: []
  };

  const extendedConfig = extendConfig(config, undefined, false);
  const res = formatItem(tree, extendedConfig, meta);

  if (returnErrors) {
    return [res, meta.errors];
  } else {
    if (meta.errors.length)
      console.warn("Errors while exporting to SQL:", meta.errors);
    return res;
  }
};


const formatItem = (item, config, meta) => {
  if (!item) return undefined;
  const type = item.get("type");
  const children = item.get("children1");

  if ((type === "group" || type === "rule_group")) {
    return formatGroup(item, config, meta);
  } else if (type === "rule") {
    return formatRule(item, config, meta);
  }

  return undefined;
};


const formatGroup = (item, config, meta) => {
  const type = item.get("type");
  const properties = item.get("properties") || new Map();
  const children = item.get("children1") || new List();

  const isRuleGroup = (type === "rule_group");
  const groupField = isRuleGroup ? properties.get("field") : null;
  const groupFieldDef = getFieldConfig(config, groupField) || {};
  const mode = groupFieldDef.mode;
  if (mode == "array") {
    meta.errors.push(`Aggregation is not supported for ${groupField}`);
  }

  const not = properties.get("not");
  const canHaveEmptyChildren = false; //isRuleGroup && mode == "array";
  const list = children
    .map((currentChild) => formatItem(currentChild, config, meta))
    .filter((currentChild) => typeof currentChild !== "undefined");
  if (!canHaveEmptyChildren && !list.size)
    return undefined;

  let conjunction = properties.get("conjunction");
  if (!conjunction)
    conjunction = defaultConjunction(config);
  const conjunctionDefinition = config.conjunctions[conjunction];

  return conjunctionDefinition.sqlFormatConj(list, conjunction, not);
};

const buildFnToFormatOp = (operator, operatorDefinition) => {
  const sqlOp = operatorDefinition.sqlOp || operator;
  const cardinality = defaultValue(operatorDefinition.cardinality, 1);
  let fn;
  if (cardinality == 0) {
    fn = (field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) => {
      return `${field} ${sqlOp}`;
    };
  } else if (cardinality == 1) {
    fn = (field, op, value, valueSrc, valueType, opDef, operatorOptions, fieldDef) => {
      return `${field} ${sqlOp} ${value}`;
    };
  } else if (cardinality == 2) {
    // between
    fn = (field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) => {
      const valFrom = values.first();
      const valTo = values.get(1);
      return `${field} ${sqlOp} ${valFrom} AND ${valTo}`;
    };
  }
  return fn;
};

const formatRule = (item, config, meta) => {
  const properties = item.get("properties") || new Map();
  const field = properties.get("field");
  const fieldSrc = properties.get("fieldSrc");
  let operator = properties.get("operator");
  const operatorOptions = properties.get("operatorOptions");
  const iValueSrc = properties.get("valueSrc");
  const iValueType = properties.get("valueType");
  const iValue = properties.get("value");
  const asyncListValues = properties.get("asyncListValues");
  if (field == null || operator == null)
    return undefined;

  const fieldDefinition = getFieldConfig(config, field) || {};
  let opDef = getOperatorConfig(config, operator, field) || {};
  let reversedOp = opDef.reversedOp;
  let revOpDef = getOperatorConfig(config, reversedOp, field) || {};
  const cardinality = defaultValue(opDef.cardinality, 1);

  // check op
  let isRev = false;
  const canFormatOp = opDef.sqlOp || opDef.sqlFormatOp;
  const canFormatRevOp = revOpDef.sqlOp || revOpDef.sqlFormatOp;
  if (!canFormatOp && !canFormatRevOp) {
    meta.errors.push(`Operator ${operator} is not supported`);
    return undefined;
  }
  if (!canFormatOp && canFormatRevOp) {
    isRev = true;
    [operator, reversedOp] = [reversedOp, operator];
    [opDef, revOpDef] = [revOpDef, opDef];
  }

  //format value
  let valueSrcs = [];
  let valueTypes = [];
  const fvalue = iValue.map((currentValue, ind) => {
    const valueSrc = iValueSrc ? iValueSrc.get(ind) : null;
    const valueType = iValueType ? iValueType.get(ind) : null;
    const cValue = completeValue(currentValue, valueSrc, config);
    const widget = getWidgetForFieldOp(config, field, operator, valueSrc);
    const fieldWidgetDefinition = omit(getFieldWidgetConfig(config, field, operator, widget, valueSrc), ["factory"]);
    let fv = formatValue(
      meta, config, cValue, valueSrc, valueType, fieldWidgetDefinition, fieldDefinition, operator, opDef, asyncListValues
    );
    if (fv !== undefined) {
      valueSrcs.push(valueSrc);
      valueTypes.push(valueType);
    }
    return fv;
  });
  const hasUndefinedValues = fvalue.filter(v => v === undefined).size > 0;
  if (hasUndefinedValues || fvalue.size < cardinality)
    return undefined;
  const formattedValue = (cardinality == 1 ? fvalue.first() : fvalue);

  //find fn to format expr
  const fn = opDef.sqlFormatOp || buildFnToFormatOp(operator, opDef);
  if (!fn) {
    meta.errors.push(`Operator ${operator} is not supported`);
    return undefined;
  }
      
  //format field
  const formattedField = fieldSrc == "func"
    ? formatFunc(meta, config, field)
    : formatField(meta, config, field);
  if (formattedField == undefined)
    return undefined;

  //format expr
  const args = [
    formattedField,
    operator,
    formattedValue,
    (valueSrcs.length > 1 ? valueSrcs : valueSrcs[0]),
    (valueTypes.length > 1 ? valueTypes : valueTypes[0]),
    omit(opDef, opDefKeysToOmit),
    operatorOptions,
    fieldDefinition,
  ];

  let ret;
  ret = fn.call(config.ctx, ...args);
  if (isRev) {
    ret = config.settings.sqlFormatReverse(ret);
  }
  if (ret === undefined) {
    meta.errors.push(`Operator ${operator} is not supported for value source ${valueSrcs.join(", ")}`);
    return undefined;
  }
  return ret;
};


const formatValue = (meta, config, currentValue, valueSrc, valueType, fieldWidgetDef, fieldDef, operator, operatorDef, asyncListValues) => {
  if (currentValue === undefined)
    return undefined;
  let ret;
  if (valueSrc == "field") {
    ret = formatField(meta, config, currentValue);
  } else if (valueSrc == "func") {
    ret = formatFunc(meta, config, currentValue);
  } else {
    if (typeof fieldWidgetDef.sqlFormatValue === "function") {
      const fn = fieldWidgetDef.sqlFormatValue;
      const args = [
        currentValue,
        {
          ...pick(fieldDef, ["fieldSettings", "listValues"]),
          asyncListValues
        },
        //useful options: valueFormat for date/time
        omit(fieldWidgetDef, widgetDefKeysToOmit),
      ];
      if (operator) {
        args.push(operator);
        args.push(operatorDef);
      }
      if (valueSrc == "field") {
        const valFieldDefinition = getFieldConfig(config, currentValue) || {}; 
        args.push(valFieldDefinition);
      }
      ret = fn.call(config.ctx, ...args);
    } else {
      if (Array.isArray(currentValue)) {
        ret = currentValue.map(v => SqlString.escape(v));
      } else {
        ret = SqlString.escape(currentValue);
      }
    }
  }
  return ret;
};

const formatField = (meta, config, field) => {
  if (!field) return;
  const {fieldSeparator} = config.settings;
  const fieldDefinition = getFieldConfig(config, field) || {};
  const fieldParts = getFieldParts(field, config);
  const fieldPartsLabels = getFieldPathLabels(field, config);
  const fieldFullLabel = fieldPartsLabels ? fieldPartsLabels.join(fieldSeparator) : null;
  const formatFieldFn = config.settings.formatField;
  const fieldName = formatFieldName(field, config, meta, null, {useTableName: true});
  const formattedField = formatFieldFn(fieldName, fieldParts, fieldFullLabel, fieldDefinition, config);
  return formattedField;
};


const formatFunc = (meta, config, currentValue) => {
  const funcKey = currentValue.get("func");
  const args = currentValue.get("args");
  const funcConfig = getFuncConfig(config, funcKey);
  if (!funcConfig) {
    meta.errors.push(`Func ${funcKey} is not defined in config`);
    return undefined;
  }
  const funcParts = getFieldParts(funcKey, config);
  const funcLastKey = funcParts[funcParts.length-1];
  const funcName = funcConfig.sqlFunc || funcLastKey;

  let formattedArgs = {};
  let gaps = [];
  let missingArgKeys = [];
  for (const argKey in funcConfig.args) {
    const argConfig = funcConfig.args[argKey];
    const fieldDef = getFieldConfig(config, argConfig);
    const {defaultValue, isOptional} = argConfig;
    const defaultValueSrc = defaultValue?.func ? "func" : "value";
    const argVal = args ? args.get(argKey) : undefined;
    const argValue = argVal ? argVal.get("value") : undefined;
    const argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
    const argAsyncListValues = argVal ? argVal.get("asyncListValues") : undefined;
    const formattedArgVal = formatValue(
      meta, config, argValue, argValueSrc, argConfig.type, fieldDef, argConfig, null, null, argAsyncListValues
    );
    if (argValue != undefined && formattedArgVal === undefined) {
      if (argValueSrc != "func") // don't triger error if args value is another uncomplete function
        meta.errors.push(`Can't format value of arg ${argKey} for func ${funcKey}`);
      return undefined;
    }
    let formattedDefaultVal;
    if (formattedArgVal === undefined && !isOptional && defaultValue != undefined) {
      formattedDefaultVal = formatValue(
        meta, config, defaultValue, defaultValueSrc, argConfig.type, fieldDef, argConfig, null, null, argAsyncListValues
      );
      if (formattedDefaultVal === undefined) {
        if (defaultValueSrc != "func") // don't triger error if args value is another uncomplete function
          meta.errors.push(`Can't format default value of arg ${argKey} for func ${funcKey}`);
        return undefined;
      }
    }

    const finalFormattedVal = formattedArgVal ?? formattedDefaultVal;
    if (finalFormattedVal !== undefined) {
      if (gaps.length) {
        for (const missedArgKey of argKey) {
          formattedArgs[missedArgKey] = undefined;
        }
        gaps = [];
      }
      formattedArgs[argKey] = finalFormattedVal;
    } else {
      if (!isOptional)
        missingArgKeys.push(argKey);
      gaps.push(argKey);
    }
  }
  if (missingArgKeys.length) {
    //meta.errors.push(`Missing vals for args ${missingArgKeys.join(", ")} for func ${funcKey}`);
    return undefined; // uncomplete
  }

  let ret;
  if (typeof funcConfig.sqlFormatFunc === "function") {
    const fn = funcConfig.sqlFormatFunc;
    const args = [
      formattedArgs
    ];
    ret = fn.call(config.ctx, ...args);
  } else {
    const argsStr = Object.entries(formattedArgs)
      .map(([k, v]) => v)
      .join(", ");
    ret = `${funcName}(${argsStr})`;
  }
  return ret;
};
