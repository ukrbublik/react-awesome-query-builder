import Immutable from 'immutable';
import map from 'lodash/collection/map';
import range from 'lodash/utility/range';

export const defaultField = (config) =>
  typeof config.settings.defaultField === 'function' ?
    config.settings.defaultField(config) : (config.settings.defaultField || Object.keys(config.fields)[0]);

export const defaultOperator = (config, field) =>
  typeof config.settings.defaultOperator === 'function' ?
    config.settings.defaultOperator(field, config) : (config.settings.defaultOperator || config.fields[field].operators[0]);

export const defaultOperatorOptions = (config, operator) => new Immutable.Map(
  config.operators[operator].options &&
  config.operators[operator].options.defaults || {}
);

export const defaultValueOptions = (config, operator) => new Immutable.List(
  map(range(0, config.operators[operator].cardinality), () => new Immutable.Map(
    config.operators[operator].valueOptions &&
    config.operators[operator].valueOptions.defaults || {}
  ))
);

export default (config) => {
  const field = defaultField(config, field);
  const operator = defaultOperator(config, field);

  return new Immutable.Map({
    field: field,
    operator: operator,
    value: new Immutable.List(),
    operatorOptions: defaultOperatorOptions(config, operator),
    valueOptions: defaultValueOptions(config, operator)
  });
};
