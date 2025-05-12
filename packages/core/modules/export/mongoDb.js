import {getOpCardinality, widgetDefKeysToOmit, opDefKeysToOmit, omit, isObject} from "../utils/stuff";
import {
  getFieldConfig, getOperatorConfig, getFieldWidgetConfig, getFuncConfig, getFieldParts, getWidgetForFieldOp,
} from "../utils/configUtils";
import {extendConfig} from "../utils/configExtend";
import {getFieldPathLabels, formatFieldName, completeValue, getOneChildOrDescendant} from "../utils/ruleUtils";
import {defaultConjunction} from "../utils/defaultUtils";
import { mongoFieldEscape } from "../utils/mongoUtils";
import pick from "lodash/pick";
import {List, Map} from "immutable";

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
  const origNot = !!properties.get("not");
  const children = item.get("children1") || new List();
  const {canShortMongoQuery, fieldSeparator, exportPreserveGroups, reverseOperatorsForNot} = config.settings;
  const sep = fieldSeparator;

  const parentRuleGroup = parents.filter(it => it.get("type") == "rule_group")?.slice(-1)?.pop();
  const isInsideRuleGroup = !!parentRuleGroup;
  const parentRuleGroupField = parentRuleGroup?.get("properties").get("field");
  const isInsideRuleGroupArray = isInsideRuleGroup && parentRuleGroup.get("properties").get("mode") == "array";

  const isRuleGroup = (type === "rule_group");
  const groupField = isRuleGroup ? properties.get("field") : null;
  let groupOperator = isRuleGroup ? properties.get("operator") : null;
  let groupOperatorDef = groupOperator && getOperatorConfig(config, groupOperator, groupField) || null;
  const groupOperatorCardinality = groupOperator ? groupOperatorDef?.cardinality ?? 1 : undefined;
  const groupFieldName = formatFieldName(groupField, config, meta, parentRuleGroupField);
  const groupFieldDef = getFieldConfig(config, groupField) || {};
  const mode = groupFieldDef.mode; //properties.get("mode");
  const canHaveEmptyChildren = groupField && mode === "array" && groupOperatorCardinality >= 1;
  const isRuleGroupArray = isRuleGroup && mode != "struct";
  const isRuleGroupWithChildren = isRuleGroup && children?.size > 0;
  const isRuleGroupWithoutChildren = isRuleGroup && !children?.size;

  // rev
  let revChildren = false;
  let not = origNot;
  let filterNot = false;
  if (isRuleGroupWithChildren) {
    // for rule_group `not` there should be 2 NOTs: from properties (for children) and from parent group (_not)
    filterNot = origNot;
    not = _not;
  } else {
    if (_not) {
      not = !not;
    }
  }
  let reversedGroupOp = groupOperatorDef?.reversedOp;
  let reversedGroupOpDef = getOperatorConfig(config, reversedGroupOp, groupField);
  const groupOpNeedsReverse = !groupOperatorDef?.mongoFormatOp && !!reversedGroupOpDef?.mongoFormatOp;
  const groupOpCanReverse = !!reversedGroupOpDef?.mongoFormatOp;
  const oneChildType = getOneChildOrDescendant(item)?.get("type");
  const isSimpleGroupWithOneChild = !isRuleGroup && oneChildType === "rule";
  const canRevChildren = (not && isSimpleGroupWithOneChild || filterNot && children?.size === 1) && !exportPreserveGroups; // && !!reverseOperatorsForNot;
  if (canRevChildren) {
    if (isSimpleGroupWithOneChild) {
      not = !not;
    } else {
      filterNot = !filterNot;
    }
    revChildren = true;
  }
  let canRevGroupOp = not && isRuleGroup && groupOpCanReverse && (!!reverseOperatorsForNot && !exportPreserveGroups || groupOpNeedsReverse);
  if (canRevGroupOp) {
    not = !not;
    [groupOperator, reversedGroupOp] = [reversedGroupOp, groupOperator];
    [groupOperatorDef, reversedGroupOpDef] = [reversedGroupOpDef, groupOperatorDef];
  }

  // conj
  let conjunction = properties.get("conjunction");
  if (!conjunction)
    conjunction = defaultConjunction(config);
  let conjunctionDefinition = config.conjunctions[conjunction];
  if (!conjunctionDefinition)
    return undefined;
  // rev conj
  const reversedConj = conjunctionDefinition.reversedConj;
  const canRev = not && conjunction?.toLowerCase() === "or" && reversedConj && !isRuleGroup
     && !!reverseOperatorsForNot && !exportPreserveGroups;
  if (canRev) {
    conjunction = reversedConj;
    conjunctionDefinition = config.conjunctions[conjunction];
    not = !not;
    revChildren = true;
  }

  const mongoConj = conjunctionDefinition.mongoConj;

  // tip: can't use "$expr" inside "$filter"."cond" or inside "$elemMatch"
  const canWrapExpr = !isRuleGroup && !isInsideRuleGroup;
  const formatFieldNameFn = mode == "array" ? (f => `$$el${sep}${f}`) : _formatFieldName;

  const list = children
    .map((currentChild) => formatItem(
      [...parents, item], currentChild, config, meta, revChildren, canWrapExpr, formatFieldNameFn)
    )
    .filter((formattedChild) => typeof formattedChild !== "undefined");
  if (!canHaveEmptyChildren && !list.size) {
    return undefined;
  }

  let resultQuery;
  let shortQuery;
  if (list.size == 1) {
    resultQuery = list.first();
  } else if (list.size > 1) {
    const rules = list.toList().toJS();
    const canShort = canShortMongoQuery && (mongoConj == "$and") && !exportPreserveGroups;
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
    if (resultQuery) {
      shortQuery = true;
    } else {
      // can't be shorten
      shortQuery = false;
      resultQuery = { [mongoConj] : rules };
    }
  }

  if (groupField) {
    if (mode == "array") {
      const totalQuery = {
        "$size": {
          "$ifNull": [
            "$" + mongoFieldEscape(groupFieldName),
            []
          ]
        }
      };
      if (filterNot && resultQuery) {
        resultQuery = { "$not": resultQuery };
        filterNot = false;
      }
      const filterQuery = resultQuery ? {
        "$size": {
          "$ifNull": [
            {
              "$filter": {
                input: "$" + mongoFieldEscape(groupFieldName),
                as: "el",
                cond: resultQuery
              }
            },
            []
          ]
        }
      } : totalQuery;
      const notForRule = !exportPreserveGroups ? not : false;
      resultQuery = formatItem(
        parents, item.set("type", "rule"), config, meta, notForRule, false, (_f => filterQuery), totalQuery
      );
      if (notForRule) {
        not = false;
      }
      resultQuery = { "$expr": resultQuery };
    } else {
      // tip: $elemMatch can't have $not and $expr inside BUT can have $nor
      resultQuery = { [mongoFieldEscape(groupFieldName)]: {"$elemMatch": resultQuery} };
    }
  }

  if (not) {
    // tip: $nor can't be inside $filter.cond or $expr
    if (isInsideRuleGroupArray) {
      // inside $filter.cond
      resultQuery = { "$not": resultQuery };
    } else {
      resultQuery = { "$nor": [ resultQuery ] };
    }
  }

  return resultQuery;
};


