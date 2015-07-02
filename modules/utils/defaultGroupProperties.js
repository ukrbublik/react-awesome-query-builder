import Immutable from 'immutable';

export const defaultConjunction = (config) =>
  config.settings.defaultConjunction || Object.keys(config.conjunctions)[0];

export default (config) => new Immutable.Map({
  conjunction: defaultConjunction(config)
});
