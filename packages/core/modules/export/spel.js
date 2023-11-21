import {
  getFieldConfig, getOperatorConfig, getFieldWidgetConfig, getFuncConfig, extendConfig, getFieldParts
} from "../utils/configUtils";
import {
  getWidgetForFieldOp, formatFieldName, getFieldPartsConfigs, completeValue
} from "../utils/ruleUtils";
import omit from "lodash/omit";
import pick from "lodash/pick";
import {defaultValue, logger, widgetDefKeysToOmit, opDefKeysToOmit} from "../utils/stuff";
import {defaultConjunction} from "../utils/defaultUtils";
import {List, Map} from "immutable";
import {spelEscape} from "../utils/export";

// https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/expressions.html#expressions

export const compareToSign = "${0}.compareTo(${1})";
const TypesWithCompareTo = {
  datetime: true,
  time: true,
  date: true,
};

export const spelFormat = (tree, config) => {
  return _spelFormat(tree, config, false);
};

export const _spelFormat = (tree, config, returnErrors = true) => {
  //meta is mutable
  let meta = {
    errors: []
  };

  const extendedConfig = extendConfig(config, undefined, false);
  const res = formatItem(tree, extendedConfig, meta, null);

  if (returnErrors) {
    return [res, meta.errors];
  } else {
    if (meta.errors.length)
      console.warn("Errors while exporting to SpEL:", meta.errors);
    return res;
  }
};


const formatItem = (item, config, meta, parentField = null) => {
  if (!item) return undefined;
  const type = item.get("type");

  if ((type === "group" || type === "rule_group")) {
    return formatGroup(item, config, meta, parentField);
  } else if (type === "rule") {
    return formatRule(item, config, meta, parentField);
  } else if (type == "switch_group") {
    return formatSwitch(item, config, meta, parentField);
  } else if (type == "case_group") {
    return formatCase(item, config, meta, parentField);
  }

  return undefined;
};

const formatCase = (item, config, meta, parentField = null) => {
  const type = item.get("type");
  if (type != "case_group") {
    meta.errors.push(`Unexpected child of type ${type} inside switch`);
    return undefined;
  }
  const properties = item.get("properties") || new Map();
  
  const [formattedValue, valueSrc, valueType] = formatItemValue(
    config, properties, meta, null, parentField, "!case_value"
  );

  const cond = formatGroup(item, config, meta, parentField);
  return [cond, formattedValue];
};

const formatSwitch = (item, config, meta, parentField = null) => {
  const properties = item.get("properties") || new Map();
  const children = item.get("children1");
  if (!children) return undefined;
  const cases = children
    .map((currentChild) => formatCase(currentChild, config, meta, null))
    .filter((currentChild) => typeof currentChild !== "undefined")
    .valueSeq()
    .toArray();
  
  if (!cases.length) return undefined;

  if (cases.length == 1 && !cases[0][0]) {
    // only 1 case without condition
    return cases[0][1];
  }

  let filteredCases = [];
  for (let i = 0 ; i < cases.length ; i++) {
    if (i != (cases.length - 1) && !cases[i][0]) {
      meta.errors.push(`No condition for case ${i}`);
    } else {
      filteredCases.push(cases[i]);
      if (i == (cases.length - 1) && cases[i][0]) {
        // no default - add null as default
        filteredCases.push([undefined, null]);
      }
    }
  }

  let left = "", right = "";
  for (let i = 0 ; i < filteredCases.length ; i++) {
    let [cond, value] = filteredCases[i];
    if (value == undefined)
      value = "null";
    if (cond == undefined)
      cond = "true";
    if (i != (filteredCases.length - 1)) {
      left += `(${cond} ? ${value} : `;
      right += ")";
    } else {
      left += `${value}`;
    }
  }
  return left + right;
};

