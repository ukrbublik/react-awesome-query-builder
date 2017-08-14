import {getFieldConfig, getWidgetForFieldOp, getOperatorConfig, getFieldWidgetConfig, getFieldPath, getFieldPathLabels} from './configUtils';
import omit from 'lodash/omit';
import pick from 'lodash/pick';

export const queryString = (item, config, isForDisplay = false) => {
    const type = item.get('type');
    const properties = item.get('properties');
    const children = item.get('children1');
    const id = item.get('id');

    if (type === 'group' && children && children.size) {
        const conjunction = properties.get('conjunction');
        const conjunctionDefinition = config.conjunctions[conjunction];

        const list = children
            .map((currentChild) => queryString(currentChild, config, isForDisplay))
            .filter((currentChild) => typeof currentChild !== 'undefined');
        if (!list.size)
            return undefined;

        return conjunctionDefinition.formatConj(list, conjunction, isForDisplay);
    } else if (type === 'rule') {
        const field = properties.get('field');
        const operator = properties.get('operator');
        const operatorOptions = properties.get('operatorOptions');
        if (field == null || operator == null)
            return undefined;

        const fieldDefinition = getFieldConfig(field, config) || {};
        const operatorDefinition = getOperatorConfig(config, operator, field) || {};
        const reversedOp = operatorDefinition.reversedOp;
        const revOperatorDefinition = getOperatorConfig(config, reversedOp, field) || {};
        const fieldType = fieldDefinition.type || "undefined";
        const cardinality = operatorDefinition.cardinality || 1;
        const typeConfig = config.types[fieldDefinition.type] || {};
        const fieldSeparator = config.settings.fieldSeparator;

        //format value
        let valueSrcs = [];
        let hasUndefinedValues = false;
        let value = properties.get('value').map((currentValue, ind) => {
            if (currentValue === undefined) {
                hasUndefinedValues = true;
                return undefined;
            }
            const valueSrc = properties.get('valueSrc') ? properties.get('valueSrc').get(ind) : null;
            const widget = getWidgetForFieldOp(config, field, operator, valueSrc);
            const fieldWidgetDefinition = omit(getFieldWidgetConfig(config, field, operator, widget, valueSrc), ['factory']);
            if (valueSrc == 'field') {
                //format field
                const rightField = currentValue;
                let formattedField = null;
                if (rightField) {
                    const rightFieldDefinition = getFieldConfig(rightField, config) || {};
                    const fieldParts = rightField.split(fieldSeparator);
                    //let fieldKeys = getFieldPath(rightField, config);
                    let fieldPartsLabels = getFieldPathLabels(rightField, config);
                    let fieldFullLabel = fieldPartsLabels ? fieldPartsLabels.join(config.settings.fieldSeparatorDisplay) : null;
                    let fieldLabel2 = rightFieldDefinition.label2 || fieldFullLabel;
                    formattedField = config.settings.formatField(rightField, fieldParts, fieldLabel2, rightFieldDefinition, config, isForDisplay);
                }
                return formattedField;
            } else {
                if (typeof fieldWidgetDefinition.formatValue === 'function') {
                    let fn = fieldWidgetDefinition.formatValue;
                    let args = [
                        currentValue,
                        pick(fieldDefinition, ['fieldSettings', 'listValues']),
                        omit(fieldWidgetDefinition, ['formatValue']), //useful options: valueFormat for date/time
                        isForDisplay
                    ];
                    if (valueSrc == 'field') {
                        let valFieldDefinition = getFieldConfig(currentValue, config) || {}; 
                        args.push(valFieldDefinition);
                    }
                    return fn(...args);
                }
                return currentValue;
            }
            valueSrcs.push(valueSrc);
        });
        if (hasUndefinedValues || value.size < cardinality)
            return undefined;
        let formattedValue = (cardinality == 1 ? value.first() : value);

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
            fn = (field, op, values, valueSrc, opDef, operatorOptions, isForDisplay) => {
                return `${field} ${_operator} ${values}`;
            };
        }
        if (!fn)
            return undefined;
        
        //format field
        const fieldParts = field.split(fieldSeparator);
        //let fieldKeys = getFieldPath(field, config);
        let fieldPartsLabels = getFieldPathLabels(field, config);
        let fieldFullLabel = fieldPartsLabels ? fieldPartsLabels.join(config.settings.fieldSeparatorDisplay) : null;
        let fieldLabel2 = fieldDefinition.label2 || fieldFullLabel;
        let formattedField = config.settings.formatField(field, fieldParts, fieldLabel2, fieldDefinition, config, isForDisplay);
        
        //format expr
        let args = [
            formattedField,
            operator,
            formattedValue,
            (valueSrcs.length > 1 ? valueSrcs : valueSrcs[0]),
            omit(operatorDefinition, ['formatOp']),
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


