import Immutable from 'immutable';
import uuid from './uuid';

export default () => Immutable.Map({
  type: 'group',
  id: uuid(),
  children: new Immutable.OrderedMap(getChild(uuid())),
  properties: Immutable.Map({
    conjunction: 'and'
  })
});

const getChild = (uuid) => ({
  [uuid]: Immutable.Map({
    type: 'rule',
    id: uuid,
    properties: Immutable.Map({
      value: Immutable.List(),
      options: Immutable.Map()
    })
  })
});
