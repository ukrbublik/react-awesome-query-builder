import {
  getFieldConfig, getOperatorConfig, getFieldWidgetConfig, getFuncConfig
} from "../utils/configUtils";
import {
  getFieldPath, getWidgetForFieldOp, formatFieldName, getFieldPartsConfigs
} from "../utils/ruleUtils";
import omit from "lodash/omit";
import pick from "lodash/pick";
import {defaultValue, logger} from "../utils/stuff";
import {defaultConjunction} from "../utils/defaultUtils";
import {settings as defaultSettings} from "../config/default";
import {completeValue} from "../utils/funcUtils";
import {Map} from "immutable";
import {spelEscape} from "../utils/export";

export const spelFormat = (tree, config) => {
  return _spelFormat(tree, config, false);
};

export const _spelFormat = (tree, config, returnErrors = true) => {
  //meta is mutable
  let meta = {
    errors: []
  };

  const res = formatItem(tree, config, meta, null);

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
  const children = item.get("children1");
  const field = properties.get("field");
  if (!children) return undefined;

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
    const getSize = isSpelArray ? ".length" : ".size()";
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

const buildFnToFormatOp = (operator, operatorDefinition) => {
  const spelOp = operatorDefinition.spelOp;
  if (!spelOp) return undefined;
  const objectIsFirstArg = spelOp[0] == "$";
  const isMethod = spelOp[0] == "." || objectIsFirstArg;
  const sop = isMethod ? spelOp.slice(1) : spelOp;
  let fn;
  const cardinality = defaultValue(operatorDefinition.cardinality, 1);
  if (cardinality == 0) {
    fn = (field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) => {
      if (isMethod)
        return `${field}.${sop}()`;
      else
        return `${field} ${sop}`;
    };
  } else if (cardinality == 1) {
    fn = (field, op, values, valueSrc, valueType, opDef, operatorOptions, fieldDef) => {
      if (objectIsFirstArg)
        return `${values}.${sop}(${field})`;
      else if (isMethod)
        return `${field}.${sop}(${values})`;
      else
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
  const fn = opDef.spelFormatOp || buildFnToFormatOp(operator, opDef);
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
    omit(opDef, ["formatOp", "mongoFormatOp", "sqlFormatOp", "jsonLogic", "spelFormatOp"]),
    operatorOptions,
    fieldDef,
  ];
  let ret;
  ret = fn(...args);

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
  const formattedField = formatField(meta, config, field, parentField);
  
  // format expression
  let res = formatExpression(
    meta, config, properties, formattedField, formattedValue, realOp, valueSrc, valueType, isRev
  );
  return res;
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
        omit(fieldWidgetDef, ["formatValue", "mongoFormatValue", "sqlFormatValue", "jsonLogic", "elasticSearchFormatValue", "spelFormatValue"]),
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
      ret = spelEscape(currentValue);
    }
  }
  return ret;
};

const formatField = (meta, config, field, parentField = null) => {
  if (!field) return;
  const {fieldSeparator} = config.settings;
  const fieldDefinition = getFieldConfig(config, field) || {};
  const fieldParts = Array.isArray(field) ? field : field.split(fieldSeparator);
  const _fieldKeys = getFieldPath(field, config, parentField);
  const fieldPartsConfigs = getFieldPartsConfigs(field, config, parentField);
  const formatFieldFn = config.settings.formatSpelField;
  let fieldName = formatFieldName(field, config, meta);
  if (parentField) {
    const parentFieldDef = getFieldConfig(config, parentField) || {};
    let parentFieldName = parentField;
    if (parentFieldDef.fieldName) {
      parentFieldName = parentFieldDef.fieldName;
    }
    if (fieldName.indexOf(parentFieldName + fieldSeparator) == 0) {
      fieldName = fieldName.slice((parentFieldName + fieldSeparator).length);
      // fieldName = "#this." + fieldName;
    } else {
      meta.errors.push(`Can't cut group ${parentFieldName} from field ${fieldName}`);
    }
  }
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
      isSpelVariable
    };
  });
  const formattedField = formatFieldFn(fieldName, parentField, fieldParts, fieldPartsMeta, fieldDefinition, config);
  return formattedField;
};


const formatFunc = (meta, config, currentValue, parentField = null) => {
  const funcKey = currentValue.get("func");
  const args = currentValue.get("args");
  const funcConfig = getFuncConfig(config, funcKey);
  const funcName = funcConfig.spelFunc || funcKey;

  let formattedArgs = {};
  for (const argKey in funcConfig.args) {
    const argConfig = funcConfig.args[argKey];
    const fieldDef = getFieldConfig(config, argConfig);
    const argVal = args ? args.get(argKey) : undefined;
    const argValue = argVal ? argVal.get("value") : undefined;
    const argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
    const argAsyncListValues = argVal ? argVal.get("asyncListValues") : undefined;
    const formattedArgVal = formatValue(
      meta, config, argValue, argValueSrc, argConfig.type, fieldDef, argConfig, null, null, parentField, argAsyncListValues
    );
    if (argValue != undefined && formattedArgVal === undefined) {
      meta.errors.push(`Can't format value of arg ${argKey} for func ${funcKey}`);
      return undefined;
    }
    if (formattedArgVal !== undefined) { // skip optional in the end
      formattedArgs[argKey] = formattedArgVal;
    }
  }

  let ret;
  if (typeof funcConfig.spelFormatFunc === "function") {
    const fn = funcConfig.spelFormatFunc;
    const args = [
      formattedArgs
    ];
    ret = fn(...args);
  } else {
    const args = Object.entries(formattedArgs).map(([k, v]) => v);
    if (funcName[0] == "." && args.length) {
      const [obj, ...params] = args;
      ret = `${obj}${funcName}(${params.join(", ")})`;
    } else {
      ret = `${funcName}(${args.join(", ")})`;
    }
  }
  return ret;
};
