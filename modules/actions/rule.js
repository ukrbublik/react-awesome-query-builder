import * as constants from '../constants';

/**
 * @param {Immutable.List} path
 * @param {string} field
 */
export const setField = (path, field, config) => ({
  type: constants.SET_FIELD,
  path: path,
  field: field,
  config: config
});

/**
 * @param {Immutable.List} path
 * @param {string} operator
 */
export const setOperator = (path, operator, config) => ({
  type: constants.SET_OPERATOR,
  path: path,
  operator: operator,
  config: config
});

/**
 * @param {Immutable.List} path
 * @param {integer} delta
 * @param {*} value
 */
export const setValue = (path, delta, value, config) => ({
  type: constants.SET_VALUE,
  path: path,
  delta: delta,
  value: value,
  config: config
});

/**
 * @param {Immutable.List} path
 * @param {string} name
 * @param {*} value
 */
export const setOperatorOption = (path, name, value, config) => ({
  type: constants.SET_OPERATOR_OPTION,
  path: path,
  name: name,
  value: value,
  config: config
});

/**
 * @param {Immutable.List} path
 * @param {integer} delta
 * @param {string} name
 * @param {*} value
 */
export const setValueOption = (path, delta, name, value, config) => ({
  type: constants.SET_VALUE_OPTION,
  path: path,
  delta: delta,
  name: name,
  value: value,
  config: config
});
