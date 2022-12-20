import * as constants from "../stores/constants";
import {toImmutableList} from "../utils/stuff";

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {string} field
 */
export const setField = (config, path, field) => ({
  type: constants.SET_FIELD,
  path: toImmutableList(path),
  field: field,
  config: config
});

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {string} operator
 */
export const setOperator = (config, path, operator) => ({
  type: constants.SET_OPERATOR,
  path: toImmutableList(path),
  operator: operator,
  config: config
});

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {integer} delta
 * @param {*} value
 * @param {string} valueType
 * @param {*} asyncListValues
 * @param {boolean} __isInternal
 */
export const setValue = (config, path, delta, value, valueType, asyncListValues, __isInternal) => ({
  type: constants.SET_VALUE,
  path: toImmutableList(path),
  delta: delta,
  value: value,
  valueType: valueType,
  asyncListValues: asyncListValues,
  config: config,
  __isInternal: __isInternal
});

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {integer} delta
 * @param {*} srcKey
 */
export const setValueSrc = (config, path, delta, srcKey) => ({
  type: constants.SET_VALUE_SRC,
  path: toImmutableList(path),
  delta: delta,
  srcKey: srcKey,
  config: config
});

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {string} name
 * @param {*} value
 */
export const setOperatorOption = (config, path, name, value) => ({
  type: constants.SET_OPERATOR_OPTION,
  path: toImmutableList(path),
  name: name,
  value: value,
  config: config
});
