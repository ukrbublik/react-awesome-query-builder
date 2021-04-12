import {defaultValue} from "../utils/stuff";
import {
  getFieldConfig, getOperatorConfig, getFieldWidgetConfig, getFuncConfig
} from "../utils/configUtils";
import {getFieldPath, getFieldPathLabels, getWidgetForFieldOp} from "../utils/ruleUtils";
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

const formatFieldName = (field, config, meta, parentPath) => {
  if (!field) return;
  const fieldDef = getFieldConfig(config, field) || {};
  const {fieldSeparator} = config.settings;
  const fieldParts = Array.isArray(field) ? field : field.split(fieldSeparator);
  let fieldName = Array.isArray(field) ? field.join(fieldSeparator) : field;
  // if (fieldDef.tableName) { // legacy
  //     const fieldPartsCopy = [...fieldParts];
  //     fieldPartsCopy[0] = fieldDef.tableName;
  //     fieldName = fieldPartsCopy.join(fieldSeparator);
  // }
  if (fieldDef.fieldName) {
    fieldName = fieldDef.fieldName;
  }

  if (parentPath) {
    const parentFieldDef = getFieldConfig(config, parentPath) || {};
    let parentFieldName = parentPath;
    if (parentFieldDef.fieldName) {
      parentFieldName = parentFieldDef.fieldName;
    }
    if (fieldName.indexOf(parentFieldName+".") == 0) {
      fieldName = fieldName.slice((parentFieldName+".").length);
    } else {
      meta.errors.push(`Can't cut group ${parentFieldName} from field ${fieldName}`);
    }
  }
  return fieldName;
};

