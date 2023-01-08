import {defaultValue} from "../utils/stuff";
import {
  getFieldConfig, getOperatorConfig, getFieldWidgetConfig, getFuncConfig
} from "../utils/configUtils";
import {getWidgetForFieldOp} from "../utils/ruleUtils";
import {defaultConjunction} from "../utils/defaultUtils";
import {completeValue} from "../utils/funcUtils";
import {List, Map} from "immutable";
import omit from "lodash/omit";
import pick from "lodash/pick";

// http://jsonlogic.com/


export const jsonLogicFormat = (item, config) => {
  //meta is mutable
  let meta = {
    usedFields: [],
    errors: []
  };
  
  const logic = formatItem(item, config, meta, true);
  
  // build empty data
  const {errors, usedFields} = meta;
  const {fieldSeparator} = config.settings;
  let data = {};
  for (let ff of usedFields) {
    const def = getFieldConfig(config, ff) || {};
    const parts = ff.split(fieldSeparator);
    let tmp = data;
    for (let i = 0 ; i < parts.length ; i++) {
      const p = parts[i];
      const pdef = getFieldConfig(config, parts.slice(0, i+1)) || {};
      if (i != parts.length - 1) {
        if (pdef.type == "!group" && pdef.mode != "struct") {
          if (!tmp[p])
            tmp[p] = [{}];
          tmp = tmp[p][0];
        } else {
          if (!tmp[p])
            tmp[p] = {};
          tmp = tmp[p];
        }
      } else {
        if (!tmp[p])
          tmp[p] = null; // can use def.type for sample values
      }
    }
  }
    
  return {
    errors,
    logic,
    data,
  };
};


const formatItem = (item, config, meta, isRoot, parentField = null) => {
  if (!item) return undefined;
  const type = item.get("type");
  const properties = item.get("properties") || new Map();
  const isLocked = properties.get("isLocked");
  const {lockedOp} = config.settings.jsonLogic;
  let ret;
  if (type === "group" || type === "rule_group") {
    ret = formatGroup(item, config, meta, isRoot, parentField);
  } else if (type === "rule") {
    ret = formatRule(item, config, meta, parentField);
  }
  if (isLocked && ret && lockedOp) {
    ret = { [lockedOp] : ret };
  }
  return ret;
};


const formatGroup = (item, config, meta, isRoot, parentField = null) => {
  const type = item.get("type");
  const properties = item.get("properties") || new Map();
  const mode = properties.get("mode");
  const children = item.get("children1") || new List();
  const field = properties.get("field");
  
  let conjunction = properties.get("conjunction");
  if (!conjunction)
    conjunction = defaultConjunction(config);
  const conjunctionDefinition = config.conjunctions[conjunction];
  const conj = conjunctionDefinition.jsonLogicConj || conjunction.toLowerCase();
  const not = properties.get("not");
  if (conj != "and" && conj != "or") {
    meta.errors.push(`Conjunction ${conj} is not supported`);
    return undefined;
  }

  const isRuleGroup = (type === "rule_group" && !isRoot);
  const groupField = isRuleGroup && mode != "struct" ? field : parentField;
  const groupOperator = properties.get("operator");
  const groupOperatorDefinition = groupOperator && getOperatorConfig(config, groupOperator, field) || null;
  const formattedValue = formatItemValue(config, properties, meta, groupOperator, parentField);
  const isGroup0 = isRuleGroup && (!groupOperator || groupOperatorDefinition.cardinality == 0);

  const list = children
    .map((currentChild) => formatItem(currentChild, config, meta, false, groupField))
    .filter((currentChild) => typeof currentChild !== "undefined");
  
  if (isRuleGroup && mode != "struct" && !isGroup0) {
    // "count" rule can have no "having" children, but should have number value
    if (formattedValue == undefined)
      return undefined;
  } else {
    if (!list.size)
      return undefined;
  }

  let resultQuery = {};
  if (list.size == 1 && !isRoot)
    resultQuery = list.first();
  else
    resultQuery[conj] = list.toList().toJS();
  
  // revert
  if (not) {
    resultQuery = { "!": resultQuery };
  }

  // rule_group (issue #246)
  if (isRuleGroup && mode != "struct") {
    const formattedField = formatField(meta, config, field, parentField);
    if (isGroup0) {
      // config.settings.groupOperators
      const op = groupOperator || "some";
      resultQuery = {
        [op]: [
          formattedField,
          resultQuery
        ]
      };
    } else {
      // there is rule for count
      const filter = !list.size 
        ? formattedField
        : {
          "filter": [
            formattedField,
            resultQuery
          ]
        };
      const count = {
        "reduce": [
          filter,
          { "+": [1, { var: "accumulator" }] },
          0
        ]
      };
      resultQuery = formatLogic(config, properties, count, formattedValue, groupOperator);
    }
  }
  
  return resultQuery;
};


