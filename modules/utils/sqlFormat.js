import {getFieldConfig, getWidgetForFieldOp, getOperatorConfig, getFieldWidgetConfig, getFieldPath, getFieldPathLabels} from './configUtils';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import {defaultValue} from "./stuff";
import {defaultConjunction} from './defaultUtils';
import {settings as defaultSettings} from '../config/default';
import {completeValue} from './funcUtils';
import {Map} from 'immutable';
let SqlString = require('sqlstring');


SqlString.trim = (val) => {
    if (val.charAt(0) == "'")
        return val.substring(1, val.length-1);
    else
        return val;
};

SqlString.escapeLike = (val) => {
    // normal escape
    let res = SqlString.escape(val);
    // unwrap ''
    res = SqlString.trim(res);
    // escape % and _
    res = res.replace(/[%_]/g, '\\$&');
    // wrap with % for LIKE
    res = "%" + res + "%";
    // wrap ''
    res = "'" + res + "'";
    return res;
};

export {SqlString};


export const sqlFormat = (item, config) => {
    const type = item.get('type');
    const properties = item.get('properties') || new Map();
    const children = item.get('children1');

    if (type === 'group' && children && children.size) {
        const not = properties.get('not');
        const list = children
            .map((currentChild) => sqlFormat(currentChild, config))
            .filter((currentChild) => typeof currentChild !== 'undefined');
        if (!list.size)
            return undefined;

        let conjunction = properties.get('conjunction');
        if (!conjunction)
            conjunction = defaultConjunction(config);
        const conjunctionDefinition = config.conjunctions[conjunction];

        return conjunctionDefinition.sqlFormatConj(list, conjunction, not);
    } else if (type === 'rule') {
        let field = properties.get('field');
        const operator = properties.get('operator');
        const operatorOptions = properties.get('operatorOptions');
        if (field == null || operator == null)
            return undefined;

        const fieldDefinition = getFieldConfig(field, config) || {};
        const operatorDefinition = getOperatorConfig(config, operator, field) || {};
        const reversedOp = operatorDefinition.reversedOp;
        const revOperatorDefinition = getOperatorConfig(config, reversedOp, field) || {};
        const cardinality = defaultValue(operatorDefinition.cardinality, 1);
        const {fieldSeparator} = config.settings;

        //format value
        let valueSrcs = [];
        let valueTypes = [];
        let hasUndefinedValues = false;
        let value = properties.get('value').map((currentValue, ind) => {
            const valueSrc = properties.get('valueSrc') ? properties.get('valueSrc').get(ind) : null;
            const valueType = properties.get('valueType') ? properties.get('valueType').get(ind) : null;
            currentValue = completeValue(currentValue, valueSrc, config);
            if (currentValue === undefined) {
                hasUndefinedValues = true;
                return undefined;
            }
            const widget = getWidgetForFieldOp(config, field, operator, valueSrc);
            const fieldWidgetDefinition = omit(getFieldWidgetConfig(config, field, operator, widget, valueSrc), ['factory']);
            let ret;
            if (valueSrc == 'field') {
                //format field
                const rightField = currentValue;
                let formattedField = null;
                if (rightField) {
                    const rightFieldDefinition = getFieldConfig(rightField, config) || {};
                    const fieldParts = Array.isArray(rightField) ? rightField : rightField.split(fieldSeparator);
                    const _fieldKeys = getFieldPath(rightField, config);
                    const fieldPartsLabels = getFieldPathLabels(rightField, config);
                    const fieldFullLabel = fieldPartsLabels ? fieldPartsLabels.join(fieldSeparator) : null;
                    const formatField = config.settings.formatField || defaultSettings.formatField;
                    let rightFieldName = rightField;
                    if (rightFieldDefinition.tableName) {
                        const fieldPartsCopy = [...fieldParts];
                        fieldPartsCopy[0] = rightFieldDefinition.tableName;
                        rightFieldName = fieldPartsCopy.join(fieldSeparator);
                    }
                    formattedField = formatField(rightFieldName, fieldParts, fieldFullLabel, rightFieldDefinition, config);
                }
                ret = formattedField;
            } else {
                if (typeof fieldWidgetDefinition.sqlFormatValue === 'function') {
                    const fn = fieldWidgetDefinition.sqlFormatValue;
                    const args = [
                        currentValue,
                        pick(fieldDefinition, ['fieldSettings', 'listValues']),
                        omit(fieldWidgetDefinition, ['formatValue', 'mongoFormatValue', 'sqlFormatValue']), //useful options: valueFormat for date/time
                    ];
                    if (true) {
                        args.push(operator);
                        args.push(operatorDefinition);
                    }
                    if (valueSrc == 'field') {
                        const valFieldDefinition = getFieldConfig(currentValue, config) || {}; 
                        args.push(valFieldDefinition);
                    }
                    ret = fn(...args);
                } else {
                    ret = SqlString.escape(currentValue);
                }
            }
            valueSrcs.push(valueSrc);
            valueTypes.push(valueType);
            return ret;
        });
        if (hasUndefinedValues || value.size < cardinality)
            return undefined;
        const formattedValue = (cardinality == 1 ? value.first() : value);

        //find fn to format expr
        let isRev = false;
        let fn = operatorDefinition.sqlFormatOp;
        if (!fn && reversedOp) {
            fn = revOperatorDefinition.sqlFormatOp;
            if (fn) {
                isRev = true;
            }
        }
        if (!fn) {
            const _operator = operatorDefinition.sqlOp || operator;
            if (cardinality == 0) {
                fn = (field, op, values, valueSrc, valueType, opDef, operatorOptions) => {
                    return `${field} ${_operator}`;
                };
            } else if (cardinality == 1) {
                fn = (field, op, value, valueSrc, valueType, opDef, operatorOptions) => {
                    return `${field} ${_operator} ${value}`;
                };
            } else if (cardinality == 2) {
                // between
                fn = (field, op, values, valueSrc, valueType, opDef, operatorOptions) => {
                    const valFrom = values.first();
                    const valTo = values.get(1);
                    return `${field} ${_operator} ${valFrom} AND ${valTo}`;
                };
            }
        }
        if (!fn)
            return undefined;
        
        //format field
        let fieldName = field;
        const fieldParts = Array.isArray(field) ? field : field.split(fieldSeparator);
        if (fieldDefinition.tableName) {
            const fieldPartsCopy = [...fieldParts];
            fieldPartsCopy[0] = fieldDefinition.tableName;
            fieldName = fieldPartsCopy.join(fieldSeparator);
        }
        const _fieldKeys = getFieldPath(field, config);
        const fieldPartsLabels = getFieldPathLabels(field, config);
        const fieldFullLabel = fieldPartsLabels ? fieldPartsLabels.join(config.settings.fieldSeparator) : null;
        const formatField = config.settings.formatField || defaultSettings.formatField;
        const formattedField = formatField(fieldName, fieldParts, fieldFullLabel, fieldDefinition, config);
        
        //format expr
        const args = [
            formattedField,
            operator,
            formattedValue,
            (valueSrcs.length > 1 ? valueSrcs : valueSrcs[0]),
            (valueTypes.length > 1 ? valueTypes : valueTypes[0]),
            omit(operatorDefinition, ['formatOp', 'mongoFormatOp', 'sqlFormatOp']),
            operatorOptions,
        ];
        let ret = fn(...args);
        if (isRev) {
            ret = config.settings.sqlFormatReverse(ret, operator, reversedOp, operatorDefinition, revOperatorDefinition);
        }
        return ret;
    }

    return undefined;
};


