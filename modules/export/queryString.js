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


export const queryString = (item, config, isForDisplay = false) => {
  //meta is mutable
  let meta = {
    errors: []
  };

  const res = formatItem(item, config, meta, isForDisplay, null);

  if (meta.errors.length)
    console.warn("Errors while exporting to string:", meta.errors);
  return res;
};


const formatItem = (item, config, meta, isForDisplay = false, parentField = null) => {
  if (!item) return undefined;
  const type = item.get("type");
  const children = item.get("children1");

  if ((type === "group" || type === "rule_group") && children && children.size) {
    return formatGroup(item, config, meta, isForDisplay, parentField);
  } else if (type === "rule") {
    return formatRule(item, config, meta, isForDisplay, parentField);
  }

  return undefined;
};


const formatGroup = (item, config, meta, isForDisplay = false, parentField = null) => {
  const type = item.get("type");
  const properties = item.get("properties") || new Map();
  const children = item.get("children1");

  const groupField = type === "rule_group" ? properties.get("field") : null;
  const groupFieldDef = getFieldConfig(config, groupField) || {};
  const not = properties.get("not");
  const list = children
    .map((currentChild) => formatItem(currentChild, config, meta, isForDisplay, groupField))
    .filter((currentChild) => typeof currentChild !== "undefined");
  if (!list.size)
    return undefined;

  let conjunction = properties.get("conjunction");
  if (!conjunction)
    conjunction = defaultConjunction(config);
  const conjunctionDefinition = config.conjunctions[conjunction];

  return conjunctionDefinition.formatConj(list, conjunction, not, isForDisplay);
};


const formatRule = (item, config, meta, isForDisplay = false, parentField = null) => {
  const properties = item.get("properties") || new Map();
  let field = properties.get("field");
  const operator = properties.get("operator");
  const operatorOptions = properties.get("operatorOptions");
  const iValueSrc = properties.get("valueSrc");
  const iValueType = properties.get("valueType");
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
  let value = properties.get("value").map((currentValue, ind) => {
    const valueSrc = iValueSrc ? iValueSrc.get(ind) : null;
    const valueType = iValueType ? iValueType.get(ind) : null;
    currentValue = completeValue(currentValue, valueSrc, config);
    const widget = getWidgetForFieldOp(config, field, operator, valueSrc);
    const fieldWidgetDefinition = omit(getFieldWidgetConfig(config, field, operator, widget, valueSrc), ["factory"]);
    let fv = formatValue(config, meta, currentValue, valueSrc, valueType, fieldWidgetDefinition, fieldDefinition, operator, operatorDefinition, isForDisplay, parentField);
    if (fv !== undefined) {
      valueSrcs.push(valueSrc);
      valueTypes.push(valueType);
    }
    return fv;
  });
  const hasUndefinedValues = value.filter(v => v === undefined).size > 0;
  if (hasUndefinedValues || value.size < cardinality)
    return undefined;
  const formattedValue = (cardinality == 1 ? value.first() : value);

  //find fn to format expr
  let isRev = false;
  let fn = operatorDefinition.formatOp;
  if (!fn && reversedOp) {
    fn = revOperatorDefinition.formatOp;
    if (fn) {
      isRev = true;
    }
  }
  if (!fn && cardinality == 1) {
    let foperator = operatorDefinition.labelForFormat || operator;
    fn = (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
      return `${field} ${foperator} ${values}`;
    };
  }
  if (!fn)
    return undefined;

  //format field
  const formattedField = formatField(config, meta, field, isForDisplay, parentField);

  //format expr
  const args = [
    formattedField,
    operator,
    formattedValue,
    (valueSrcs.length > 1 ? valueSrcs : valueSrcs[0]),
    (valueTypes.length > 1 ? valueTypes : valueTypes[0]),
    omit(operatorDefinition, ["formatOp", "mongoFormatOp", "sqlFormatOp", "jsonLogic"]),
    operatorOptions,
    isForDisplay,
    fieldDefinition,
  ];
  let ret = fn(...args);
  if (isRev) {
    ret = config.settings.formatReverse(ret, operator, reversedOp, operatorDefinition, revOperatorDefinition, isForDisplay);
  }
  return ret;
};


