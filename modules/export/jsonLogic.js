"use strict";
import {defaultValue} from "../utils/stuff";
import {
  getFieldConfig, getWidgetForFieldOp, getOperatorConfig, getFieldWidgetConfig, getFuncConfig
} from "../utils/configUtils";
import {defaultConjunction} from "../utils/defaultUtils";
import {completeValue} from "../utils/funcUtils";
import {Map} from "immutable";
import omit from "lodash/omit";
import pick from "lodash/pick";

// http://jsonlogic.com/

export const jsonLogicFormat = (item, config) => {
  let meta = {
    usedFields: [],
    errors: []
  };
    
  const logic = jsonLogicFormatItem(item, config, meta, true);
    
  // build empty data
  const {errors, usedFields} = meta;
  const {fieldSeparator, useGroupsAsArrays} = config.settings;
  let data = {};
  for (let ff of usedFields) {
    const def = getFieldConfig(ff, config) || {};
    const parts = ff.split(fieldSeparator);
    let tmp = data;
    for (let i = 0 ; i < parts.length ; i++) {
      const p = parts[i];
      const pdef = getFieldConfig(parts.slice(0, i+1), config) || {};
      if (i != parts.length - 1) {
        if (pdef.type == "!group" && useGroupsAsArrays) {
          if (!tmp[p])
            tmp[p] = [{}];
          tmp = tmp[p][0];
        } else {
          if (!tmp[p])
            tmp[p] = {};
          tmp = tmp[p];
        }
      } else {
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


//meta is mutable
const jsonLogicFormatValue = (meta, config, currentValue, valueSrc, valueType, fieldWidgetDefinition, fieldDefinition, operator, operatorDefinition, parentField = null) => {
  if (currentValue === undefined)
    return undefined;
  const {fieldSeparator} = config.settings;
  let ret;
  if (valueSrc == "field") {
    const rightField = currentValue;
    if (rightField) {
      const rightFieldName = Array.isArray(rightField) ? rightField.join(fieldSeparator) : rightField;
      ret = { "var": rightFieldName };
      if (meta.usedFields.indexOf(rightFieldName) == -1)
        meta.usedFields.push(rightFieldName);
    }
  } else if (valueSrc == "func") {
    const funcKey = currentValue.get("func");
    const args = currentValue.get("args");
    const funcConfig = getFuncConfig(funcKey, config);
    if (!funcConfig.jsonLogic) {
      meta.errors.push(`Func ${funcKey} is not supported`);
      return undefined;
    }
    const formattedArgs = {};
    for (const argKey in funcConfig.args) {
      const argConfig = funcConfig.args[argKey];
      const fieldDef = getFieldConfig(argConfig, config);
      const argVal = args ? args.get(argKey) : undefined;
      const argValue = argVal ? argVal.get("value") : undefined;
      const argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
      const formattedArgVal = jsonLogicFormatValue(meta, config, argValue, argValueSrc, argConfig.type, fieldDef, argConfig, null, null, parentField);
      if (argValue != undefined && formattedArgVal === undefined) {
        meta.errors.push(`Can't format value of arg ${argKey} for func ${funcKey}`);
        return undefined;
      }
      if (formattedArgVal !== undefined) { // skip optional in the end
        formattedArgs[argKey] = formattedArgVal;
      }
    }
    const formattedArgsArr = Object.values(formattedArgs);
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
  } else {
    if (typeof fieldWidgetDefinition.jsonLogic === "function") {
      const fn = fieldWidgetDefinition.jsonLogic;
      const args = [
        currentValue,
        pick(fieldDefinition, ["fieldSettings", "listValues"]),
        //useful options: valueFormat for date/time
        omit(fieldWidgetDefinition, ["formatValue", "mongoFormatValue", "sqlFormatValue", "jsonLogic"]),
      ];
      if (operator) {
        args.push(operator);
        args.push(operatorDefinition);
      }
      ret = fn(...args);
    } else {
      ret = currentValue;
    }
  }
  return ret;
};


const formarValue = (config, properties, meta, operator, parentField) => {
  const field = properties.get("field");
  const fieldDefinition = getFieldConfig(field, config) || {};
  const operatorDefinition = getOperatorConfig(config, operator, field) || {};
  const cardinality = defaultValue(operatorDefinition.cardinality, 1);

  let value = properties.get("value");
  if (value == undefined)
    return undefined;
  let valueSrcs = [];
  let valueTypes = [];
  let _usedFields = meta.usedFields;
  value = value.map((currentValue, ind) => {
    const valueSrc = properties.get("valueSrc") ? properties.get("valueSrc").get(ind) : null;
    const valueType = properties.get("valueType") ? properties.get("valueType").get(ind) : null;
    currentValue = completeValue(currentValue, valueSrc, config);
    const widget = getWidgetForFieldOp(config, field, operator, valueSrc);
    const fieldWidgetDefinition = omit(getFieldWidgetConfig(config, field, operator, widget, valueSrc), ["factory"]);
    const fv = jsonLogicFormatValue(meta, config, currentValue, valueSrc, valueType, fieldWidgetDefinition, fieldDefinition, operator, operatorDefinition, parentField);
    if (fv !== undefined) {
      valueSrcs.push(valueSrc);
      valueTypes.push(valueType);
    }
    return fv;
  });
  const hasUndefinedValues = value.filter(v => v === undefined).size > 0;
  if (value.size < cardinality || hasUndefinedValues) {
    meta.usedFields = _usedFields; // restore
    return undefined;
  }
  return cardinality > 1 ? value.toArray() : (cardinality == 1 ? value.first() : null);
};


const formatLogic = (config, properties, formattedField, formattedValue, operator, operatorOptions = null, isRev = false) => {
  const field = properties.get("field");
  const operatorDefinition = getOperatorConfig(config, operator, field) || {};
  const cardinality = defaultValue(operatorDefinition.cardinality, 1);
  const isReverseArgs = defaultValue(operatorDefinition._jsonLogicIsRevArgs, false);
  let formatteOp = operator;
  if (typeof operatorDefinition.jsonLogic == "string")
    formatteOp = operatorDefinition.jsonLogic;
  let fn = typeof operatorDefinition.jsonLogic == "function" ? operatorDefinition.jsonLogic : null;
  if (!fn) {
    const rangeOps = ["<", "<=", ">", ">="];
    fn = (field, op, val, opDef, opOpts) => {
      if (cardinality == 0)
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
  }
  const args = [
    formattedField,
    operator,
    formattedValue,
    omit(operatorDefinition, ["formatOp", "mongoFormatOp", "sqlFormatOp", "jsonLogic"]),
    operatorOptions,
  ];
  let ruleQuery = fn(...args);

  if (isRev) {
    ruleQuery = { "!": ruleQuery };
  }

  return ruleQuery;
};


//meta is mutable
const jsonLogicFormatItem = (item, config, meta, isRoot, parentField = null) => {
  if (!item) return undefined;
  const {fieldSeparator, useGroupsAsArrays} = config.settings;
  const type = item.get("type");
  const properties = item.get("properties") || new Map();
  const children = item.get("children1");
  const field = properties.get("field");

  if ((type === "group" || type === "rule_group") && children && children.size) {
    const isRuleGroup = (type === "rule_group" && !isRoot);
    let conjunction = properties.get("conjunction");
    if (!conjunction)
      conjunction = defaultConjunction(config);
    let conj = conjunction.toLowerCase();
    const not = properties.get("not");
    if (conj != "and" && conj != "or") {
      meta.errors.push(`Conjunction ${conj} is not supported`);
      return undefined;
    }

    const groupField = isRuleGroup && useGroupsAsArrays ? field : parentField;
    const ext = properties.get("ext");
    const groupOperator = properties.get("operator");
    const groupOperatorDefinition = groupOperator && getOperatorConfig(config, groupOperator, field) || {};
    const groupValue = properties.get("value");
    const formattedValue = formarValue(config, properties, meta, groupOperator, parentField);

    const list = children
      .map((currentChild) => jsonLogicFormatItem(currentChild, config, meta, false, groupField))
      .filter((currentChild) => typeof currentChild !== "undefined");
    
    if (isRuleGroup && useGroupsAsArrays && groupOperatorDefinition.cardinality != 0) {
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
    if (isRuleGroup && useGroupsAsArrays) {
      let fieldName = field;
      if (parentField) {
        fieldName = cutBeginOfString(fieldName, parentField + fieldSeparator);
      }

      if (!groupOperator || groupOperatorDefinition.cardinality == 0) {
        // all / some / none
        const op = groupOperator || "some";
        resultQuery = {
          [op]: [
            {var: fieldName},
            resultQuery
          ]
        };
      } else {
        // there is rule for count
        const filter = !list.size ? 
          fieldName : 
          {
            "filter": [
              {var: fieldName},
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
  } else if (type === "rule") {
    let operator = properties.get("operator");
    let operatorOptions = properties.get("operatorOptions");
    operatorOptions = operatorOptions ? operatorOptions.toJS() : null;
    if (operatorOptions && !Object.keys(operatorOptions).length)
      operatorOptions = null;
    let field = properties.get("field");

    if (field == null || operator == null)
      return undefined;

    const fieldDefinition = getFieldConfig(field, config) || {};
    let operatorDefinition = getOperatorConfig(config, operator, field) || {};
    let reversedOp = operatorDefinition.reversedOp;
    let revOperatorDefinition = getOperatorConfig(config, reversedOp, field) || {};
    const _fieldType = fieldDefinition.type || "undefined";
    const cardinality = defaultValue(operatorDefinition.cardinality, 1);

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

    // format value
    const formattedValue = formarValue(config, properties, meta, operator, parentField);
    if (formattedValue === undefined)
      return undefined;

    // format field
    let fieldName = field;
    if (parentField) {
      fieldName = cutBeginOfString(fieldName, parentField + fieldSeparator);
    }
    const formattedField = { "var": fieldName };
    if (meta.usedFields.indexOf(field) == -1)
      meta.usedFields.push(field);

    // format logic
    return formatLogic(config, properties, formattedField, formattedValue, operator, operatorOptions, isRev);
  }
  return undefined;
};


// helpers
const cutBeginOfString = (str, begin) => {
  if (begin && str.slice(0, begin.length) == begin) {
    str = str.slice(begin.length);
  }
  return str;
};
