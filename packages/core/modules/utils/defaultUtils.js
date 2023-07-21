import Immutable from "immutable";
import uuid from "./uuid";
import {getFieldConfig, getOperatorConfig} from "./configUtils";
import {getNewValueForFieldOp, getFirstField, getFirstOperator} from "../utils/ruleUtils";


export const defaultField = (config, canGetFirst = true, parentRuleGroupPath = null, fieldSrc = "field") => {
  if (fieldSrc !== "field")
    return null; // don't return default function (yet)
  return typeof config.settings.defaultField === "function"
    ? config.settings.defaultField(parentRuleGroupPath) 
    : (config.settings.defaultField || (canGetFirst ? getFirstField(config, parentRuleGroupPath) : null));
};

export const defaultFieldSrc = (config, canGetFirst = true) => {
  return canGetFirst && config.settings.fieldSources?.[0] || "field";
};

export const defaultOperator = (config, field, canGetFirst = true) => {
  let fieldConfig = getFieldConfig(config, field);
  let fieldOperators = fieldConfig && fieldConfig.operators || [];
  let fieldDefaultOperator = fieldConfig && fieldConfig.defaultOperator;
  if (!fieldOperators.includes(fieldDefaultOperator))
    fieldDefaultOperator = null;
  if (!fieldDefaultOperator && canGetFirst)
    fieldDefaultOperator = getFirstOperator(config, field);
  let op = typeof config.settings.defaultOperator === "function"
    ? config.settings.defaultOperator(field, fieldConfig) : fieldDefaultOperator;
  return op;
};

//used for complex operators like proximity
export const defaultOperatorOptions = (config, operator, field) => {
  let operatorConfig = operator ? getOperatorConfig(config, operator, field) : null;
  if (!operatorConfig)
    return null; //new Immutable.Map();
  return operatorConfig.options ? new Immutable.Map(
    operatorConfig.options
    && operatorConfig.options.defaults || {}
  ) : null;
};

export const defaultRuleProperties = (config, parentRuleGroupPath = null, item = null) => {
  // tip: setDefaultFieldAndOp not documented
  let field = null, operator = null, fieldSrc = null;
  const {setDefaultFieldAndOp, showErrorMessage} = config.settings;
  if (item) {
    fieldSrc = item?.properties?.fieldSrc;
    field = item?.properties?.field;
    operator = item?.properties?.operator;
  } else if (setDefaultFieldAndOp) {
    fieldSrc = defaultFieldSrc(config);
    field = defaultField(config, true, parentRuleGroupPath, fieldSrc);
    operator = defaultOperator(config, field, fieldSrc);
  } else {
    fieldSrc = defaultFieldSrc(config);
  }
  let current = new Immutable.Map({
    fieldSrc: fieldSrc,
    field: field,
    operator: operator,
    value: new Immutable.List(),
    valueSrc: new Immutable.List(),
    //used for complex operators like proximity
    operatorOptions: defaultOperatorOptions(config, operator, field),
  });
  if (showErrorMessage) {
    current = current.set("valueError", new Immutable.List());
  }
  
  if (field && operator) {
    let {newValue, newValueSrc, newValueType, newValueError} = getNewValueForFieldOp(
      config, config, current, field, operator, "operator", false
    );
    current = current
      .set("value", newValue)
      .set("valueSrc", newValueSrc)
      .set("valueType", newValueType);
    if (showErrorMessage) {
      current = current
        .set("valueError", newValueError);
    }
  }
  return current; 
};


export const defaultGroupConjunction = (config, fieldConfig = null) => {
  fieldConfig = getFieldConfig(config, fieldConfig); // if `fieldConfig` is field name, not config
  const conjs = fieldConfig && fieldConfig.conjunctions || Object.keys(config.conjunctions);
  if (conjs.length == 1)
    return conjs[0];
  return config.settings.defaultGroupConjunction || config.settings.defaultConjunction || conjs[0];
};

export const defaultConjunction = (config) =>
  config.settings.defaultConjunction || Object.keys(config.conjunctions)[0];

export const defaultGroupProperties = (config, fieldConfig = null) => new Immutable.Map({
  conjunction: defaultGroupConjunction(config, fieldConfig),
  not: false
});

export const defaultItemProperties = (config, item) => {
  return item && item.type == "group" 
    ? defaultGroupProperties(config, item?.properties?.field) 
    : defaultRuleProperties(config, null, item);
};

export const defaultRule = (id, config) => ({
  [id]: new Immutable.Map({
    type: "rule",
    id: id,
    properties: defaultRuleProperties(config)
  })
});

export const defaultRoot = (config) => {
  return new Immutable.Map({
    type: "group",
    id: uuid(),
    children1: new Immutable.OrderedMap({ ...defaultRule(uuid(), config) }),
    properties: defaultGroupProperties(config)
  });
};

export const createListFromArray = (ids) => {
  return new Immutable.List(ids);
};

export const emptyProperies = () => new Immutable.Map();
