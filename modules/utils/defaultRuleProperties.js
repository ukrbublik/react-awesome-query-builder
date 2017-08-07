import Immutable from 'immutable';
import map from 'lodash/map';
import range from 'lodash/range';
import {getFieldConfig, getFirstField, getFirstOperator} from './configUtils';

export const defaultField = (config, canGetFirst = true) => {
  return typeof config.settings.defaultField === 'function' ?
    config.settings.defaultField() : (config.settings.defaultField || (canGetFirst ? getFirstField(config) : null));
};

export const defaultOperator = (config, field, canGetFirst = true) => {
  let fieldConfig = getFieldConfig(field, config);
  let fieldDefaultOperator = fieldConfig.defaultOperator || (canGetFirst ? getFirstOperator(config, field) : null);
  let op = typeof config.settings.defaultOperator === 'function' ?
    config.settings.defaultOperator(field, fieldConfig) : fieldDefaultOperator;
  return op;
};

//used for complex operators like proximity
export const defaultOperatorOptions = (config, operator, field) => {
  if (!operator)
    return new Immutable.Map();
  return new Immutable.Map(
    config.operators[operator].options &&
    config.operators[operator].options.defaults || {}
  );
};

export default (config) => {
  let field = null, operator = null;
  if (config.settings.setDefaultFieldAndOp) {
    field = defaultField(config);
    operator = defaultOperator(config, field);
  }

  return new Immutable.Map({
    field: field,
    operator: operator,
    value: new Immutable.List(),
    //used for complex operators like proximity
    operatorOptions: defaultOperatorOptions(config, operator, field),
  });
};