const formatValue = (config, meta, currentValue, valueSrc, valueType, fieldWidgetDefinition, fieldDefinition, operator, operatorDefinition, isForDisplay, parentField = null) => {
  if (currentValue === undefined)
    return undefined;
  let ret;
  if (valueSrc == "field") {
    ret = formatField(config, meta, currentValue, isForDisplay, parentField);
  } else if (valueSrc == "func") {
    ret = formatFunc(config, meta, currentValue, isForDisplay, parentField);
  } else {
    if (typeof fieldWidgetDefinition.formatValue === "function") {
      const fn = fieldWidgetDefinition.formatValue;
      const args = [
        currentValue,
        pick(fieldDefinition, ["fieldSettings", "listValues"]),
        //useful options: valueFormat for date/time
        omit(fieldWidgetDefinition, ["formatValue", "mongoFormatValue", "sqlFormatValue", "jsonLogic"]),
        isForDisplay
      ];
      if (operator) {
        args.push(operator);
        args.push(operatorDefinition);
      }
      if (valueSrc == "field") {
        const valFieldDefinition = getFieldConfig(config, currentValue) || {}; 
        args.push(valFieldDefinition);
      }
      ret = fn(...args);
    } else {
      ret = currentValue;
    }
  }
  return ret;
};


const formatField = (config, meta, field, isForDisplay, parentField = null, cutParentField = false) => {
  const {fieldSeparator, fieldSeparatorDisplay} = config.settings;
  let ret = null;
  if (field) {
    const fieldDefinition = getFieldConfig(config, field) || {};
    const fieldParts = Array.isArray(field) ? field : field.split(fieldSeparator);
    const _fieldKeys = getFieldPath(field, config);
    const fieldPartsLabels = getFieldPathLabels(field, config);
    const fieldFullLabel = fieldPartsLabels ? fieldPartsLabels.join(fieldSeparatorDisplay) : null;
    const fieldLabel2 = fieldDefinition.label2 || fieldFullLabel;
    const formatFieldFn = config.settings.formatField || defaultSettings.formatField;
    const fieldName = formatFieldName(field, config, meta, cutParentField ? parentField : null);
    ret = formatFieldFn(fieldName, fieldParts, fieldLabel2, fieldDefinition, config, isForDisplay);
  }
  return ret;
};


const formatFunc = (config, meta, funcValue, isForDisplay, parentField = null) => {
  const funcKey = funcValue.get("func");
  const args = funcValue.get("args");
  const funcConfig = getFuncConfig(config, funcKey);
  const funcName = isForDisplay && funcConfig.label || funcKey;

  let formattedArgs = {};
  let formattedArgsWithNames = {};
  for (const argKey in funcConfig.args) {
    const argConfig = funcConfig.args[argKey];
    const fieldDef = getFieldConfig(config, argConfig);
    const argVal = args ? args.get(argKey) : undefined;
    const argValue = argVal ? argVal.get("value") : undefined;
    const argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
    const formattedArgVal = formatValue(config, meta, argValue, argValueSrc, argConfig.type, fieldDef, argConfig, null, null, isForDisplay, parentField);
    const argName = isForDisplay && argConfig.label || argKey;
    if (formattedArgVal !== undefined) { // skip optional in the end
      formattedArgs[argKey] = formattedArgVal;
      formattedArgsWithNames[argName] = formattedArgVal;
    }
  }

  let ret = null;
  if (typeof funcConfig.formatFunc === "function") {
    const fn = funcConfig.formatFunc;
    const args = [
      formattedArgs,
      isForDisplay
    ];
    ret = fn(...args);
  } else {
    const argsStr = Object.entries(formattedArgsWithNames)
      .map(([k, v]) => (isForDisplay ? `${k}: ${v}` : `${v}`))
      .join(", ");
    ret = `${funcName}(${argsStr})`;
  }
  return ret;
};
