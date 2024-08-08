import Immutable from "immutable";
import uuid from "./uuid";
import {getNewValueForFieldOp} from "./getNewValueForFieldOp";
import { isImmutable } from "./stuff";
import { defaultOperatorOptions, defaultGroupProperties, getDefaultField, getDefaultFieldSrc, getDefaultOperator } from "./defaultUtils";
import {validateValue, validateRange} from "./validation";

export * from "./defaultUtils";



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
      { validateValue, validateRange },
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
