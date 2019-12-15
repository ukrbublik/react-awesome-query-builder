'use strict';
import {defaultValue} from "./stuff";
import {
    getFieldConfig, getWidgetForFieldOp, getOperatorConfig, getFieldWidgetConfig, getFuncConfig
} from './configUtils';
import {defaultConjunction} from './defaultUtils';
import {completeValue} from './funcUtils';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import {Map} from 'immutable';

const mongoFormatValue = (config, currentValue, valueSrc, valueType, fieldWidgetDefinition, fieldDefinition, operator, operatorDefinition) => {
    if (currentValue === undefined)
        return undefined;
    const {fieldSeparator} = config.settings;
    let ret;
    if (valueSrc == 'field') {
        console.error("Field as right-hand operand is not supported for mongodb export");
    } else if (valueSrc == 'func') {
        const funcKey = currentValue.get('func');
        const args = currentValue.get('args');
        const funcConfig = getFuncConfig(funcKey, config);
        const funcName = funcConfig.mongoFunc || funcKey;
        const formattedArgs = {};
        for (const argKey in funcConfig.args) {
            const argConfig = funcConfig.args[argKey];
            const fieldDef = getFieldConfig(argConfig, config);
            const argVal = args ? args.get(argKey) : undefined;
            const argValue = argVal ? argVal.get('value') : undefined;
            const argValueSrc = argVal ? argVal.get('valueSrc') : undefined;
            const argName = argKey;
            const formattedArgVal = mongoFormatValue(config, argValue, argValueSrc, argConfig.type, fieldDef, argConfig, null, null);
            if (argValue != undefined && formattedArgVal === undefined)
                return undefined;
            formattedArgs[argName] = formattedArgVal; 
        }
        if (typeof fieldWidgetDefinition.mongoFormatFunc === 'function') {
            const fn = fieldWidgetDefinition.mongoFormatFunc;
            const args = [
                funcKey,
                funcConfig,
                formattedArgs,
            ];
            ret = fn(...args);
        } else {
            ret = { [funcName]: formattedArgs };
        }
    } else {
        if (typeof fieldWidgetDefinition.mongoFormatValue === 'function') {
            const fn = fieldWidgetDefinition.mongoFormatValue;
            const args = [
                currentValue,
                pick(fieldDefinition, ['fieldSettings', 'listValues']),
                omit(fieldWidgetDefinition, ['formatValue', 'mongoFormatValue', 'sqlFormatValue', 'sqlFormatFunc']), //useful options: valueFormat for date/time
            ];
            if (operator) {
                args.push(operator);
                args.push(operatorDefinition);
            }
            ret = fn(...args);
        } else {
            ret = currentValue;
        }
    }
    return ret;
}

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
        const reversedConj = conjunctionDefinition.reversedConj;
        if (not && reversedConj) {
            conjunction = reversedConj;
            conjunctionDefinition = config.conjunctions[conjunction];
        }
        const mongoConj = conjunctionDefinition.mongoConj;

        let resultQuery = {};
        if (list.size == 1)
            resultQuery = list.first();
        else
            resultQuery[mongoConj] = list.toList().toJS();
        return resultQuery;
    } else if (type === 'rule') {
        const {fieldSeparator} = config.settings;
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
          let fieldParts = Array.isArray(field) ? [...field] : field.split(fieldSeparator);
          fieldParts[0] = fieldDefinition.tableName;
          fieldName = fieldParts.join(fieldSeparator);
        }

        //format value
        let valueSrcs = [];
        let valueTypes = [];
        let hasUndefinedValues = false;
        value = value.map((currentValue, ind) => {
            const valueSrc = properties.get('valueSrc') ? properties.get('valueSrc').get(ind) : null;
            const valueType = properties.get('valueType') ? properties.get('valueType').get(ind) : null;
            currentValue = completeValue(currentValue, valueSrc, config);
            const widget = getWidgetForFieldOp(config, field, operator, valueSrc);
            const fieldWidgetDefinition = omit(getFieldWidgetConfig(config, field, operator, widget, valueSrc), ['factory']);
            let fv = mongoFormatValue(config, currentValue, valueSrc, valueType, fieldWidgetDefinition, fieldDefinition, operator, operatorDefinition);
            if (fv === undefined) {
                hasUndefinedValues = true;
                return undefined;
            }
            valueSrcs.push(valueSrc);
            valueTypes.push(valueType);
            return fv;
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
            omit(operatorDefinition, ['formatOp', 'mongoFormatOp', 'sqlFormatOp']),
            operatorOptions,
        ];
        const ruleQuery = fn(...args);
        return ruleQuery;
    }
    return undefined;
};