const formatGroup = (item, config, meta, parentField = null) => {
  const type = item.get("type");
  const properties = item.get("properties") || new Map();
  const mode = properties.get("mode");
  const children = item.get("children1") || new List();
  const field = properties.get("field");

  let conjunction = properties.get("conjunction");
  if (!conjunction)
    conjunction = defaultConjunction(config);
  const conjunctionDefinition = config.conjunctions[conjunction];
  const not = properties.get("not");

  const isRuleGroup = type === "rule_group";
  const isRuleGroupArray = isRuleGroup && mode != "struct";
  const groupField = isRuleGroupArray ? field : parentField;
  const groupFieldDef = getFieldConfig(config, groupField) || {};
  const isSpelArray = groupFieldDef.isSpelArray;
  const {fieldSeparator} = config.settings;
  
  // check op for reverse
  let groupOperator = properties.get("operator");
  if (!groupOperator && (!mode || mode == "some")) {
    groupOperator = "some";
  }
  const realGroupOperator = checkOp(config, groupOperator, field);
  const isGroupOpRev = realGroupOperator != groupOperator;
  const realGroupOperatorDefinition = groupOperator && getOperatorConfig(config, realGroupOperator, field) || null;
  const isGroup0 = isRuleGroup && (!realGroupOperator || realGroupOperatorDefinition.cardinality == 0);
  
  // build value for aggregation op
  const [formattedValue, valueSrc, valueType] = formatItemValue(
    config, properties, meta, realGroupOperator, parentField, null
  );
  
  // build filter in aggregation
  const list = children
    .map((currentChild) => formatItem(currentChild, config, meta, groupField))
    .filter((currentChild) => typeof currentChild !== "undefined");

  if (isRuleGroupArray && !isGroup0) {
    // "count" rule can have no "having" children, but should have number value
    if (formattedValue == undefined)
      return undefined;
  } else {
    if (!list.size)
      return undefined;
  }

  const omitBrackets = isRuleGroup;
  const filter = list.size ? conjunctionDefinition.spelFormatConj(list, conjunction, not, omitBrackets) : null;

  // build result
  let ret;
  if (isRuleGroupArray) {
    const formattedField = formatField(meta, config, field, parentField);
    const sep = fieldSeparator || ".";
    const getSize = sep + (isSpelArray ? "length" : "size()");
    const fullSize = `${formattedField}${getSize}`;
    // https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/expressions.html#expressions-collection-selection
    const filteredSize = filter ? `${formattedField}.?[${filter}]${getSize}` : fullSize;
    const groupValue = isGroup0 ? fullSize : formattedValue;
    // format expression
    ret = formatExpression(
      meta, config, properties, filteredSize, groupValue, realGroupOperator, valueSrc, valueType, isGroupOpRev
    );
  } else {
    ret = filter;
  }
  
  return ret;
};

const buildFnToFormatOp = (operator, operatorDefinition, valueType) => {
  const spelOp = operatorDefinition.spelOp;
  if (!spelOp) return undefined;
  const isSign = spelOp.includes("${0}");
  const isCompareTo = TypesWithCompareTo[valueType];
  let sop = spelOp;
  let fn;
  const cardinality = defaultValue(operatorDefinition.cardinality, 1);
  if (isCompareTo) {
    // date1.compareTo(date2) >= 0
    //   instead of
    // date1 >= date2
    fn = (field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) => {
      const compareRes = compareToSign.replace(/\${(\w+)}/g, (_, k) => (k == 0 ? field : (cardinality > 1 ? values[k-1] : values)));
      return `${compareRes} ${sop} 0`;
    };
  } else if (isSign) {
    fn = (field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) => {
      return spelOp.replace(/\${(\w+)}/g, (_, k) => (k == 0 ? field : (cardinality > 1 ? values[k-1] : values)));
    };
  } else if (cardinality == 0) {
    // should not be
    fn = (field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) => {
      return `${field} ${sop}`;
    };
  } else if (cardinality == 1) {
    fn = (field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) => {
      return `${field} ${sop} ${values}`;
    };
  }
  return fn;
};

const formatExpression = (meta, config, properties, formattedField, formattedValue, operator, valueSrc, valueType, isRev = false) => {
  const field = properties.get("field");
  const opDef = getOperatorConfig(config, operator, field) || {};
  const fieldDef = getFieldConfig(config, field) || {};
  const operatorOptions = properties.get("operatorOptions");

  //find fn to format expr
  const fn = opDef.spelFormatOp || buildFnToFormatOp(operator, opDef, valueType);
  if (!fn) {
    meta.errors.push(`Operator ${operator} is not supported`);
    return undefined;
  }

  //format expr
  const args = [
    formattedField,
    operator,
    formattedValue,
    valueSrc,
    valueType,
    omit(opDef, opDefKeysToOmit),
    operatorOptions,
    fieldDef,
  ];
  let ret;
  ret = fn.call(config.ctx, ...args);

  //rev
  if (isRev) {
    ret = config.settings.spelFormatReverse(ret);
  }

  if (ret === undefined) {
    meta.errors.push(`Operator ${operator} is not supported for value source ${valueSrc}`);
  }

  return ret;
};

