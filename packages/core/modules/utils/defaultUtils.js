import Immutable from "immutable";
import uuid from "./uuid";
import {getFieldConfig, getOperatorConfig, getFieldParts, getFirstField} from "./configUtils";
import {getFirstOperator} from "../utils/ruleUtils";
import {getNewValueForFieldOp} from "../utils/validation";
import { isImmutable, isImmutableList } from "./stuff";
import { jsToImmutable } from "../import";


export const getDefaultField = (config, canGetFirst = true, parentRuleGroupField = null) => {
  const {defaultField} = config.settings;
  let f = (!parentRuleGroupField ? defaultField : getDefaultSubField(config, parentRuleGroupField))
    || canGetFirst && getFirstField(config, parentRuleGroupField)
    || null;
  // if default LHS is func, convert to Immutable
  if (f != null && typeof f !== "string" && !isImmutable(f)) {
    f = jsToImmutable(f);
  }
  return f;
};

export const getDefaultSubField = (config, parentRuleGroupField = null) => {
  if (!parentRuleGroupField)
    return null;
  const fieldSeparator = config?.settings?.fieldSeparator || ".";
  const parentRuleGroupConfig = getFieldConfig(config, parentRuleGroupField);
  let f = parentRuleGroupConfig?.defaultField;
  if (f) {
    f = [...getFieldParts(parentRuleGroupField), f].join(fieldSeparator);
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

export const defaultRuleProperties = (config, parentRuleGroupField = null, item = null, canUseDefaultFieldAndOp = true, canGetFirst = false) => {
  let field = null, operator = null, fieldSrc = null;
  const {showErrorMessage} = config.settings;
  if (item) {
    fieldSrc = item?.properties?.fieldSrc;
    field = item?.properties?.field;
    operator = item?.properties?.operator;
  } else if (canUseDefaultFieldAndOp) {
    field = getDefaultField(config, canGetFirst, parentRuleGroupField);
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

  const fieldConfig = getFieldConfig(config, field);
  if (fieldConfig?.type === "!group") {
    const conjunction = defaultGroupConjunction(config, fieldConfig);
    current = current.set("conjunction", conjunction);
  }

  return current; 
};


export const defaultGroupConjunction = (config, groupFieldConfig = null) => {
  groupFieldConfig = getFieldConfig(config, groupFieldConfig); // if `groupFieldConfig` is field name, not config
  const conjs = groupFieldConfig?.conjunctions || Object.keys(config.conjunctions);
  if (conjs.length == 1)
    return conjs[0];
  // todo: config.settings.defaultGroupConjunction is deprecated, defaultConjunction should be used instead
  return groupFieldConfig?.defaultConjunction || config.settings.defaultConjunction || config.settings.defaultGroupConjunction || conjs[0];
};

// @deprecated Use defaultGroupConjunction
export const defaultConjunction = (config) => defaultGroupConjunction(config);

export const defaultGroupProperties = (config, groupFieldConfig = null) => {
  return new Immutable.Map({
    conjunction: defaultGroupConjunction(config, groupFieldConfig),
    not: false
  });
};

export const defaultItemProperties = (config, item) => {
  return item?.type == "group" 
    ? defaultGroupProperties(config) 
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
