import { Map, OrderedMap } from 'immutable';
import { get, map, isArray, isString, each, isEmpty } from 'lodash';
import uuid from './uuid';

export default function fromJSON(data, config, options = {}) {
  const json = isString(data) ? JSON.parse(data) : (data || {});
  console.log(json, 'json');
  if (options.type === 'rule') {
    const { id = uuid(), field, operator, values, operatorOptions = null } = json;
    const path = (options.path || []).concat(id);
    return new Map({
      type: 'rule',
      id,
      properties: {
        field,
        operator,
        value: map(values, 'value'),
        valueSrc: map(values, () => 'value'),
        operatorOptions,
        valueType: map(values, 'type')
      },
      path
    });
  }

  const { id = uuid(), rules, condition, not } = json;
  const path = (options.path || []).concat(id);
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
    properties: {
      conjunction: condition,
      not
    },
    path
  });
}
