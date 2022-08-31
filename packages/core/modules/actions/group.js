import * as constants from "../constants";
import {toImmutableList} from "../utils/stuff";

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {string} conjunction
 */
export const setConjunction = (config, path, conjunction) => ({
  type: constants.SET_CONJUNCTION,
  path: toImmutableList(path),
  conjunction: conjunction
});

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {bool} not
 */
export const setNot = (config, path, not) => ({
  type: constants.SET_NOT,
  path: toImmutableList(path),
  not: not
});

/**
 * @param {object} config
 * @param {Immutable.List} path
 * @param {bool} lock
 */
export const setLock = (config, path, lock) => ({
  type: constants.SET_LOCK,
  path: toImmutableList(path),
  lock: lock
});