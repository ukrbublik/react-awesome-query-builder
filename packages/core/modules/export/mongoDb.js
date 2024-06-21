import {getOpCardinality, widgetDefKeysToOmit, opDefKeysToOmit, omit} from "../utils/stuff";
import {
  getFieldConfig, getOperatorConfig, getFieldWidgetConfig, getFuncConfig, getFieldParts, extendConfig,
} from "../utils/configUtils";
import {getFieldPathLabels, getWidgetForFieldOp, formatFieldName, completeValue} from "../utils/ruleUtils";
import {defaultConjunction} from "../utils/defaultUtils";
import pick from "lodash/pick";
import {List, Map} from "immutable";


// helpers
const isObject = (v) => (typeof v == "object" && v !== null && !Array.isArray(v));

export const mongodbFormat = (tree, config) => {
  return _mongodbFormat(tree, config, false);
};

export const _mongodbFormat = (tree, config, returnErrors = true) => {
  //meta is mutable
  let meta = {
    errors: []
  };

  const extendedConfig = extendConfig(config, undefined, false);
  const res = formatItem([], tree, extendedConfig, meta);

  if (returnErrors) {
    return [res, meta.errors];
  } else {
    if (meta.errors.length)
      console.warn("Errors while exporting to MongoDb:", meta.errors);
    return res;
  }
};


const formatItem = (parents, item, config, meta, _not = false, _canWrapExpr = true, _formatFieldName = undefined, _value = undefined) => {
  if (!item) return undefined;

  const type = item.get("type");

  if ((type === "group" || type === "rule_group")) {
    return formatGroup(parents, item, config, meta, _not, _canWrapExpr, _formatFieldName, _value);
  } else if (type === "rule") {
    return formatRule(parents, item, config, meta, _not, _canWrapExpr, _formatFieldName, _value);
  }
  return undefined;
};


const formatGroup = (parents, item, config, meta, _not = false, _canWrapExpr = true, _formatFieldName = undefined, _value = undefined) => {
  const type = item.get("type");
  const properties = item.get("properties") || new Map();
  const children = item.get("children1") || new List();
  const {canShortMongoQuery, fieldSeparator} = config.settings;
  const sep = fieldSeparator;

  const hasParentRuleGroup = parents.filter(it => it.get("type") == "rule_group").length > 0;
  const parentPath = parents
    .filter(it => it.get("type") == "rule_group")
    .map(it => it.get("properties").get("field"))
    .slice(-1).pop();
  const realParentPath = hasParentRuleGroup && parentPath;

  const groupField = type === "rule_group" ? properties.get("field") : null;
  const groupOperator = type === "rule_group" ? properties.get("operator") : null;
  const groupOperatorCardinality = groupOperator ? config.operators[groupOperator]?.cardinality ?? 1 : undefined;
  const groupFieldName = formatFieldName(groupField, config, meta, realParentPath);
  const groupFieldDef = getFieldConfig(config, groupField) || {};
  const mode = groupFieldDef.mode; //properties.get("mode");
  const canHaveEmptyChildren = groupField && mode === "array" && groupOperatorCardinality >= 1;

  // try to reverse conj
  let not = !!properties.get("not");
  let conjunction = properties.get("conjunction");
  if (!conjunction)
    conjunction = defaultConjunction(config);
  let conjunctionDefinition = config.conjunctions[conjunction];
  const reversedConj = conjunctionDefinition.reversedConj;
  const canRev = reversedConj && !!config.settings.reverseOperatorsForNot;
  if (canRev && not) {
    conjunction = reversedConj;
    conjunctionDefinition = config.conjunctions[conjunction];
    not = false;
  }
  if (!conjunctionDefinition)
    return undefined;
  const mongoConj = conjunctionDefinition.mongoConj;

  // format children
  const list = children
    .map((currentChild) => formatItem(
      [...parents, item], currentChild, config, meta, _not, mode != "array", mode == "array" ? (f => `$$el${sep}${f}`) : undefined)
    )
    .filter((currentChild) => typeof currentChild !== "undefined");
  if (!canHaveEmptyChildren && !list.size) {
    return undefined;
  }

  let resultQuery;
  if (list.size == 1) {
    resultQuery = list.first();
  } else if (list.size > 1) {
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
    if (!resultQuery) {
      // can't be shorten
      resultQuery = { [mongoConj] : rules };
    }
  }

  if (groupField) {
    if (mode == "array") {
      const totalQuery = {
        "$size": {
          "$ifNull": [
            "$" + groupFieldName,
            []
          ]
        }
      };
      const filterQuery = resultQuery ? {
        "$size": {
          "$ifNull": [
            {
              "$filter": {
                input: "$" + groupFieldName,
                as: "el",
                cond: resultQuery
              }
            },
            []
          ]
        }
      } : totalQuery;
      resultQuery = formatItem(
        parents, item.set("type", "rule"), config, meta, false, false, (_f => filterQuery), totalQuery
      );
      resultQuery = { "$expr": resultQuery };
    } else {
      resultQuery = { [groupFieldName]: {"$elemMatch": resultQuery} };
    }
  }

  if (not) {
    resultQuery = { "$not": resultQuery };
  }

  return resultQuery;
};


