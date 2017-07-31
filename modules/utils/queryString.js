import {getFieldConfig} from './configUtils';

const queryStringRecursive = (item, config) => {
    const type = item.get('type');
    const properties = item.get('properties');
    const children = item.get('children1');

    if (type === 'rule') {
        if (typeof properties.get('field') === 'undefined' || typeof properties.get('operator') === 'undefined') {
            return undefined;
        }

        const field = properties.get('field');
        const operator = properties.get('operator');

        const fieldDefinition = getFieldConfig(field, config);
        const operatorDefinition = config.operators[operator];

        const options = properties.get('operatorOptions');
        const valueOptions = properties.get('valueOptions');
        const cardinality = operatorDefinition.cardinality || 1;
        const widget = config.widgets[fieldDefinition.widget];
        const value = properties.get('value').map((currentValue) =>
            // Widgets can optionally define a value extraction function. This is useful in cases
            // where an advanced widget is made up of multiple input fields that need to be composed
            // when building the query string.
            typeof widget.value === 'function' ? widget.value(currentValue, config) : currentValue
        );

        if (value.size < cardinality) {
            return undefined;
        }

        RegExp.quote = function (str) {
            return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        };

        return operatorDefinition.value(value, 
            fieldDefinition.label.replace(new RegExp(RegExp.quote(config.settings.fieldSeparator), 'g'), config.settings.fieldSeparatorDisplay), 
            options, valueOptions, operator, config, fieldDefinition);
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

