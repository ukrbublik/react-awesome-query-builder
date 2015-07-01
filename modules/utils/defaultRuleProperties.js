import Immutable from 'immutable';

export default (config) => ({
  value: new Immutable.List(),
  operatorOptions: new Immutable.Map(),
  valueOptions: new Immutable.Map()
});
