import mapValues from 'lodash/object/mapValues';
import { bindActionCreators } from 'redux';

export default (actions, config, dispatch) =>
  bindActionCreators(mapValues(actions, (action) => (...args) => action(config, ...args)), dispatch);