//meta is mutable
const mongoFormatValue = (meta, config, currentValue, valueSrc, valueType, fieldWidgetDefinition, fieldDefinition, parentPath, operator, operatorDefinition) => {
  if (currentValue === undefined)
    return [undefined, false];
  const {fieldSeparator} = config.settings;
  let ret;
  let useExpr = false;
  if (valueSrc == "field") {
    //format field
    const rightField = currentValue;
    if (rightField) {
      const rightFieldDefinition = getFieldConfig(config, rightField) || {};
      const fieldParts = Array.isArray(rightField) ? rightField : rightField.split(fieldSeparator);
      const _fieldKeys = getFieldPath(rightField, config);
      const fieldPartsLabels = getFieldPathLabels(rightField, config);
      const fieldFullLabel = fieldPartsLabels ? fieldPartsLabels.join(fieldSeparator) : null;
      const formatField = config.settings.formatField || defaultSettings.formatField;
      const rightFieldName = formatFieldName(rightField, config, meta, parentPath);
      const formattedField = formatField(rightFieldName, fieldParts, fieldFullLabel, rightFieldDefinition, config, false);
      ret = "$" + formattedField;
      useExpr = true;
    }
  } else if (valueSrc == "func") {
    useExpr = true;
    const funcKey = currentValue.get("func");
    const args = currentValue.get("args");
    const funcConfig = getFuncConfig(config, funcKey);
    const funcName = funcConfig.mongoFunc || funcKey;
    const mongoArgsAsObject = funcConfig.mongoArgsAsObject;
    const formattedArgs = {};
    let argsCnt = 0;
    let lastArg = undefined;
    for (const argKey in funcConfig.args) {
      const argConfig = funcConfig.args[argKey];
      const fieldDef = getFieldConfig(config, argConfig);
      const argVal = args ? args.get(argKey) : undefined;
      const argValue = argVal ? argVal.get("value") : undefined;
      const argValueSrc = argVal ? argVal.get("valueSrc") : undefined;
      const widget = getWidgetForFieldOp(config, fieldDef, null, argValueSrc);
      const fieldWidgetDef = omit(getFieldWidgetConfig(config, fieldDef, null, widget, argValueSrc), ["factory"]);
      const [formattedArgVal, _argUseExpr] = mongoFormatValue(meta, config, argValue, argValueSrc, argConfig.type, fieldWidgetDef, fieldDef, parentPath, argConfig, null, null);
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
const mongodbFormatItem = (parents, item, config, meta, _not = false, _canWrapExpr = true, _fieldName = undefined, _value = undefined) => {
  if (!item) return undefined;
  const type = item.get("type");
  const properties = item.get("properties") || new Map();
  const children = item.get("children1");
  const {fieldSeparator, canShortMongoQuery} = config.settings;

  const hasParentRuleGroup = parents.filter(it => it.get("type") == "rule_group").length > 0;
  const parentPath = parents
    .filter(it => it.get("type") == "rule_group")
    .map(it => it.get("properties").get("field"))
    .slice(-1).pop();

  if ((type === "group" || type === "rule_group") && children && children.size) {
    const groupField = type === "rule_group" ? properties.get("field") : null;
    const groupFieldName = formatFieldName(groupField, config, meta, hasParentRuleGroup && parentPath);
    const groupFieldDef = getFieldConfig(config, groupField) || {};
    const mode = groupFieldDef.mode; //properties.get("mode");

    const useExpr = mode == "array";
    const not = _not ? !(properties.get("not")) : (properties.get("not"));
    const list = children
      .map((currentChild) => mongodbFormatItem(
        [...parents, item], currentChild, config, meta, not, false, useExpr ? (f => `$$el.${f}`) : undefined)
      )
      .filter((currentChild) => typeof currentChild !== "undefined");
    if (!list.size)
      return undefined;

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

    if (groupField) {
      if (mode == "array") {
        const filterQuery = {
          "$size": {
            "$filter": {
              input: "$" + groupFieldName,
              as: "el",
              cond: resultQuery
            }
          }
        };
        const totalQuery = {
          "$size": groupFieldName
        };
        resultQuery = mongodbFormatItem(
          parents, item.set("type", "rule"), config, meta, false, false, (_f => filterQuery), totalQuery
        );
        resultQuery = { "$expr": resultQuery };
      } else {
        resultQuery = { [groupFieldName]: {"$elemMatch": resultQuery} };
      }
    }
    return resultQuery;
  } else if (type === "rule") {
    let operator = properties.get("operator");
    const operatorOptions = properties.get("operatorOptions");
    let field = properties.get("field");
    let value = properties.get("value");

    if (field == null || operator == null || value === undefined)
      return undefined;

    const fieldDefinition = getFieldConfig(config, field) || {};
    let operatorDefinition = getOperatorConfig(config, operator, field) || {};
    let reversedOp = operatorDefinition.reversedOp;
    let revOperatorDefinition = getOperatorConfig(config, reversedOp, field) || {};
    const cardinality = defaultValue(operatorDefinition.cardinality, 1);

    let not = _not;
    if (not && reversedOp) {
      [operator, reversedOp] = [reversedOp, operator];
      [operatorDefinition, revOperatorDefinition] = [revOperatorDefinition, operatorDefinition];
      not = false;
    }

    const fieldName = formatFieldName(field, config, meta, hasParentRuleGroup && parentPath);

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
      const [fv, fvUseExpr] = mongoFormatValue(meta, config, currentValue, valueSrc, valueType, fieldWidgetDefinition, fieldDefinition, hasParentRuleGroup && parentPath, operator, operatorDefinition);
      if (fv !== undefined) {
        useExpr = useExpr || fvUseExpr;
        valueSrcs.push(valueSrc);
        valueTypes.push(valueType);
      }
      return fv;
    });
    if (!!_fieldName)
      useExpr = true;
    const wrapExpr = useExpr && _canWrapExpr;
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
      _fieldName ? _fieldName(fieldName) : fieldName,
      operator,
      _value !== undefined && formattedValue == null ? _value : formattedValue,
      useExpr,
      (valueSrcs.length > 1 ? valueSrcs : valueSrcs[0]),
      (valueTypes.length > 1 ? valueTypes : valueTypes[0]),
      omit(operatorDefinition, ["formatOp", "mongoFormatOp", "sqlFormatOp", "jsonLogic"]),
      operatorOptions,
    ];
    let ruleQuery = fn(...args);
    if (ruleQuery && wrapExpr) {
      ruleQuery = { "$expr": ruleQuery };
    }
    if (not) {
      ruleQuery = { "$not": ruleQuery };
    }
    return ruleQuery;
  }
  return undefined;
};