const formatRule = (parents, item, config, meta, _not = false, _canWrapExpr = true, _formatFieldName = undefined, _value = undefined) => {
  const properties = item.get("properties") || new Map();

  const hasParentRuleGroup = parents.filter(it => it.get("type") == "rule_group").length > 0;
  const parentPath = parents
    .filter(it => it.get("type") == "rule_group")
    .map(it => it.get("properties").get("field"))
    .slice(-1).pop();
  const realParentPath = hasParentRuleGroup && parentPath;

  let operator = properties.get("operator");
  const operatorOptions = properties.get("operatorOptions");
  const field = properties.get("field");
  const fieldSrc = properties.get("fieldSrc");
  const iValue = properties.get("value");
  const iValueSrc = properties.get("valueSrc");
  const iValueType = properties.get("valueType");
  const asyncListValues = properties.get("asyncListValues");

  if (field == null || operator == null || iValue === undefined)
    return undefined;

  const fieldDef = getFieldConfig(config, field) || {};
  let operatorDefinition = getOperatorConfig(config, operator, field) || {};
  let reversedOp = operatorDefinition.reversedOp;
  let revOperatorDefinition = getOperatorConfig(config, reversedOp, field) || {};
  const cardinality = getOpCardinality(operatorDefinition);
  const canRev = reversedOp && !!config.settings.reverseOperatorsForNot;

  let not = _not;
  if (canRev && not) {
    [operator, reversedOp] = [reversedOp, operator];
    [operatorDefinition, revOperatorDefinition] = [revOperatorDefinition, operatorDefinition];
    not = false;
  }

  let formattedField;
  let useExpr = false;
  if (fieldSrc == "func") {
    [formattedField, useExpr] = formatFunc(meta, config, field, realParentPath);
  } else {
    formattedField = formatFieldName(field, config, meta, realParentPath);
    if (_formatFieldName) {
      useExpr = true;
      formattedField = _formatFieldName(formattedField);
    }
  }
  if (formattedField == undefined)
    return undefined;

  //format value
  let valueSrcs = [];
  let valueTypes = [];
  let formattedValue;
  if (iValue != undefined) {
    const fvalue = iValue.map((currentValue, ind) => {
      const valueSrc = iValueSrc ? iValueSrc.get(ind) : null;
      const valueType = iValueType ? iValueType.get(ind) : null;
      const cValue = completeValue(currentValue, valueSrc, config);
      const widget = getWidgetForFieldOp(config, field, operator, valueSrc);
      const fieldWidgetDef = getFieldWidgetConfig(config, field, operator, widget, valueSrc, { forExport: true });
      const [fv, fvUseExpr] = formatValue(
        meta, config, cValue, valueSrc, valueType, fieldWidgetDef, fieldDef, realParentPath,  operator, operatorDefinition, asyncListValues
      );
      if (fv !== undefined) {
        useExpr = useExpr || fvUseExpr;
        valueSrcs.push(valueSrc);
        valueTypes.push(valueType);
      }
      return fv;
    });
    const hasUndefinedValues = fvalue.filter(v => v === undefined).size > 0;
    if (fvalue.size < cardinality || hasUndefinedValues)
      return undefined;
    formattedValue = cardinality > 1 ? fvalue.toArray() : (cardinality == 1 ? fvalue.first() : null);
  }
  const wrapExpr = useExpr && _canWrapExpr;

  //build rule
  const fn = operatorDefinition.mongoFormatOp;
  if (!fn) {
    meta.errors.push(`Operator ${operator} is not supported`);
    return undefined;
  }
  const args = [
    formattedField,
    operator,
    _value !== undefined && formattedValue == null ? _value : formattedValue,
    useExpr,
    (valueSrcs.length > 1 ? valueSrcs : valueSrcs[0]),
    (valueTypes.length > 1 ? valueTypes : valueTypes[0]),
    omit(operatorDefinition, opDefKeysToOmit),
    operatorOptions,
    fieldDef,
  ];
  let ruleQuery = fn.call(config.ctx, ...args);
  if (wrapExpr) {
    ruleQuery = { "$expr": ruleQuery };
  }
  if (not) {
    ruleQuery = { "$not": ruleQuery };
  }
  return ruleQuery;
};


