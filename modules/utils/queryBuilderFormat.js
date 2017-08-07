'use strict';
import Immutable from 'immutable';
import uuid from "./uuid";
import isArray from 'lodash/isArray'
import {defaultValue} from "./index";
import {getFieldConfig, getWidgetForFieldOp, getOperatorConfig, getFieldWidgetConfig} from './configUtils';

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
export const queryBuilderFormat = (item, config) => {

    const type = item.get('type');
    const properties = item.get('properties');
    const children = item.get('children1');
    const id = item.get('id')

    var resultQuery = {}

    if (type === 'group' && children && children.size) {
        const conjunction = properties.get('conjunction');
        // const conjunctionDefinition = config.conjunctions[conjunction];
        resultQuery['condition'] = conjunction.toUpperCase();

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
        const field = properties.get('field');
        const operator = properties.get('operator');
        const options = properties.get('operatorOptions');

        const fieldDefinition = getFieldConfig(field, config) || {};
        const operatorDefinition = getOperatorConfig(config, operator, field) || {};

        const fieldType = fieldDefinition.type || "undefined";
        const cardinality = defaultValue(operatorDefinition.cardinality, 1);
        const widget = getWidgetForFieldOp(config, field, operator);
        const widgetDefinition = getFieldWidgetConfig(config, field, operator, widget);

        var value = properties.get('value').map((currentValue) =>
            // Widgets can optionally define a value extraction function. This is useful in cases
            // where an advanced widget is made up of multiple input fields that need to be composed
            // when building the query string.
            typeof widgetDefinition.formatValue === 'function' ? widgetDefinition.formatValue(currentValue, config) : currentValue
        );

        if (value.size < cardinality) {
            return undefined;
        }
        if (cardinality == 1) {

        }

        var ruleQuery = {
            id,
            field,
            operator,
            value,
            type: fieldType,
            input: fieldDefinition.widget,
        };
        return ruleQuery
    }
    return undefined;
};

export const queryBuilderToTree = (ruleset) => {
    const condition = ruleset.condition;
    var tree = {}
    tree.id = uuid()
    if (condition) {
        tree.type = 'group';
        var childrens = new Immutable.List(ruleset.rules)
            .map(queryBuilderToTree)
        childrens = childrens.reduce((result, item) => {
            return result.set(item.get('id'), item)
        }, new Immutable.OrderedMap())
        tree.children1 = childrens;
        tree.properties = new Immutable.Map({conjunction: condition, id: uuid()})
    } else {
        const {id, field, input, type, value, operator} = ruleset;
        var list_value = value;
        if (isArray(value)) {
            list_value = new Immutable.List(value)
        } else {
            list_value = new Immutable.List([value])
        }
        var properties = new Immutable.Map({
            type,
            operator,
            field: field || id,
            widget: input || type,
            value: list_value,
        })
        tree.properties = properties;
        tree.type = 'rule'
    }
    return new Immutable.Map(tree)

}

