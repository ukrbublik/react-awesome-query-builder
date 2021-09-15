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
  const mode = properties.get("mode");
  const children = item.get("children1");

  const isRuleGroup = (type === "rule_group");
  // TIP: don't cut group for mode == 'struct' and don't do aggr format (maybe later)
  const groupField = isRuleGroup && mode == "array" ? properties.get("field") : null;
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

  const conjStr = conjunctionDefinition.formatConj(list, conjunction, not, isForDisplay);
  
  let ret;
  if (groupField) {
    const aggrArgs = formatRule(item, config, meta, isForDisplay, parentField, true);
    if (conjStr && aggrArgs) {
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

  return ret;
};


const formatItemValue = (config, properties, meta, _operator, isForDisplay, parentField) => {
  const field = properties.get("field");
  const iValueSrc = properties.get("valueSrc");
  const iValueType = properties.get("valueType");
  const fieldDef = getFieldConfig(config, field) || {};
  const operator = _operator || properties.get("operator");
  const operatorDef = getOperatorConfig(config, operator, field) || {};
  const cardinality = defaultValue(operatorDef.cardinality, 1);
  const iValue = properties.get("value");
  const asyncListValues = properties.get("asyncListValues");

  let valueSrcs = [];
  let valueTypes = [];
  let formattedValue;

  if (iValue != undefined) {
    const fvalue = iValue.map((currentValue, ind) => {
      const valueSrc = iValueSrc ? iValueSrc.get(ind) : null;
      const valueType = iValueType ? iValueType.get(ind) : null;
      const cValue = completeValue(currentValue, valueSrc, config);
      const widget = getWidgetForFieldOp(config, field, operator, valueSrc);
      const fieldWidgetDef = omit(getFieldWidgetConfig(config, field, operator, widget, valueSrc), ["factory"]);
      let fv = formatValue(
        config, meta, cValue, valueSrc, valueType, fieldWidgetDef, fieldDef, operator, operatorDef, isForDisplay, parentField, asyncListValues
      );
      if (fv !== undefined) {
        valueSrcs.push(valueSrc);
        valueTypes.push(valueType);
      }
      return fv;
    });
    const hasUndefinedValues = fvalue.filter(v => v === undefined).size > 0;
    if (!( hasUndefinedValues || fvalue.size < cardinality )) {
      formattedValue = (cardinality == 1 ? fvalue.first() : fvalue);
    }
  }

  return [
    formattedValue, 
    (valueSrcs.length > 1 ? valueSrcs : valueSrcs[0]),
    (valueTypes.length > 1 ? valueTypes : valueTypes[0]),
  ];
};


const formatRule = (item, config, meta, isForDisplay = false, parentField = null, returnArgs = false) => {
  const properties = item.get("properties") || new Map();
  const field = properties.get("field");
  let operator = properties.get("operator");
  let operatorOptions = properties.get("operatorOptions");
  if (field == null || operator == null)
    return undefined;
  
  const fieldDef = getFieldConfig(config, field) || {};
  let operatorDef = getOperatorConfig(config, operator, field) || {};
  let reversedOp = operatorDef.reversedOp;
  let revOperatorDef = getOperatorConfig(config, reversedOp, field) || {};
  const cardinality = defaultValue(operatorDef.cardinality, 1);
  
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
  const fop = operatorDef.labelForFormat || operator;

  //find fn to format expr
  if (!fn) {
    if (cardinality == 0) {
      fn = (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
        return `${field} ${fop}`;
      };
    } else if (cardinality == 1) {
      fn = (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
        return `${field} ${fop} ${values}`;
      };
    } else if (cardinality == 2) {
      // between
      fn = (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
        const valFrom = values.first();
        const valTo = values.get(1);
        return `${field} ${fop} ${valFrom} AND ${valTo}`;
      };
    }
  }
  if (!fn)
    return undefined;

  //format field
  const formattedField = formatField(config, meta, field, isForDisplay, parentField);

  //format value
  const [formattedValue, valueSrc, valueType] = formatItemValue(
    config, properties, meta, operator, isForDisplay, parentField
  );
  if (formattedValue === undefined)
    return undefined;

  const args = [
    formattedField,
    operator,
    formattedValue,
    valueSrc,
    valueType,
    omit(operatorDef, ["formatOp", "mongoFormatOp", "sqlFormatOp", "jsonLogic"]),
    operatorOptions,
    isForDisplay,
    fieldDef,
    isRev,
  ];

  if (returnArgs) {
    return args;
  } else {
    //format expr
    let ret = fn(...args);

    //rev
    if (isRev) {
      ret = config.settings.formatReverse(ret, operator, reversedOp, operatorDef, revOperatorDef, isForDisplay);
    }

    return ret;
  }
};


const formatValue = (config, meta, value, valueSrc, valueType, fieldWidgetDef, fieldDef, operator, opDef, isForDisplay, parentField = null, asyncListValues) => {
  if (value === undefined)
    return undefined;
  let ret;
  if (valueSrc == "field") {
    ret = formatField(config, meta, value, isForDisplay, parentField);
  } else if (valueSrc == "func") {
    ret = formatFunc(config, meta, value, isForDisplay, parentField);
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
        omit(fieldWidgetDef, ["formatValue", "mongoFormatValue", "sqlFormatValue", "jsonLogic", "elasticSearchFormatValue"]),
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
      ret = fn(...args);
    } else {
      ret = value;
    }
  }
  return ret;
};


const formatField = (config, meta, field, isForDisplay, parentField = null, cutParentField = true) => {
  const {fieldSeparator, fieldSeparatorDisplay} = config.settings;
  let ret = null;
  if (field) {
    const fieldDefinition = getFieldConfig(config, field) || {};
    const fieldParts = Array.isArray(field) ? field : field.split(fieldSeparator);
    const _fieldKeys = getFieldPath(field, config);
    const fieldPartsLabels = getFieldPathLabels(field, config, cutParentField ? parentField : null);
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
    const argAsyncListValues = argVal ? argVal.get("asyncListValues") : undefined;
    const formattedArgVal = formatValue(
      config, meta, argValue, argValueSrc, argConfig.type, fieldDef, argConfig, null, null, isForDisplay, parentField, argAsyncListValues
    );
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