const formatValue = (meta, config, currentValue, valueSrc, valueType, fieldWidgetDef, fieldDef, parentPath, operator, operatorDef, asyncListValues) => {
  if (currentValue === undefined)
    return [undefined, false];

  let ret;
  let useExpr = false;

  if (valueSrc == "field") {
    [ret, useExpr] = formatRightField(meta, config, currentValue, parentPath);
  } else if (valueSrc == "func") {
    [ret, useExpr] = formatFunc(meta, config, currentValue, parentPath);
  } else {
    if (typeof fieldWidgetDef?.mongoFormatValue === "function") {
      const fn = fieldWidgetDef.mongoFormatValue;
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
      ret = fn.call(config.ctx, ...args);
    } else {
      ret = currentValue;
    }
  }

  return [ret, useExpr];
};


const formatRightField = (meta, config, rightField, parentPath) => {
  const {fieldSeparator} = config.settings;
  let ret;
  const useExpr = true;

  if (rightField) {
    const rightFieldDefinition = getFieldConfig(config, rightField) || {};
    const fieldParts = getFieldParts(rightField, config);
    const fieldPartsLabels = getFieldPathLabels(rightField, config);
    const fieldFullLabel = fieldPartsLabels ? fieldPartsLabels.join(fieldSeparator) : null;
    const formatFieldFn = config.settings.formatField;
    const rightFieldName = formatFieldName(rightField, config, meta, parentPath);
    const formattedField = formatFieldFn(rightFieldName, fieldParts, fieldFullLabel, rightFieldDefinition, config, false);
    ret = "$" + formattedField;
  }

  return [ret, useExpr];
};


const formatFunc = (meta, config, currentValue, parentPath) => {
  const useExpr = true;
  let ret;

  const funcKey = currentValue.get?.("func");
  const args = currentValue.get?.("args");
  const funcConfig = getFuncConfig(config, funcKey);
  if (!funcConfig) {
    meta.errors.push(`Func ${funcKey} is not defined in config`);
    return [undefined, false];
  }
  const funcParts = getFieldParts(funcKey, config);
  const funcLastKey = funcParts[funcParts.length-1];
  const funcName = funcConfig.mongoFunc || funcLastKey;
  const mongoArgsAsObject = funcConfig.mongoArgsAsObject;

  let formattedArgs = {};
  let argsCnt = 0;
  let lastArg = undefined;
  let gaps = [];
  let missingArgKeys = [];
  for (const argKey in funcConfig.args) {
    argsCnt++;
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
    const operator = null;
    const widget = getWidgetForFieldOp(config, argConfig, operator, argValueSrc);
    const fieldWidgetDef = getFieldWidgetConfig(config, argConfig, operator, widget, argValueSrc, { forExport: true });
    const [formattedArgVal, _argUseExpr] = formatValue(
      meta, config, argValue, argValueSrc, argConfig.type, fieldWidgetDef, fieldDef, parentPath, null, null, argAsyncListValues
    );
    if (argValue != undefined && formattedArgVal === undefined) {
      if (argValueSrc != "func") // don't triger error if args value is another incomplete function
        meta.errors.push(`Can't format value of arg ${argKey} for func ${funcKey}`);
      return [undefined, false];
    }
    let formattedDefaultVal;
    if (formattedArgVal === undefined && !isOptional && defaultValue != undefined) {
      const defaultWidget = getWidgetForFieldOp(config, argConfig, operator, defaultValueSrc);
      const defaultFieldWidgetDef = getFieldWidgetConfig(config, argConfig, operator, defaultWidget, defaultValueSrc, { forExport: true });
      let _;
      ([formattedDefaultVal, _] = formatValue(
        meta, config, defaultValue, defaultValueSrc, argConfig.type, defaultFieldWidgetDef, fieldDef, parentPath, null, null, argAsyncListValues
      ));
      if (formattedDefaultVal === undefined) {
        if (defaultValueSrc != "func") // don't triger error if args value is another incomplete function
          meta.errors.push(`Can't format default value of arg ${argKey} for func ${funcKey}`);
        return [undefined, false];
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
      formattedArgs[argKey] = finalFormattedVal;
      lastArg = finalFormattedVal;
    } else {
      if (!isOptional)
        missingArgKeys.push(argKey);
      gaps.push(argKey);
    }
  }
  if (missingArgKeys.length) {
    //meta.errors.push(`Missing vals for args ${missingArgKeys.join(", ")} for func ${funcKey}`);
    return [undefined, false]; // incomplete
  }

  if (typeof funcConfig.mongoFormatFunc === "function") {
    const fn = funcConfig.mongoFormatFunc;
    const args = [
      formattedArgs,
    ];
    ret = fn.call(config.ctx, ...args);
  } else if (funcConfig.mongoFormatFunc === null) {
    meta.errors.push(`Functon ${funcName} is not supported`);
    return [undefined, false];
  } else {
    if (mongoArgsAsObject)
      ret = { [funcName]: formattedArgs };
    else if (argsCnt == 1 && lastArg !== undefined)
      ret = { [funcName]: lastArg };
    else
      ret = { [funcName]: Object.values(formattedArgs) };
  }

  return [ret, useExpr];
};


