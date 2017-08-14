import Immutable from 'immutable';
import map from 'lodash/map';
import range from 'lodash/range';
import uuid from './uuid';
import {getFieldConfig, getFirstField, getFirstOperator, getOperatorConfig} from './configUtils';


export const defaultField = (config, canGetFirst = true) => {
  return typeof config.settings.defaultField === 'function' ?
    config.settings.defaultField() : (config.settings.defaultField || (canGetFirst ? getFirstField(config) : null));
};

export const defaultOperator = (config, field, canGetFirst = true) => {
  let fieldConfig = getFieldConfig(field, config);
  let fieldDefaultOperator = fieldConfig && fieldConfig.defaultOperator || (canGetFirst ? getFirstOperator(config, field) : null);
  let op = typeof config.settings.defaultOperator === 'function' ?
    config.settings.defaultOperator(field, fieldConfig) : fieldDefaultOperator;
  return op;
};

//used for complex operators like proximity
export const defaultOperatorOptions = (config, operator, field) => {
  let operatorConfig = operator ? getOperatorConfig(config, operator, field) : null;
  if (!operatorConfig)
    return null; //new Immutable.Map();
  return operatorConfig.options ? new Immutable.Map(
    operatorConfig.options &&
    operatorConfig.options.defaults || {}
  ) : null;
};

export const defaultRuleProperties = (config) => {
  let field = null, operator = null;
  if (config.settings.setDefaultFieldAndOp) {
    field = defaultField(config);
    operator = defaultOperator(config, field);
  }

  return new Immutable.Map({
    field: field,
    operator: operator,
    value: new Immutable.List(),
    valueSrc: new Immutable.List(),
    //used for complex operators like proximity
    operatorOptions: defaultOperatorOptions(config, operator, field),
  });
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
    type: 'rule',
    id: id,
    properties: defaultRuleProperties(config)
  })
});

export const defaultRoot = (config) => {
  if (config.tree) {
    return new Immutable.Map(config.tree);
  }
  
  return new Immutable.Map({
    type: 'group',
    id: uuid(),
    children1: new Immutable.OrderedMap({ ...getChild(uuid(), config) }),
    properties: defaultGroupProperties(config)
  });
}
