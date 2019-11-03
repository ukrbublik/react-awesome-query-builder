'use strict';
import Immutable from 'immutable';
import uuid from "./uuid";
import isArray from 'lodash/isArray'
import {defaultValue} from "./stuff";
import {
    getFieldConfig, getWidgetForFieldOp, getValueSourcesForFieldOp, getOperatorConfig, getFieldWidgetConfig, 
    getFieldPath, getFieldPathLabels, fieldWidgetDefinition
} from './configUtils';
import omit from 'lodash/omit';
import pick from 'lodash/pick';

export const mongodbFormat = (item, config, _not = false) => {
    const type = item.get('type');
    const properties = item.get('properties');
    const children = item.get('children1');
    const id = item.get('id')

    if (type === 'group' && children && children.size) {
        let resultQuery = {};
        let conjunction = properties.get('conjunction');
        let conjunctionDefinition = config.conjunctions[conjunction];
        const not = _not ? !(properties.get('not')) : (properties.get('not'));
        if (not) {
            conjunction = conjunctionDefinition.reversedConj;
            conjunctionDefinition = config.conjunctions[conjunction];
        }
        const mongoConj = conjunctionDefinition.mongoConj;

        const list = children
            .map((currentChild) => {
                return mongodbFormat(currentChild, config, not)
            })
            .filter((currentChild) => typeof currentChild !== 'undefined')
        if (!list.size)
            return undefined;

        if (list.size == 1) {
            resultQuery = list.first();
        } else {
            resultQuery[mongoConj] = list.toList();
        }

        return resultQuery;
    } else if (type === 'rule') {
        let operator = properties.get('operator');
        let operatorOptions = properties.get('operatorOptions');
        let field = properties.get('field');
        let value = properties.get('value');

        if (field == null || operator == null)
            return undefined;

        const fieldDefinition = getFieldConfig(field, config) || {};
        let operatorDefinition = getOperatorConfig(config, operator, field) || {};
        let reversedOp = operatorDefinition.reversedOp;
        let revOperatorDefinition = getOperatorConfig(config, reversedOp, field) || {};
        const cardinality = defaultValue(operatorDefinition.cardinality, 1);
        const typeConfig = config.types[fieldDefinition.type] || {};

        if (_not) {
            [operator, reversedOp] = [reversedOp, operator];
            [operatorDefinition, revOperatorDefinition] = [revOperatorDefinition, operatorDefinition];
        }

        //format field
        if (fieldDefinition.tableName) {
          const regex = new RegExp(field.split(config.settings.fieldSeparator)[0])
          field = field.replace(regex, fieldDefinition.tableName)
        }

        //format value
        let valueSrcs = [];
        let valueTypes = [];
        let hasUndefinedValues = false;
        value = value.map((currentValue, ind) => {
            if (currentValue === undefined) {
                hasUndefinedValues = true;
                return undefined;
            }
            const valueSrc = properties.get('valueSrc') ? properties.get('valueSrc').get(ind) : null;
            const valueType = properties.get('valueType') ? properties.get('valueType').get(ind) : null;
            const widget = getWidgetForFieldOp(config, field, operator, valueSrc);
            const fieldWidgetDefinition = omit(getFieldWidgetConfig(config, field, operator, widget, valueSrc), ['factory']);
            let ret;
            if (valueSrc == 'field') {
                console.error("Field as right-hand operand is not supported for mongodb export");
            } else {
                if (typeof fieldWidgetDefinition.mongoFormatValue === 'function') {
                    let fn = fieldWidgetDefinition.mongoFormatValue;
                    let args = [
                        currentValue,
                        pick(fieldDefinition, ['fieldSettings', 'listValues']),
                        omit(fieldWidgetDefinition, ['formatValue', 'mongoFormatValue']), //useful options: valueFormat for date/time
                    ];
                    ret = fn(...args);
                } else {
                    ret = currentValue;
                }
            }
            valueSrcs.push(valueSrc);
            valueTypes.push(valueType);
            return ret;
        });
        if (value.size < cardinality || hasUndefinedValues)
            return undefined;
        let formattedValue = cardinality > 1 ? value.toArray() : (cardinality == 1 ? value.first() : null);
        
        //build rule
        let fn = operatorDefinition.mongoFormatOp;
        let args = [
            field,
            operator,
            formattedValue,
            (valueSrcs.length > 1 ? valueSrcs : valueSrcs[0]),
            (valueTypes.length > 1 ? valueTypes : valueTypes[0]),
            omit(operatorDefinition, ['formatOp', 'mongoFormatOp']),
            operatorOptions,
        ];
        let ruleQuery = fn(...args);
        return ruleQuery;
    }
    return undefined;
};