const checkOp = (config, operator, field) => {
  if (!operator) return undefined;
  let opDef = getOperatorConfig(config, operator, field) || {};
  let reversedOp = opDef.reversedOp;
  let revOpDef = getOperatorConfig(config, reversedOp, field) || {};

  let isRev = false;
  const canFormatOp = opDef.spelOp || opDef.spelFormatOp;
  const canFormatRevOp = revOpDef.spelOp || revOpDef.spelFormatOp;
  if (!canFormatOp && !canFormatRevOp) {
    return undefined;
  }
  if (!canFormatOp && canFormatRevOp) {
    isRev = true;
    [operator, reversedOp] = [reversedOp, operator];
    [opDef, revOpDef] = [revOpDef, opDef];
  }
  return operator;
};

const formatRule = (item, config, meta, parentField = null) => {
  const properties = item.get("properties") || new Map();
  const field = properties.get("field");
  const fieldSrc = properties.get("fieldSrc");
  let operator = properties.get("operator");
  if (field == null || operator == null)
    return undefined;

  // check op for reverse
  const realOp = checkOp(config, operator, field);
  if (!realOp) {
    meta.errors.push(`Operator ${operator} is not supported`);
    return undefined;
  }
  const isRev = realOp != operator;

  //format value
  const [formattedValue, valueSrc, valueType] = formatItemValue(
    config, properties, meta, realOp, parentField, null
  );
  if (formattedValue === undefined)
    return undefined;
      
  //format field
  const formattedField = formatLhs(meta, config, field, fieldSrc, parentField);
  if (formattedField === undefined)
    return undefined;
  
  // format expression
  let res = formatExpression(
    meta, config, properties, formattedField, formattedValue, realOp, valueSrc, valueType, isRev
  );
  return res;
};

const formatLhs = (meta, config, field, fieldSrc, parentField = null) => {
  if (fieldSrc === "func")
    return formatFunc(meta, config, field, parentField);
  else
    return formatField(meta, config, field, parentField);
};

const formatItemValue = (config, properties, meta, operator, parentField, expectedValueType = null) => {
  let field = properties.get("field");
  const iValueSrc = properties.get("valueSrc");
  const iValueType = properties.get("valueType");
  if (expectedValueType == "!case_value" || iValueType && iValueType.get(0) == "case_value") {
    field = "!case_value";
  }
  const fieldDef = getFieldConfig(config, field) || {};
  const operatorDefinition = getOperatorConfig(config, operator, field) || {};
  const cardinality = defaultValue(operatorDefinition.cardinality, 1);
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
      const fv = formatValue(
        meta, config, cValue, valueSrc, valueType, fieldWidgetDef, fieldDef, operator, operatorDefinition, parentField, asyncListValues
      );
      if (fv !== undefined) {
        valueSrcs.push(valueSrc);
        valueTypes.push(valueType);
      }
      return fv;
    });
    const hasUndefinedValues = fvalue.filter(v => v === undefined).size > 0;
    if (!( fvalue.size < cardinality || hasUndefinedValues )) {
      formattedValue = cardinality > 1 ? fvalue.toArray() : (cardinality == 1 ? fvalue.first() : null);
    }
  }
  
  return [
    formattedValue, 
    (valueSrcs.length > 1 ? valueSrcs : valueSrcs[0]),
    (valueTypes.length > 1 ? valueTypes : valueTypes[0]),
  ];
};

const formatValue = (meta, config, currentValue, valueSrc, valueType, fieldWidgetDef, fieldDef, operator, operatorDef, parentField = null, asyncListValues) => {
  if (currentValue === undefined)
    return undefined;
  let ret;
  if (valueSrc == "field") {
    ret = formatField(meta, config, currentValue, parentField);
  } else if (valueSrc == "func") {
    ret = formatFunc(meta, config, currentValue, parentField);
  } else {
    if (typeof fieldWidgetDef.spelFormatValue === "function") {
      const fn = fieldWidgetDef.spelFormatValue;
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
      ret = spelEscape(currentValue);
    }
  }
  return ret;
};

const formatField = (meta, config, field, parentField = null) => {
  if (!field) return;
  const {fieldSeparator} = config.settings;
  const fieldDefinition = getFieldConfig(config, field) || {};
  const fieldParts = getFieldParts(field, config);
  const fieldPartsConfigs = getFieldPartsConfigs(field, config, parentField);
  const formatFieldFn = config.settings.formatSpelField;
  const fieldName = formatFieldName(field, config, meta, parentField);
  const fieldPartsMeta = fieldPartsConfigs.map(([key, cnf, parentCnf]) => {
    let parent;
    if (parentCnf) {
      if (parentCnf.type == "!struct" || parentCnf.type == "!group" && parentCnf.mode == "struct")
        parent = cnf.isSpelMap ? "map" : "class";
      else if (parentCnf.type == "!group")
        parent = cnf.isSpelItemMap ? "[map]" : "[class]";
      else
        parent = "class";
    }
    const isSpelVariable = cnf?.isSpelVariable;
    return {
      key,
      parent,
      isSpelVariable,
      fieldSeparator
    };
  });
  const formattedField = formatFieldFn.call(config.ctx, fieldName, parentField, fieldParts, fieldPartsMeta, fieldDefinition, config);
  return formattedField;
};


