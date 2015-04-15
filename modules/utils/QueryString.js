const queryStringRecursive = function (item, config) {
  let type = item.get('type');
  let properties = item.get('properties');
  let children = item.get('children');

  if (type == 'rule') {
    if (!properties.has('field') || !properties.has('operator')) {
      return undefined;
    }

    let value = [];
    let field = config.fields[properties.get('field')];
    let operator = config.operators[properties.get('operator')];
    let options = properties.get('options');
    let cardinality = operator.cardinality || 1;

    if (cardinality !== 0) {
      let widget = config.widgets[field.widget];

      value = properties.get('value').map(function (value) {
        return widget.value(value, config);
      }).filter(
        value => typeof value !== 'undefined' && value !== ''
      ).toArray();

      if (value.length < cardinality) {
        return undefined;
      }
    }

    return operator.value(value, field, options, operator, config);
  }

  if (type == 'group' && children && children.size) {
    let value = children.map(item => queryStringRecursive(item, config));
    value = value.filter(value => typeof value !== 'undefined');

    if (!value.size) {
      return undefined;
    }

    let conjunction = properties.get('conjunction');
    conjunction = config.conjunctions[conjunction];
    return conjunction.value(value.toArray(), conjunction);
  }

  return undefined;
};

export default function (item, config) {
  return queryStringRecursive(item, config);
};
