'use strict';
import Immutable from 'immutable';
import uuid from "./uuid";
import isArray from 'lodash/isArray'
import {defaultValue} from "./index";
import {getFieldConfig, getWidgetForFieldOp, getOperatorConfig, getFieldWidgetConfig, getFieldPath, getFieldPathLabels} from './configUtils';
import omit from 'lodash/omit';
import pick from 'lodash/pick';

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
        const conjunctionDefinition = config.conjunctions[conjunction];

        const list = children
            .map((currentChild) => {
                return queryBuilderFormat(currentChild, config)
            })
            .filter((currentChild) => typeof currentChild !== 'undefined')
        if (!list.size)
            return undefined;
        resultQuery['rules'] = list.toList();
        resultQuery['condition'] = conjunction.toUpperCase();

        return resultQuery;
    } else if (type === 'rule') {
        const field = properties.get('field');
        const operator = properties.get('operator');
        const options = properties.get('operatorOptions');
        let value = properties.get('value');
        if (field == null || operator == null)
            return undefined;

        const fieldDefinition = getFieldConfig(field, config) || {};
        const operatorDefinition = getOperatorConfig(config, operator, field) || {};
        //const reversedOp = operatorDefinition.reversedOp;
        //const revOperatorDefinition = getOperatorConfig(config, reversedOp, field) || {};
        const fieldType = fieldDefinition.type || "undefined";
        const cardinality = operatorDefinition.cardinality || 1;
        const widget = getWidgetForFieldOp(config, field, operator);
        const fieldWidgetDefinition = omit(getFieldWidgetConfig(config, field, operator, widget), ['factory']);
        const typeConfig = config.types[fieldDefinition.type] || {};

        if (value.size < cardinality)
            return undefined;
        value = cardinality == 1 ? value.first() : value.toArray();
        
        var ruleQuery = {
            id,
            field,
            operator,
            value,
            type: fieldType,
            input: Object.keys(typeConfig.widgets)[0],
        };
        return ruleQuery
    }
    return undefined;
};

//untested!
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

