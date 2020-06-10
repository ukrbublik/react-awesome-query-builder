"use strict";
import {defaultValue} from "../utils/stuff";
import {
  getFieldConfig, getWidgetForFieldOp, getOperatorConfig, getFieldWidgetConfig, getFieldPath, getFieldPathLabels, getFuncConfig
} from "../utils/configUtils";
import {defaultConjunction} from "../utils/defaultUtils";
import {completeValue} from "../utils/funcUtils";
import omit from "lodash/omit";
import pick from "lodash/pick";
import {Map} from "immutable";
import {settings as defaultSettings} from "../config/default";

export const mongodbFormat = (tree, config) => {
  let meta = {
    errors: []
  };

  const res = mongodbFormatItem([], tree, config, meta);

  if (meta.errors.length)
    console.warn("Errors while exporting to MongoDb:", meta.errors);
  return res;
};

const isObject = (v) => (typeof v == "object" && v !== null && !Array.isArray(v));

//meta is mutable
const mongoFormatValue = (meta, config, currentValue, valueSrc, valueType, fieldWidgetDefinition, fieldDefinition, operator, operatorDefinition) => {
  if (currentValue === undefined)
    return [undefined, false];
  const {fieldSeparator} = config.settings;
  let ret;
  let useExpr = false;
  if (valueSrc == "field") {
    //format field
    const rightField = currentValue;
    if (rightField) {
      const rightFieldDefinition = getFieldConfig(rightField, config) || {};
      const fieldParts = Array.isArray(rightField) ? rightField : rightField.split(fieldSeparator);
      const _fieldKeys = getFieldPath(rightField, config);
      const fieldPartsLabels = getFieldPathLabels(rightField, config);
      const fieldFullLabel = fieldPartsLabels ? fieldPartsLabels.join(fieldSeparator) : null;
      const formatField = config.settings.formatField || defaultSettings.formatField;
      let rightFieldName = Array.isArray(rightField) ? rightField.join(fieldSeparator) : rightField;
      // if (rightFieldDefinition.tableName) {
      //     const fieldPartsCopy = [...fieldParts];
      //     fieldPartsCopy[0] = rightFieldDefinition.tableName;
      //     rightFieldName = fieldPartsCopy.join(fieldSeparator);
      // }
      const formattedField = formatField(rightFieldName, fieldParts, fieldFullLabel, rightFieldDefinition, config, false);
      ret = "$" + formattedField;
      useExpr = true;
    }
  } else if (valueSrc == "func") {
    useExpr = true;
    const funcKey = currentValue.get("func");
    const args = currentValue.get("args");
    const funcConfig = getFuncConfig(funcKey, config);
    const funcName = funcConfig.mongoFunc || funcKey;
    const mongoArgsAsObject = funcConfig.mongoArgsAsObject;
    const formattedArgs = {};
    let argsCnt = 0;
    let lastArg = undefined;
    for (const argKey in funcConfig.args) {
      const argConfig = funcConfig.args[argKey];
      const fieldDef = getFieldConfig(argConfig, config);
      const argVal = args ? args.get(argKey) : undefined;
      const argValue = argVal ? argVal.get("value") : undefined;
      const argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
      const [formattedArgVal, _argUseExpr] = mongoFormatValue(meta, config, argValue, argValueSrc, argConfig.type, fieldDef, argConfig, null, null);
      if (argValue != undefined && formattedArgVal === undefined) {
        meta.errors.push(`Can't format value of arg ${argKey} for func ${funcKey}`);
        return [undefined, false];
      }
      argsCnt++;
      if (formattedArgVal !== undefined) { // skip optional in the end
        formattedArgs[argKey] = formattedArgVal;
        lastArg = formattedArgVal;
      }
    }
    if (typeof funcConfig.mongoFormatFunc === "function") {
      const fn = funcConfig.mongoFormatFunc;
      const args = [
        formattedArgs,
      ];
      ret = fn(...args);
    } else {
      if (mongoArgsAsObject)
        ret = { [funcName]: formattedArgs };
      else if (argsCnt == 1 && lastArg !== undefined)
        ret = { [funcName]: lastArg };
      else
        ret = { [funcName]: Object.values(formattedArgs) };
    }
  } else {
    if (typeof fieldWidgetDefinition.mongoFormatValue === "function") {
      const fn = fieldWidgetDefinition.mongoFormatValue;
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
  return [ret, useExpr];
};

//meta is mutable
const mongodbFormatItem = (parents, item, config, meta, _not = false) => {
  if (!item) return undefined;
  const type = item.get("type");
  const properties = item.get("properties") || new Map();
  const children = item.get("children1");
  const {fieldSeparator, canShortMongoQuery} = config.settings;

  if ((type === "group" || type === "rule_group") && children && children.size) {
    const not = _not ? !(properties.get("not")) : (properties.get("not"));
    const list = children
      .map((currentChild) => mongodbFormatItem([...parents, item], currentChild, config, meta, not))
      .filter((currentChild) => typeof currentChild !== "undefined");
    if (!list.size)
      return undefined;

    let field = type === "rule_group" ? properties.get("field") : null;
    let conjunction = properties.get("conjunction");
    if (!conjunction)
      conjunction = defaultConjunction(config);
    let conjunctionDefinition = config.conjunctions[conjunction];
    const reversedConj = conjunctionDefinition.reversedConj;
    if (not && reversedConj) {
      conjunction = reversedConj;
      conjunctionDefinition = config.conjunctions[conjunction];
    }
    const mongoConj = conjunctionDefinition.mongoConj;

    let resultQuery;
    if (list.size == 1)
      resultQuery = list.first();
    else {
      const rules = list.toList().toJS();
      const canShort = canShortMongoQuery && (mongoConj == "$and");
      if (canShort) {
        resultQuery = rules.reduce((acc, rule) => {
          if (!acc) return undefined;
          for (let k in rule) {
            if (k[0] == "$") {
              acc = undefined;
              break;
            }
            if (acc[k] == undefined) {
              acc[k] = rule[k];
            } else {
              // https://github.com/ukrbublik/react-awesome-query-builder/issues/182
              let prev = acc[k], next = rule[k];
              if (!isObject(prev)) {
                prev = {"$eq": prev};
              }
              if (!isObject(next)) {
                next = {"$eq": next};
              }
              const prevOp = Object.keys(prev)[0], nextOp = Object.keys(next)[0];
              if (prevOp == nextOp) {
                acc = undefined;
                break;
              }
              acc[k] = Object.assign({}, prev, next);
            }
          }
          return acc;
        }, {});
      }
      if (!resultQuery) // can't be shorten
        resultQuery = { [mongoConj] : rules };
    }
    if (field) {
      resultQuery = { [field]: {"$elemMatch": resultQuery} };
    }
    return resultQuery;
  } else if (type === "rule") {
    let operator = properties.get("operator");
    const operatorOptions = properties.get("operatorOptions");
    let field = properties.get("field");
    let value = properties.get("value");

    if (field == null || operator == null)
      return undefined;

    const fieldDefinition = getFieldConfig(field, config) || {};
    let operatorDefinition = getOperatorConfig(config, operator, field) || {};
    let reversedOp = operatorDefinition.reversedOp;
    let revOperatorDefinition = getOperatorConfig(config, reversedOp, field) || {};
    const cardinality = defaultValue(operatorDefinition.cardinality, 1);

    if (_not) {
      [operator, reversedOp] = [reversedOp, operator];
      [operatorDefinition, revOperatorDefinition] = [revOperatorDefinition, operatorDefinition];
    }

    const hasParentRuleGroup = parents.filter(it => it.get("type") == "rule_group").length > 0;
    const parentPath = parents
      .filter(it => it.get("type") == "rule_group")
      .map(it => it.get("properties").get("field"))
      .join(fieldSeparator);

    //format field
    let fieldName = field;
    if (hasParentRuleGroup) {
      if (parentPath.length > 0 && fieldName.indexOf(parentPath+".") == 0) {
        fieldName = fieldName.slice((parentPath+".").length);
      } else {
        meta.errors.push(`Can't cut group from field ${fieldName}`);
      }
    }
    // if (fieldDefinition.tableName) {
    //   let fieldParts = Array.isArray(field) ? [...field] : field.split(fieldSeparator);
    //   fieldParts[0] = fieldDefinition.tableName;
    //   fieldName = fieldParts.join(fieldSeparator);
    // }

    //format value
    let valueSrcs = [];
    let valueTypes = [];
    let useExpr = false;
    value = value.map((currentValue, ind) => {
      const valueSrc = properties.get("valueSrc") ? properties.get("valueSrc").get(ind) : null;
      const valueType = properties.get("valueType") ? properties.get("valueType").get(ind) : null;
      currentValue = completeValue(currentValue, valueSrc, config);
      const widget = getWidgetForFieldOp(config, field, operator, valueSrc);
      const fieldWidgetDefinition = omit(getFieldWidgetConfig(config, field, operator, widget, valueSrc), ["factory"]);
      const [fv, _useExpr] = mongoFormatValue(meta, config, currentValue, valueSrc, valueType, fieldWidgetDefinition, fieldDefinition, operator, operatorDefinition);
      if (fv !== undefined) {
        useExpr = useExpr || _useExpr;
        valueSrcs.push(valueSrc);
        valueTypes.push(valueType);
      }
      return fv;
    });
    const hasUndefinedValues = value.filter(v => v === undefined).size > 0;
    if (value.size < cardinality || hasUndefinedValues)
      return undefined;
    const formattedValue = cardinality > 1 ? value.toArray() : (cardinality == 1 ? value.first() : null);
        
    //build rule
    const fn = operatorDefinition.mongoFormatOp;
    if (!fn) {
      meta.errors.push(`Operator ${operator} is not supported`);
      return undefined;
    }
    const args = [
      fieldName,
      operator,
      formattedValue,
      useExpr,
      (valueSrcs.length > 1 ? valueSrcs : valueSrcs[0]),
      (valueTypes.length > 1 ? valueTypes : valueTypes[0]),
      omit(operatorDefinition, ["formatOp", "mongoFormatOp", "sqlFormatOp", "jsonLogic"]),
      operatorOptions,
    ];
    let ruleQuery = fn(...args);
    if (ruleQuery && useExpr) {
      ruleQuery = { "$expr": ruleQuery };
    }
    return ruleQuery;
  }
  return undefined;
};