const formatRule = (item, config, meta, parentField = null) => {
  const properties = item.get("properties") || new Map();
  const field = properties.get("field");

  let operator = properties.get("operator");
  let operatorOptions = properties.get("operatorOptions");
  operatorOptions = operatorOptions ? operatorOptions.toJS() : null;
  if (operatorOptions && !Object.keys(operatorOptions).length)
    operatorOptions = null;

  if (field == null || operator == null)
    return undefined;

  const fieldDefinition = getFieldConfig(config, field) || {};
  let operatorDefinition = getOperatorConfig(config, operator, field) || {};
  let reversedOp = operatorDefinition.reversedOp;
  let revOperatorDefinition = getOperatorConfig(config, reversedOp, field) || {};

  // check op
  let isRev = false;
  if (!operatorDefinition.jsonLogic && !revOperatorDefinition.jsonLogic) {
    meta.errors.push(`Operator ${operator} is not supported`);
    return undefined;
  }
  if (!operatorDefinition.jsonLogic && revOperatorDefinition.jsonLogic) {
    isRev = true;
    [operator, reversedOp] = [reversedOp, operator];
    [operatorDefinition, revOperatorDefinition] = [revOperatorDefinition, operatorDefinition];
  }

  const formattedValue = formatItemValue(config, properties, meta, operator, parentField);
  if (formattedValue === undefined)
    return undefined;

  const formattedField = formatField(meta, config, field, parentField);

  return formatLogic(config, properties, formattedField, formattedValue, operator, operatorOptions, fieldDefinition, isRev);
};


const formatItemValue = (config, properties, meta, operator, parentField) => {
  const field = properties.get("field");
  const iValueSrc = properties.get("valueSrc");
  const iValueType = properties.get("valueType");
  const fieldDefinition = getFieldConfig(config, field) || {};
  const operatorDefinition = getOperatorConfig(config, operator, field) || {};
  const cardinality = defaultValue(operatorDefinition.cardinality, 1);
  const iValue = properties.get("value");
  const asyncListValues = properties.get("asyncListValues");
  if (iValue == undefined)
    return undefined;
  
  let valueSrcs = [];
  let valueTypes = [];
  let oldUsedFields = meta.usedFields;
  const fvalue = iValue.map((currentValue, ind) => {
    const valueSrc = iValueSrc ? iValueSrc.get(ind) : null;
    const valueType = iValueType ? iValueType.get(ind) : null;
    const cValue = completeValue(currentValue, valueSrc, config);
    const widget = getWidgetForFieldOp(config, field, operator, valueSrc);
    const fieldWidgetDef = omit(getFieldWidgetConfig(config, field, operator, widget, valueSrc), ["factory"]);
    const fv = formatValue(
      meta, config, cValue, valueSrc, valueType, fieldWidgetDef, fieldDefinition, operator, operatorDefinition, parentField, asyncListValues
    );
    if (fv !== undefined) {
      valueSrcs.push(valueSrc);
      valueTypes.push(valueType);
    }
    return fv;
  });
  const hasUndefinedValues = fvalue.filter(v => v === undefined).size > 0;
  if (fvalue.size < cardinality || hasUndefinedValues) {
    meta.usedFields = oldUsedFields; // restore
    return undefined;
  }
  return cardinality > 1 ? fvalue.toArray() : (cardinality == 1 ? fvalue.first() : null);
};


const formatValue = (meta, config, currentValue, valueSrc, valueType, fieldWidgetDef, fieldDef, operator, operatorDef, parentField = null, asyncListValues) => {
  if (currentValue === undefined)
    return undefined;
  let ret;
  if (valueSrc == "field") {
    ret = formatField(meta, config, currentValue, parentField);
  } else if (valueSrc == "func") {
    ret = formatFunc(meta, config, currentValue, parentField);
  } else if (typeof fieldWidgetDef.jsonLogic === "function") {
    const fn = fieldWidgetDef.jsonLogic;
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
    ret = fn(...args);
  } else {
    ret = currentValue;
  }
  return ret;
};


