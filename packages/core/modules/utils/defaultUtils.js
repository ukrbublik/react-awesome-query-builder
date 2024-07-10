import Immutable from "immutable";
import uuid from "./uuid";
import {getFieldConfig, getOperatorConfig, getFieldParts, getFirstField} from "./configUtils";
import {getFirstOperator} from "../utils/ruleUtils";
import {getNewValueForFieldOp} from "../utils/validation";
import { isImmutable, isImmutableList } from "./stuff";
import { jsToImmutable } from "../import";


export const getDefaultField = (config, canGetFirst = true, parentRuleGroupPath = null) => {
  const {defaultField} = config.settings;
  let f = (!parentRuleGroupPath ? defaultField : getDefaultSubField(config, parentRuleGroupPath))
    || canGetFirst && getFirstField(config, parentRuleGroupPath)
    || null;
  // if default LHS is func, convert to Immutable
  if (f != null && typeof f !== "string" && !isImmutable(f)) {
    f = jsToImmutable(f);
  }
  return f;
};

export const getDefaultSubField = (config, parentRuleGroupPath = null) => {
  if (!parentRuleGroupPath)
    return null;
  const fieldSeparator = config?.settings?.fieldSeparator || ".";
  const parentRuleGroupConfig = getFieldConfig(config, parentRuleGroupPath);
  let f = parentRuleGroupConfig?.defaultField;
  if (f) {
    f = [...getFieldParts(parentRuleGroupPath), f].join(fieldSeparator);
  }
  return f;
};

export const getDefaultFieldSrc = (config, canGetFirst = true) => {
  return canGetFirst && config.settings.fieldSources?.[0] || "field";
};

export const getDefaultOperator = (config, field, canGetFirst = true) => {
  const fieldConfig = getFieldConfig(config, field);
  const fieldOperators = fieldConfig?.operators || [];
  let {defaultOperator: globalDefaultOperator} = config.settings;
  if (globalDefaultOperator && !fieldOperators.includes(globalDefaultOperator))
    globalDefaultOperator = null;
  const fieldDefaultOperator = fieldConfig?.defaultOperator;
  const fieldOwnDefaultOperator = fieldConfig?.ownDefaultOperator;
  const firstOperator = canGetFirst ? getFirstOperator(config, field) : null;
  const op = fieldOwnDefaultOperator || globalDefaultOperator || fieldDefaultOperator || firstOperator;
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

export const defaultRuleProperties = (config, parentRuleGroupPath = null, item = null, canUseDefaultFieldAndOp = true, canGetFirst = false) => {
  let field = null, operator = null, fieldSrc = null;
  const {showErrorMessage} = config.settings;
  if (item) {
    fieldSrc = item?.properties?.fieldSrc;
    field = item?.properties?.field;
    operator = item?.properties?.operator;
  } else if (canUseDefaultFieldAndOp) {
    field = getDefaultField(config, canGetFirst, parentRuleGroupPath);
    if (field) {
      fieldSrc = isImmutable(field) ? "func" : "field";
    } else {
      fieldSrc = getDefaultFieldSrc(config);
    }
    operator = getDefaultOperator(config, field, true);
  } else {
    fieldSrc = getDefaultFieldSrc(config);
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
    const canFix = false;
    let {newValue, newValueSrc, newValueType, newValueError, newFieldError} = getNewValueForFieldOp(
      config, config, current, field, operator, "operator", canFix
    );
    current = current
      .set("value", newValue)
      .set("valueSrc", newValueSrc)
      .set("valueType", newValueType);
    if (showErrorMessage) {
      current = current
        .set("valueError", newValueError)
        .set("fieldError", newFieldError);
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

export const defaultRoot = (config, canAddDefaultRule = true) => {
  return new Immutable.Map({
    type: "group",
    id: uuid(),
    children1: new Immutable.OrderedMap(canAddDefaultRule ? { ...defaultRule(uuid(), config) } : {}),
    properties: defaultGroupProperties(config)
  });
};

export const createListWithOneElement = (el) => {
  if (isImmutableList(el))
    return el; // already Immutable list
  return createListFromArray([el]);
};

export const createListFromArray = (arr) => {
  if (isImmutableList(arr))
    return arr; // already Immutable list
  return new Immutable.List(arr);
};

export const emptyProperties = () => new Immutable.Map();
