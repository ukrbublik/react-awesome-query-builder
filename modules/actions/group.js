import * as constants from '../constants';

/**
 * @param {Immutable.List} path
 * @param {string} conjunction
 */
export const setConjunction = (path, conjunction) => ({
  type: constants.SET_CONJUNCTION,
  path: path,
  conjunction: conjunction
});
