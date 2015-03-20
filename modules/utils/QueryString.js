const getQueryStringRecursive = function (item, config) {
  let type = item.get('type');
  let properties = item.get('properties');
  let children = item.get('children');

  if (type == 'rule') {
    if (!properties.has('field') || !properties.has('operator')) {
      return undefined;
    }

    let value = properties.get('value');
    let field = config.fields[properties.get('field')];
    let operator = config.operators[properties.get('operator')];
    let options = properties.get('options');

    if ((operator.cardinality || 1) !== 0) {
      let widget = config.widgets[field.widget];

      value = value.map(function (value, key) {
        return widget.value(value, config);
      });
    }

    return operator.value(value, field, options, operator, config);
  }

  if (type == 'group' && children && children.size) {
    let values = children.map((item, key) => getQueryStringRecursive(item, config));
    values = values.filter(value => typeof value !== 'undefined');

    let conjunction = properties.get('conjunction');
    conjunction = config.conjunctions[conjunction];
    return conjunction.value(values, conjunction);
  }

  return undefined;
};

export default function (item, config) {
  return getQueryStringRecursive(item, config);
};