const formatFunc = (meta, config, currentValue, parentField = null) => {
  const funcKey = currentValue.get("func");
  const args = currentValue.get("args");
  const funcConfig = getFuncConfig(config, funcKey);
  if (!funcConfig) {
    meta.errors.push(`Func ${funcKey} is not defined in config`);
    return undefined;
  }

  let formattedArgs = {};
  let gaps = [];
  let missingArgKeys = [];
  for (const argKey in funcConfig.args) {
    const argConfig = funcConfig.args[argKey];
    const fieldDef = getFieldConfig(config, argConfig);
    const {defaultValue, isOptional} = argConfig;
    const defaultValueSrc = defaultValue?.func ? "func" : "value";
    const argVal = args ? args.get(argKey) : undefined;
    let argValue = argVal ? argVal.get("value") : undefined;
    const argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
    if (argValueSrc !== "func" && argValue?.toJS) {
      // value should not be Immutable
      argValue = argValue.toJS();
    }
    const argAsyncListValues = argVal ? argVal.get("asyncListValues") : undefined;
    const doEscape = argConfig.spelEscapeForFormat ?? true;
    const operator = null;
    const widget = getWidgetForFieldOp(config, argConfig, operator, argValueSrc);
    const fieldWidgetDef = omit(getFieldWidgetConfig(config, argConfig, operator, widget, argValueSrc), ["factory"]);

    const formattedArgVal = formatValue(
      meta, config, argValue, argValueSrc, argConfig.type, fieldWidgetDef, fieldDef, null, null, parentField, argAsyncListValues
    );
    if (argValue != undefined && formattedArgVal === undefined) {
      if (argValueSrc != "func") // don't triger error if args value is another incomplete function
        meta.errors.push(`Can't format value of arg ${argKey} for func ${funcKey}`);
      return undefined;
    }
    let formattedDefaultVal;
    if (formattedArgVal === undefined && !isOptional && defaultValue != undefined) {
      const defaultWidget = getWidgetForFieldOp(config, argConfig, operator, defaultValueSrc);
      const defaultFieldWidgetDef = omit( getFieldWidgetConfig(config, argConfig, operator, defaultWidget, defaultValueSrc), ["factory"] );
      formattedDefaultVal = formatValue(
        meta, config, defaultValue, defaultValueSrc, argConfig.type, defaultFieldWidgetDef, fieldDef, null, null, parentField, argAsyncListValues
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
        for (const missedArgKey of gaps) {
          formattedArgs[missedArgKey] = undefined;
        }
        gaps = [];
      }
      formattedArgs[argKey] = doEscape ? finalFormattedVal : (argValue ?? defaultValue);
    } else {
      if (!isOptional)
        missingArgKeys.push(argKey);
      gaps.push(argKey);
    }
  }
  if (missingArgKeys.length) {
    //meta.errors.push(`Missing vals for args ${missingArgKeys.join(", ")} for func ${funcKey}`);
    return undefined; // incomplete
  }
  
  let ret;
  if (typeof funcConfig.spelFormatFunc === "function") {
    const fn = funcConfig.spelFormatFunc;
    const args = [
      formattedArgs
    ];
    ret = fn.call(config.ctx, ...args);
  } else if (funcConfig.spelFunc) {
    // fill arg values
    ret = funcConfig.spelFunc
      .replace(/\${(\w+)}/g, (found, argKey) => {
        return formattedArgs[argKey] ?? found;
      });
    // remove optional args (from end only)
    const optionalArgs = Object.keys(funcConfig.args || {})
      .reverse()
      .filter(argKey => !!funcConfig.args[argKey].isOptional);
    for (const argKey of optionalArgs) {
      if (formattedArgs[argKey] != undefined)
        break;
      ret = ret.replace(new RegExp("(, )?" + "\\${" + argKey + "}", "g"), "");
    }
    // missing required arg vals
    ret = ret.replace(/\${(\w+)}/g, "null");
  } else {
    meta.errors.push(`Func ${funcKey} is not supported`);
  }
  return ret;
};
