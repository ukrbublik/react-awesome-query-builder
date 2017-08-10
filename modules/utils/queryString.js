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
        const widget = getWidgetForFieldOp(config, field, operator);
        const fieldWidgetDefinition = omit(getFieldWidgetConfig(config, field, operator, widget), ['factory']);
        const typeConfig = config.types[fieldDefinition.type] || {};

        //format value
        let value = properties.get('value').map((currentValue, ind) => {
            let valueSrc = properties.get('valueSrc') ? properties.get('valueSrc').get(ind) : null;
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
        });
        if (value.size < cardinality)
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
            fn = (field, operator, value, fieldDef, isForDisplay) => {
                return `${field} ${_operator} ${value}`;
            };
        }
        if (!fn)
            return undefined;
        
        //format field
        const fieldSeparator = config.settings.fieldSeparator;
        const parts = field.split(fieldSeparator);
        let fieldKeys = getFieldPath(field, config);
        let fieldPartsLabels = getFieldPathLabels(field, config);
        let fieldFullLabel = fieldPartsLabels ? fieldPartsLabels.join(config.settings.fieldSeparatorDisplay) : null;
        let fieldLabel2 = fieldDefinition.label2 || fieldFullLabel;
        let formattedField = config.settings.formatField(field, parts, fieldLabel2, fieldDefinition, config, isForDisplay);
        
        //format expr
        let args = [
            formattedField,
            operator,
            formattedValue,
            omit(fieldWidgetDefinition, ['formatValue']), //useful options: valueFormat for date/time
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


