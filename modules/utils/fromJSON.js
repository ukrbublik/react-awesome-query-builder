import { Map, List, OrderedMap } from 'immutable';
import { get, map, isArray, isString, each, isEmpty } from 'lodash';
import uuid from './uuid';

export default function fromJSON(data, config, options = {}) {
  const json = isString(data) ? JSON.parse(data) : (data || {});
  if (options.type === 'rule') {
    const { id = uuid(), field, operator, values, operatorOptions = null } = json;
    const path = (options.path || new List()).concat(id);
    return new Map({
      type: 'rule',
      id,
      properties: new Map({
        field,
        operator,
        value: new List(map(values, 'value')),
        valueSrc: new List(map(values, () => 'value')),
        operatorOptions,
        valueType: new List(map(values, 'type'))
      }),
      path
    });
  }

  const { id = uuid(), rules, condition, not } = json;
  const path = (options.path || new List()).concat(id);
  return new Map({
    type: 'group',
    id,
    children1: (() => {
      if (!isEmpty(rules)) {
        let item = new OrderedMap();
        each(rules, rule => {
          item = item.set(get(rule, 'id', uuid()), fromJSON(rule, config, {
            type: isArray(rule.rules) ? 'group' : 'rule',
            // type: 'rule',
            path
          }));
        });
        return item;
      }
      return undefined;
    })(),
    properties: new Map({
      conjunction: condition,
      not
    }),
    path
  });
}
