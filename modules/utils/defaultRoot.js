import Immutable from 'immutable';
import uuid from './uuid';
import defaultRuleProperties from './defaultRuleProperties';
import defaultGroupProperties from './defaultGroupProperties';

const getChild = (id, config) => ({
  [id]: new Immutable.Map({
    type: 'rule',
    id: id,
    properties: new Immutable.Map(defaultRuleProperties(config))
  })
});

export default (config) => new Immutable.Map({
  type: 'group',
  id: uuid(),
  children: new Immutable.OrderedMap(getChild(uuid(), config)),
  properties: new Immutable.Map(defaultGroupProperties(config))
});
