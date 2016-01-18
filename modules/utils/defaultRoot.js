import Immutable from 'immutable';
import uuid from './uuid';
import defaultRuleProperties from './defaultRuleProperties';
import defaultGroupProperties from './defaultGroupProperties';

export const getChild = (id, config) => ({
  [id]: new Immutable.Map({
    type: 'rule',
    id: id,
    properties: defaultRuleProperties(config)
  })
});

export default (config) => new Immutable.Map({
  type: 'group',
  id: uuid(),
  children1: new Immutable.OrderedMap({ ...getChild(uuid(), config), ...getChild(uuid(), config) }),
  properties: defaultGroupProperties(config)
});