const formatFunc = (meta, config, currentValue, parentField = null) => {
  const funcKey = currentValue.get("func");
  const args = currentValue.get("args");
  const funcConfig = getFuncConfig(config, funcKey);
  if (!funcConfig.jsonLogic) {
    meta.errors.push(`Func ${funcKey} is not supported`);
    return undefined;
  }

  let formattedArgs = {};
  for (const argKey in funcConfig.args) {
    const argConfig = funcConfig.args[argKey];
    const fieldDef = getFieldConfig(config, argConfig);
    const argVal = args ? args.get(argKey) : undefined;
    const argValue = argVal ? argVal.get("value") : undefined;
    const argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
    const formattedArgVal = formatValue(
      meta, config, argValue, argValueSrc, argConfig.type, fieldDef, argConfig, null, null, parentField
    );
    if (argValue != undefined && formattedArgVal === undefined) {
      meta.errors.push(`Can't format value of arg ${argKey} for func ${funcKey}`);
      return undefined;
    }
    if (formattedArgVal !== undefined) { // skip optional in the end
      formattedArgs[argKey] = formattedArgVal;
    }
  }
  const formattedArgsArr = Object.values(formattedArgs);

  let ret;
  if (typeof funcConfig.jsonLogic === "function") {
    const fn = funcConfig.jsonLogic;
    const args = [
      formattedArgs,
    ];
    ret = fn(...args);
  } else {
    const funcName = funcConfig.jsonLogic || funcKey;
    const isMethod = !!funcConfig.jsonLogicIsMethod;
    if (isMethod) {
      const [obj, ...params] = formattedArgsArr;
      if (params.length) {
        ret = { "method": [ obj, funcName, params ] };
      } else {
        ret = { "method": [ obj, funcName ] };
      }
    } else {
      ret = { [funcName]: formattedArgsArr };
    }
  }
  return ret;
};


const formatField = (meta, config, field, parentField = null) => {
  const {fieldSeparator, jsonLogic} = config.settings;

  let ret;
  if (field) {
    if (Array.isArray(field))
      field = field.join(fieldSeparator);
    const fieldDef = getFieldConfig(config, field) || {};
    let fieldName = field;
    if (fieldDef.fieldName) {
      fieldName = fieldDef.fieldName;
    }
    if (parentField) {
      const parentFieldDef = getFieldConfig(config, parentField) || {};
      let parentFieldName = parentField;
      if (parentFieldDef.fieldName) {
        parentFieldName = parentFieldDef.fieldName;
      }
      if (fieldName.indexOf(parentFieldName + fieldSeparator) == 0) {
        fieldName = fieldName.slice((parentFieldName + fieldSeparator).length);
      } else {
        meta.errors.push(`Can't cut group ${parentFieldName} from field ${fieldName}`);
      }
    }
    let varName = fieldDef.jsonLogicVar || (fieldDef.type == "!group" ? jsonLogic.groupVarKey : "var");
    ret = { [varName] : fieldName };
    if (meta.usedFields.indexOf(field) == -1)
      meta.usedFields.push(field);
  }
  return ret;
};

const buildFnToFormatOp = (operator, operatorDefinition, formattedField, formattedValue) => {
  let formatteOp = operator;
  const cardinality = defaultValue(operatorDefinition.cardinality, 1);
  const isReverseArgs = defaultValue(operatorDefinition._jsonLogicIsRevArgs, false);
  if (typeof operatorDefinition.jsonLogic == "string")
    formatteOp = operatorDefinition.jsonLogic;
  const rangeOps = ["<", "<=", ">", ">="];
  const eqOps = ["==", "!="];
  const fn = (field, op, val, opDef, opOpts) => {
    if (cardinality == 0 && eqOps.includes(formatteOp))
      return { [formatteOp]: [formattedField, null] };
    else if (cardinality == 0)
      return { [formatteOp]: formattedField };
    else if (cardinality == 1 && isReverseArgs)
      return { [formatteOp]: [formattedValue, formattedField] };
    else if (cardinality == 1)
      return { [formatteOp]: [formattedField, formattedValue] };
    else if (cardinality == 2 && rangeOps.includes(formatteOp))
      return { [formatteOp]: [formattedValue[0], formattedField, formattedValue[1]] };
    else
      return { [formatteOp]: [formattedField, ...formattedValue] };
  };
  return fn;
};

const formatLogic = (config, properties, formattedField, formattedValue, operator, operatorOptions = null, fieldDefinition = null, isRev = false) => {
  const field = properties.get("field");
  const operatorDefinition = getOperatorConfig(config, operator, field) || {};
  let fn = typeof operatorDefinition.jsonLogic == "function" 
    ? operatorDefinition.jsonLogic 
    : buildFnToFormatOp(operator, operatorDefinition, formattedField, formattedValue);
  const args = [
    formattedField,
    operator,
    formattedValue,
    omit(operatorDefinition, ["formatOp", "mongoFormatOp", "sqlFormatOp", "jsonLogic", "spelFormatOp"]),
    operatorOptions,
    fieldDefinition,
  ];
  let ruleQuery = fn(...args);

  if (isRev) {
    ruleQuery = { "!": ruleQuery };
  }

  return ruleQuery;
};
