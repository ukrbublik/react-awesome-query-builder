import {getFieldConfig, getWidgetForFieldOp, getOperatorConfig, getFieldWidgetConfig, getFieldPath, getFieldPathLabels} from './configUtils';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import {defaultValue} from "./stuff";
import {defaultConjunction} from './defaultUtils';
import {settings as defaultSettings} from '../config/default';
import {Map} from 'immutable';

export const queryString = (item, config, isForDisplay = false) => {
    const type = item.get('type');
    const properties = item.get('properties') || new Map();
    const children = item.get('children1');

    if (type === 'group' && children && children.size) {
        const not = properties.get('not');
        const list = children
            .map((currentChild) => queryString(currentChild, config, isForDisplay))
            .filter((currentChild) => typeof currentChild !== 'undefined');
        if (!list.size)
            return undefined;

        let conjunction = properties.get('conjunction');
        if (!conjunction)
            conjunction = defaultConjunction(config);
        const conjunctionDefinition = config.conjunctions[conjunction];

        return conjunctionDefinition.formatConj(list, conjunction, not, isForDisplay);
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
        const {fieldSeparator, fieldSeparatorDisplay} = config.settings;

        //format value
        let valueSrcs = [];
        let valueTypes = [];
        let hasUndefinedValues = false;
        let value = properties.get('value').map((currentValue, ind) => {
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
                //format field
                const rightField = currentValue;
                let formattedField = null;
                if (rightField) {
                    const rightFieldDefinition = getFieldConfig(rightField, config) || {};
                    const fieldParts = Array.isArray(rightField) ? rightField : rightField.split(fieldSeparator);
                    const _fieldKeys = getFieldPath(rightField, config);
                    const fieldPartsLabels = getFieldPathLabels(rightField, config);
                    const fieldFullLabel = fieldPartsLabels ? fieldPartsLabels.join(fieldSeparatorDisplay) : null;
                    const fieldLabel2 = rightFieldDefinition.label2 || fieldFullLabel;
                    const formatField = config.settings.formatField || defaultSettings.formatField;
                    formattedField = formatField(rightField, fieldParts, fieldLabel2, rightFieldDefinition, config, isForDisplay);
                }
                ret = formattedField;
            } else {
                if (typeof fieldWidgetDefinition.formatValue === 'function') {
                    const fn = fieldWidgetDefinition.formatValue;
                    const args = [
                        currentValue,
                        pick(fieldDefinition, ['fieldSettings', 'listValues']),
                        omit(fieldWidgetDefinition, ['formatValue', 'mongoFormatValue', 'sqlFormatValue']), //useful options: valueFormat for date/time
                        isForDisplay
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
                    ret = currentValue;
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
        let fn = operatorDefinition.formatOp;
        if (!fn && reversedOp) {
            fn = revOperatorDefinition.formatOp;
            if (fn) {
                isRev = true;
            }
        }
        if (!fn && cardinality == 1) {
            let _operator = operatorDefinition.labelForFormat || operator;
            fn = (field, op, values, valueSrc, valueType, opDef, operatorOptions, isForDisplay) => {
                return `${field} ${_operator} ${values}`;
            };
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
        const fieldFullLabel = fieldPartsLabels ? fieldPartsLabels.join(config.settings.fieldSeparatorDisplay) : null;
        const fieldLabel2 = fieldDefinition.label2 || fieldFullLabel;
        const formatField = config.settings.formatField || defaultSettings.formatField;
        const formattedField = formatField(fieldName, fieldParts, fieldLabel2, fieldDefinition, config, isForDisplay);
        
        //format expr
        const args = [
            formattedField,
            operator,
            formattedValue,
            (valueSrcs.length > 1 ? valueSrcs : valueSrcs[0]),
            (valueTypes.length > 1 ? valueTypes : valueTypes[0]),
            omit(operatorDefinition, ['formatOp', 'mongoFormatOp', 'sqlFormatOp']),
            operatorOptions,
            isForDisplay
        ];
        let ret = fn(...args);
        if (isRev) {
            ret = config.settings.formatReverse(ret, operator, reversedOp, operatorDefinition, revOperatorDefinition, isForDisplay);
        }
        return ret;
    }

    return undefined;
};


