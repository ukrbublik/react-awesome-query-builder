import * as constants from '../constants';

/**
 * @param {Immutable.List} path
 * @param {string} field
 */
export const setField = (path, field) => ({
  type: constants.SET_FIELD,
  path: path,
  field: field
});

/**
 * @param {Immutable.List} path
 * @param {string} operator
 */
export const setOperator = (path, operator) => ({
  type: constants.SET_OPERATOR,
  path: path,
  operator: operator
});

/**
 * @param {Immutable.List} path
 * @param {integer} delta
 * @param {*} value
 */
export const setValue = (path, delta, value) => ({
  type: constants.SET_VALUE,
  path: path,
  delta: delta,
  value: value
});

/**
 * @param {Immutable.List} path
 * @param {string} name
 * @param {*} value
 */
export const setOperatorOption = (path, name, value) => ({
  type: constants.SET_OPERATOR_OPTION,
  path: path,
  name: name,
  value: value
});

/**
 * @param {Immutable.List} path
 * @param {integer} delta
 * @param {string} name
 * @param {*} value
 */
export const setValueOption = (path, delta, name, value) => ({
  type: constants.SET_VALUE_OPTION,
  path: path,
  delta: delta,
  name: name,
  value: value
});