const formatRule = (parents, item, config, meta, _not = false, _canWrapExpr = true, _formatFieldName = undefined, _value = undefined) => {
  const properties = item.get("properties") || new Map();

  const parentRuleGroup = parents.filter(it => it.get("type") == "rule_group")?.slice(-1)?.pop();
  const parentRuleGroupField = parentRuleGroup?.get("properties").get("field");

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

  const fieldDef = getFieldConfig(config, field);

  // check op
  let operatorDefinition = getOperatorConfig(config, operator, field);
  let reversedOp = operatorDefinition?.reversedOp;
  let revOperatorDefinition = getOperatorConfig(config, reversedOp, field);
  const cardinality = getOpCardinality(operatorDefinition);
  if (!operatorDefinition?.mongoFormatOp && !revOperatorDefinition?.mongoFormatOp) {
    meta.errors.push(`Operator ${operator} is not supported`);
    return undefined;
  }

  // try reverse
  let not = _not;
  const opNeedsReverse = !operatorDefinition?.mongoFormatOp && !!revOperatorDefinition?.mongoFormatOp;
  const opCanReverse = !!revOperatorDefinition?.mongoFormatOp;
  let canRev = opCanReverse && (!!config.settings.reverseOperatorsForNot || opNeedsReverse);
  const needRev = canRev && not || opNeedsReverse;
  let isRev = false;
  if (needRev) {
    [operator, reversedOp] = [reversedOp, operator];
    [operatorDefinition, revOperatorDefinition] = [revOperatorDefinition, operatorDefinition];
    not = !not;
    isRev = true;
  }

  let formattedField;
  let useExpr = false;
  if (fieldSrc == "func") {
    [formattedField, useExpr] = formatFunc(meta, config, field, parentRuleGroupField);
  } else {
    formattedField = formatFieldName(field, config, meta, parentRuleGroupField);
    formattedField = mongoFieldEscape(formattedField);
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
        meta, config, cValue, valueSrc, valueType, fieldWidgetDef, fieldDef, parentRuleGroupField, operator, operatorDefinition, asyncListValues
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
  const fn = operatorDefinition?.mongoFormatOp;
  const args = [
    formattedField,
    operator,
    _value !== undefined && formattedValue == null ? _value : formattedValue,
    not,
    useExpr,
    (valueSrcs.length > 1 ? valueSrcs : valueSrcs[0]),
    (valueTypes.length > 1 ? valueTypes : valueTypes[0]),
    omit(operatorDefinition, opDefKeysToOmit),
    operatorOptions,
    fieldDef,
  ];
  // `mongoFormatOp` function SHOULD handle `not`
  let ruleQuery = fn.call(config.ctx, ...args);
  if (wrapExpr) {
    // if (not) {
    //   ruleQuery = { "$not": ruleQuery };
    // }
    ruleQuery = { "$expr": ruleQuery };
  } else {
    // if (not) {
    //   ruleQuery = { "$nor": [ ruleQuery ] };
    // }
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
          ...(fieldDef ? pick(fieldDef, ["fieldSettings", "listValues"]) : {}),
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
    ret = "$" + mongoFieldEscape(formattedField);
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


