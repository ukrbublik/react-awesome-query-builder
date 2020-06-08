import * as constants from "../constants";

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {string} conjunction
 */
export const setConjunction = (config, path, conjunction) => ({
  type: constants.SET_CONJUNCTION,
  path: path,
  conjunction: conjunction
});

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {bool} not
 */
export const setNot = (config, path, not) => ({
  type: constants.SET_NOT,
  path: path,
  not: not
});