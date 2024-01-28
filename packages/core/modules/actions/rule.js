import * as constants from "../stores/constants";
import {toImmutableList} from "../utils/stuff";

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {string} field
 */
export const setField = (config, path, field, asyncListValues, _meta) => ({
  type: constants.SET_FIELD,
  path: toImmutableList(path),
  field,
  config,
  asyncListValues,
  _meta,
});

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {*} srcKey
 */
export const setFieldSrc = (config, path, srcKey) => ({
  type: constants.SET_FIELD_SRC,
  path: toImmutableList(path),
  srcKey: srcKey,
  config: config,
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
 */
export const setValue = (config, path, delta, value, valueType, asyncListValues, _meta) => ({
  type: constants.SET_VALUE,
  path: toImmutableList(path),
  delta,
  value,
  valueType,
  asyncListValues,
  config,
  _meta,
});

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {integer} delta
 * @param {*} srcKey
 */
export const setValueSrc = (config, path, delta, srcKey, _meta) => ({
  type: constants.SET_VALUE_SRC,
  path: toImmutableList(path),
  delta,
  srcKey,
  config,
  _meta,
});

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {integer} delta
 * @param {Array} parentFuncs
 * @param {string | null} argKey
 * @param {*} value
 * @param {string | "!valueSrc"} valueType
 * @param {*} asyncListValues
 */
export const setFuncValue = (config, path, delta, parentFuncs, argKey, value, valueType, asyncListValues, _meta) => ({
  type: constants.SET_FUNC_VALUE,
  path: toImmutableList(path),
  delta,
  parentFuncs,
  argKey,
  value,
  valueType,
  asyncListValues,
  config,
  _meta,
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
