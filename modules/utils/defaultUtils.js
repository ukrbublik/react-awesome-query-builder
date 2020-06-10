import Immutable from "immutable";
import uuid from "./uuid";
import {getFieldConfig, getFirstField, getFirstOperator, getOperatorConfig} from "./configUtils";
import {getNewValueForFieldOp} from "../utils/validation";


export const defaultField = (config, canGetFirst = true, parentRuleGroupPath = null) => {
  return typeof config.settings.defaultField === "function"
    ? config.settings.defaultField(parentRuleGroupPath) 
    : (config.settings.defaultField || (canGetFirst ? getFirstField(config, parentRuleGroupPath) : null));
};

export const defaultOperator = (config, field, canGetFirst = true) => {
  let fieldConfig = getFieldConfig(field, config);
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

export const defaultRuleProperties = (config, parentRuleGroupPath = null) => {
  let field = null, operator = null;
  const {setDefaultFieldAndOp, showErrorMessage} = config.settings;
  if (setDefaultFieldAndOp) {
    field = defaultField(config, true, parentRuleGroupPath);
    operator = defaultOperator(config, field);
  }
  let current = new Immutable.Map({
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
    let {newValue, newValueSrc, newValueType, newValueError} = getNewValueForFieldOp(config, config, current, field, operator, "operator", false);
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

//------------

export const defaultConjunction = (config) =>
  config.settings.defaultConjunction || Object.keys(config.conjunctions)[0];

export const defaultGroupProperties = (config) => new Immutable.Map({
  conjunction: defaultConjunction(config)
});


//------------

export const getChild = (id, config) => ({
  [id]: new Immutable.Map({
    type: "rule",
    id: id,
    properties: defaultRuleProperties(config)
  })
});

export const defaultRoot = (config) => {
  if (config.tree) {
    return new Immutable.Map(config.tree);
  }
  
  return new Immutable.Map({
    type: "group",
    id: uuid(),
    children1: new Immutable.OrderedMap({ ...getChild(uuid(), config) }),
    properties: defaultGroupProperties(config)
  });
};

