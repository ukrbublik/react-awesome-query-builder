import Immutable from "immutable";
import {getFieldConfig, getFieldParts, getFirstField, getOperatorConfig, getFirstOperator} from "./configUtils";
import { isImmutable, isImmutableList } from "./stuff";
import { jsToImmutable } from "./treeUtils";


export const defaultConjunction = (config) =>
  config.settings.defaultConjunction || Object.keys(config.conjunctions)[0];

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

export const defaultGroupConjunction = (config, fieldConfig = null) => {
  fieldConfig = getFieldConfig(config, fieldConfig); // if `fieldConfig` is field name, not config
  const conjs = fieldConfig && fieldConfig.conjunctions || Object.keys(config.conjunctions);
  if (conjs.length == 1)
    return conjs[0];
  return config.settings.defaultGroupConjunction || config.settings.defaultConjunction || conjs[0];
};

export const defaultGroupProperties = (config, fieldConfig = null) => new Immutable.Map({
  conjunction: defaultGroupConjunction(config, fieldConfig),
  not: false
});

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

