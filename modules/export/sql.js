import {
  getFieldConfig, getOperatorConfig, getFieldWidgetConfig, getFuncConfig
} from "../utils/configUtils";
import {
  getFieldPath, getFieldPathLabels, getWidgetForFieldOp, formatFieldName
} from "../utils/ruleUtils";
import omit from "lodash/omit";
import pick from "lodash/pick";
import {defaultValue} from "../utils/stuff";
import {defaultConjunction} from "../utils/defaultUtils";
import {settings as defaultSettings} from "../config/default";
import {completeValue} from "../utils/funcUtils";
import {Map} from "immutable";
import {SqlString} from "../utils/export";


export const sqlFormat = (tree, config) => {
  //meta is mutable
  let meta = {
    errors: []
  };

  const res = formatItem(tree, config, meta);

  if (meta.errors.length)
    console.warn("Errors while exporting to SQL:", meta.errors);
  return res;
};


const formatItem = (item, config, meta) => {
  if (!item) return undefined;
  const type = item.get("type");
  const children = item.get("children1");

  if ((type === "group" || type === "rule_group") && children && children.size) {
    return formatGroup(item, config, meta);
  } else if (type === "rule") {
    return formatRule(item, config, meta);
  }

  return undefined;
};


const formatGroup = (item, config, meta) => {
  const type = item.get("type");
  const properties = item.get("properties") || new Map();
  const children = item.get("children1");

  const groupField = type === "rule_group" ? properties.get("field") : null;
  const groupFieldDef = getFieldConfig(config, groupField) || {};
  if (groupFieldDef.mode == "array") {
    meta.errors.push(`Aggregation is not supported for ${groupField}`);
  }

  const not = properties.get("not");
  const list = children
    .map((currentChild) => formatItem(currentChild, config, meta))
    .filter((currentChild) => typeof currentChild !== "undefined");
  if (!list.size)
    return undefined;

  let conjunction = properties.get("conjunction");
  if (!conjunction)
    conjunction = defaultConjunction(config);
  const conjunctionDefinition = config.conjunctions[conjunction];

  return conjunctionDefinition.sqlFormatConj(list, conjunction, not);
};


const formatRule = (item, config, meta) => {
  const properties = item.get("properties") || new Map();
  const field = properties.get("field");
  const operator = properties.get("operator");
  const operatorOptions = properties.get("operatorOptions");
  const iValueSrc = properties.get("valueSrc");
  const iValueType = properties.get("valueType");
  const iValue = properties.get("value");
  if (field == null || operator == null)
    return undefined;

  const fieldDefinition = getFieldConfig(config, field) || {};
  const operatorDefinition = getOperatorConfig(config, operator, field) || {};
  const reversedOp = operatorDefinition.reversedOp;
  const revOperatorDefinition = getOperatorConfig(config, reversedOp, field) || {};
  const cardinality = defaultValue(operatorDefinition.cardinality, 1);

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
      meta, config, cValue, valueSrc, valueType, fieldWidgetDefinition, fieldDefinition, operator, operatorDefinition
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
  let isRev = false;
  let fn = operatorDefinition.sqlFormatOp;
  if (!fn && reversedOp) {
    fn = revOperatorDefinition.sqlFormatOp;
    if (fn) {
      isRev = true;
    }
  }
  if (!fn) {
    const sqlOp = operatorDefinition.sqlOp || operator;
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
  }
  if (!fn) {
    meta.errors.push(`Operator ${operator} is not supported`);
    return undefined;
  }
      
  //format field
  const formattedField = formatField(meta, config, field);
      
  //format expr
  const args = [
    formattedField,
    operator,
    formattedValue,
    (valueSrcs.length > 1 ? valueSrcs : valueSrcs[0]),
    (valueTypes.length > 1 ? valueTypes : valueTypes[0]),
    omit(operatorDefinition, ["formatOp", "mongoFormatOp", "sqlFormatOp", "jsonLogic"]),
    operatorOptions,
    fieldDefinition,
  ];

  let ret;
  ret = fn(...args);
  if (isRev) {
    ret = config.settings.sqlFormatReverse(ret, operator, reversedOp, operatorDefinition, revOperatorDefinition);
  }
  if (ret === undefined) {
    meta.errors.push(`Operator ${operator} is not supported for value source ${valueSrcs.join(", ")}`);
    return undefined;
  }
  return ret;
};


const formatValue = (meta, config, currentValue, valueSrc, valueType, fieldWidgetDef, fieldDef, operator, operatorDef) => {
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
        pick(fieldDef, ["fieldSettings", "listValues"]),
        //useful options: valueFormat for date/time
        omit(fieldWidgetDef, ["formatValue", "mongoFormatValue", "sqlFormatValue", "jsonLogic", "elasticSearchFormatValue"]),
      ];
      if (operator) {
        args.push(operator);
        args.push(operatorDef);
      }
      if (valueSrc == "field") {
        const valFieldDefinition = getFieldConfig(config, currentValue) || {}; 
        args.push(valFieldDefinition);
      }
      ret = fn(...args);
    } else {
      ret = SqlString.escape(currentValue);
    }
  }
  return ret;
};

const formatField = (meta, config, field) => {
  const {fieldSeparator} = config.settings;
  const fieldDefinition = getFieldConfig(config, field) || {};
  const fieldParts = Array.isArray(field) ? field : field.split(fieldSeparator);
  const _fieldKeys = getFieldPath(field, config);
  const fieldPartsLabels = getFieldPathLabels(field, config);
  const fieldFullLabel = fieldPartsLabels ? fieldPartsLabels.join(fieldSeparator) : null;
  const formatFieldFn = config.settings.formatField || defaultSettings.formatField;
  const fieldName = formatFieldName(field, config, meta);
  const formattedField = formatFieldFn(fieldName, fieldParts, fieldFullLabel, fieldDefinition, config);
  return formattedField;
};


const formatFunc = (meta, config, currentValue) => {
  const funcKey = currentValue.get("func");
  const args = currentValue.get("args");
  const funcConfig = getFuncConfig(config, funcKey);
  const funcName = funcConfig.sqlFunc || funcKey;

  let formattedArgs = {};
  for (const argKey in funcConfig.args) {
    const argConfig = funcConfig.args[argKey];
    const fieldDef = getFieldConfig(config, argConfig);
    const argVal = args ? args.get(argKey) : undefined;
    const argValue = argVal ? argVal.get("value") : undefined;
    const argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
    const formattedArgVal = formatValue(meta, config, argValue, argValueSrc, argConfig.type, fieldDef, argConfig, null, null);
    if (argValue != undefined && formattedArgVal === undefined) {
      meta.errors.push(`Can't format value of arg ${argKey} for func ${funcKey}`);
      return undefined;
    }
    if (formattedArgVal !== undefined) { // skip optional in the end
      formattedArgs[argKey] = formattedArgVal;
    }
  }

  let ret;
  if (typeof funcConfig.sqlFormatFunc === "function") {
    const fn = funcConfig.sqlFormatFunc;
    const args = [
      formattedArgs
    ];
    ret = fn(...args);
  } else {
    const argsStr = Object.entries(formattedArgs)
      .map(([k, v]) => v)
      .join(", ");
    ret = `${funcName}(${argsStr})`;
  }
  return ret;
};
