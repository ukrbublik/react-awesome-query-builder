const queryStringRecursive = (item, config) => {
  const type = item.get('type');
  const properties = item.get('properties');
  const children = item.get('children');

  if (type === 'rule') {
    if (!properties.has('field') || !properties.has('operator')) {
      return undefined;
    }

    const field = properties.get('field');
    const operator = properties.get('operator');

    const fieldDefinition = config.fields[field];
    const operatorDefinition = config.operators[operator];

    const options = properties.get('operatorOptions');
    const valueOptions = properties.get('valueOptions');
    const cardinality = operatorDefinition.cardinality || 1;
    const widget = config.widgets[fieldDefinition.widget];
    const value = properties.get('value').map((currentValue) => widget.value(currentValue, config));

    if (value.size < cardinality) {
      return undefined;
    }

    return operatorDefinition.value(value, field, options, valueOptions, operator, config);
  }

  if (type === 'group' && children && children.size) {
    const value = children
      .map((currentChild) => queryStringRecursive(currentChild, config))
      .filter((currentChild) => typeof currentChild !== 'undefined');

    if (!value.size) {
      return undefined;
    }

    const conjunction = properties.get('conjunction');
    const conjunctionDefinition = config.conjunctions[conjunction];
    return conjunctionDefinition.value(value, conjunction);
  }

  return undefined;
};

export default queryStringRecursive;
