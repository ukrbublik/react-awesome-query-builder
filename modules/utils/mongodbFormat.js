'use strict';
import {defaultValue} from "./stuff";
import {
    getFieldConfig, getWidgetForFieldOp, getOperatorConfig, getFieldWidgetConfig
} from './configUtils';
import {defaultConjunction} from './defaultUtils';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import {Map} from 'immutable';

export const mongodbFormat = (item, config, _not = false) => {
    const type = item.get('type');
    const properties = item.get('properties') || new Map();
    const children = item.get('children1');

    if (type === 'group' && children && children.size) {
        const not = _not ? !(properties.get('not')) : (properties.get('not'));
        const list = children
            .map((currentChild) => mongodbFormat(currentChild, config, not))
            .filter((currentChild) => typeof currentChild !== 'undefined')
        if (!list.size)
            return undefined;

        let conjunction = properties.get('conjunction');
        if (!conjunction)
            conjunction = defaultConjunction(config);
        let conjunctionDefinition = config.conjunctions[conjunction];
        if (not) {
            conjunction = conjunctionDefinition.reversedConj;
            conjunctionDefinition = config.conjunctions[conjunction];
        }
        const mongoConj = conjunctionDefinition.mongoConj;

        let resultQuery = {};
        if (list.size == 1)
            resultQuery = list.first();
        else
            resultQuery[mongoConj] = list.toList();
        return resultQuery;
    } else if (type === 'rule') {
        let operator = properties.get('operator');
        const operatorOptions = properties.get('operatorOptions');
        let field = properties.get('field');
        let value = properties.get('value');

        if (field == null || operator == null)
            return undefined;

        const fieldDefinition = getFieldConfig(field, config) || {};
        let operatorDefinition = getOperatorConfig(config, operator, field) || {};
        let reversedOp = operatorDefinition.reversedOp;
        let revOperatorDefinition = getOperatorConfig(config, reversedOp, field) || {};
        const cardinality = defaultValue(operatorDefinition.cardinality, 1);

        if (_not) {
            [operator, reversedOp] = [reversedOp, operator];
            [operatorDefinition, revOperatorDefinition] = [revOperatorDefinition, operatorDefinition];
        }

        //format field
        let fieldName = field;
        if (fieldDefinition.tableName) {
          const regex = new RegExp(field.split(config.settings.fieldSeparator)[0])
          fieldName = field.replace(regex, fieldDefinition.tableName)
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
                    const fn = fieldWidgetDefinition.mongoFormatValue;
                    const args = [
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
        const formattedValue = cardinality > 1 ? value.toArray() : (cardinality == 1 ? value.first() : null);
        
        //build rule
        const fn = operatorDefinition.mongoFormatOp;
        if(!fn)
            return undefined;
        const args = [
            fieldName,
            operator,
            formattedValue,
            (valueSrcs.length > 1 ? valueSrcs : valueSrcs[0]),
            (valueTypes.length > 1 ? valueTypes : valueTypes[0]),
            omit(operatorDefinition, ['formatOp', 'mongoFormatOp']),
            operatorOptions,
        ];
        const ruleQuery = fn(...args);
        return ruleQuery;
    }
    return undefined;
};

