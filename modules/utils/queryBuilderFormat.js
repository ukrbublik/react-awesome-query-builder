'use strict';
/*
 Build tree to http://querybuilder.js.org/ like format

 Example:
 {
 "condition": "AND",
 "rules": [
 {
 "id": "price",
 "field": "price",
 "type": "double",
 "input": "text",
 "operator": "less",
 "value": "10.25"
 },
 {
 "condition": "OR",
 "rules": [
 {
 "id": "category",
 "field": "category",
 "type": "integer",
 "input": "select",
 "operator": "equal",
 "value": "2"
 },
 {
 "id": "category",
 "field": "category",
 "type": "integer",
 "input": "select",
 "operator": "equal",
 "value": "1"
 }
 ]}
 ]
 }
 */
const queryBuilderFormat = (item, config) => {

    const type = item.get('type');
    const properties = item.get('properties');
    const children = item.get('children1');

    var resultQuery = {}

    if (type === 'group' && children && children.size) {
        const conjunction = properties.get('conjunction');
        // const conjunctionDefinition = config.conjunctions[conjunction];
        resultQuery['condition'] = conjunction.toUpperCase()

        const value = children
            .map((currentChild) => {
                return queryBuilderFormat(currentChild, config)
            })
            .filter((currentChild) => typeof currentChild !== 'undefined')

        if (!value.size) {
            return undefined;
        }
        resultQuery['rules'] = value.toList();
        return resultQuery;
    }

    if (type === 'rule') {

        if (typeof properties.get('field') === 'undefined' || typeof properties.get('operator') === 'undefined') {
            return undefined;
        }

        const id = properties.get('id');
        const field = properties.get('field');
        const operator = properties.get('operator');


        const fieldDefinition = config.fields[field];
        const operatorDefinition = config.operators[operator];

        const options = properties.get('operatorOptions');
        const valueOptions = properties.get('valueOptions');

        const cardinality = operatorDefinition.cardinality || 1;
        const widget = config.widgets[fieldDefinition.widget];

        var value = properties.get('value').map((currentValue) =>
            // Widgets can optionally define a value extraction function. This is useful in cases
            // where an advanced widget is made up of multiple input fields that need to be composed
            // when building the query string.
            typeof widget.value === 'function' ? widget.value(currentValue, config) : currentValue
        );

        if (value.size < cardinality) {
            return undefined;
        }
        if (cardinality == 1) {

        }

        var ruleQuery = {id, field, operator, value};
        return ruleQuery


    }
    return undefined;


};
export default queryBuilderFormat;