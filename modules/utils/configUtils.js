'use strict';
import last from 'lodash/last';
import pick from 'lodash/pick';
import pickBy from 'lodash/pickBy';
import merge from 'lodash/merge';
import mergeWith from 'lodash/mergeWith';
import cloneDeep from 'lodash/cloneDeep';

export const extendConfig = (config) => {
    //operators, defaultOperator - merge
    //widgetProps (including valueLabel, valuePlaceholder, hideOperator, operatorInlineLabel) - concrete by widget

    //extend 'types' path
    for (let type in config.types) {
        let typeConfig = config.types[type];
        let operators = null, defaultOperator = null;
        for (let widget in typeConfig.widgets) {
            let typeWidgetConfig = typeConfig.widgets[widget];
            if (typeWidgetConfig.operators) {
                if (!operators)
                    operators = [];
                operators = operators.concat(typeWidgetConfig.operators.slice());
            }
            if (typeWidgetConfig.defaultOperator)
                defaultOperator = typeWidgetConfig.defaultOperator;
            typeWidgetConfig = merge({}, pickBy(typeConfig, (v, k) => 
                (['widgetProps'].indexOf(k) != -1)), typeWidgetConfig);
            typeConfig.widgets[widget] = typeWidgetConfig;
        }
        if (!typeConfig.valueSources)
            typeConfig.valueSources = Object.keys(config.settings.valueSourcesInfo);
        for (let valueSrc of typeConfig.valueSources) {
            if (valueSrc != 'value' && !typeConfig.widgets[valueSrc]) {
                typeConfig.widgets[valueSrc] = {
                };
            }
        }
        if (!typeConfig.operators && operators)
            typeConfig.operators = operators;
        if (!typeConfig.defaultOperator && defaultOperator)
            typeConfig.defaultOperator = defaultOperator;
        config.types[type] = typeConfig;
    }

    //extend 'fields' path
    function _extendFieldConfig(fieldConfig) {
        let operators = null, defaultOperator = null;
        let typeConfig = config.types[fieldConfig.type];
        if (fieldConfig.type != '!struct') {
            for (let widget in typeConfig.widgets) {
                if (!fieldConfig.widgets)
                    fieldConfig.widgets = {};
                let fieldWidgetConfig = fieldConfig.widgets[widget] || {};
                if (fieldWidgetConfig.operators) {
                    if (!operators)
                        operators = [];
                    operators = operators.concat(fieldWidgetConfig.operators.slice());
                }
                if (fieldWidgetConfig.defaultOperator)
                    defaultOperator = fieldWidgetConfig.defaultOperator;
                fieldWidgetConfig = merge({}, pickBy(fieldConfig, (v, k) => 
                    (['widgetProps'].indexOf(k) != -1)), fieldWidgetConfig);
                fieldConfig.widgets[widget] = fieldWidgetConfig;
            }
            fieldConfig.valueSources = fieldConfig.valueSources || typeConfig.valueSources || ['value'];
        }
        if (!fieldConfig.operators && operators)
            fieldConfig.operators = operators;
        if (!fieldConfig.defaultOperator && defaultOperator)
            fieldConfig.defaultOperator = defaultOperator;
    };
    function _extendFieldsConfig(subconfig) {
        for (let field in subconfig) {
            _extendFieldConfig(subconfig[field]);
            if (subconfig[field].subfields) {
                _extendFieldsConfig(subconfig[field].subfields);
            }
        }
    }
    _extendFieldsConfig(config.fields);
    console.log(config); 
    return config;
};

export const getFieldConfig = (field, config) => {
    if (!field || field == ':empty:')
        return null;
    const fieldSeparator = config.settings.fieldSeparator;
    const parts = field.split(fieldSeparator);
    let fields = config.fields;
    let fieldConfig = null;
    for (let i = 0 ; i < parts.length ; i++) {
        const part = parts[i];
        const tmpFieldConfig = fields[part];
        if (!tmpFieldConfig)
            throw new Error("Can't find field " + field + ", please check your config");
        if (i == parts.length-1) {
            fieldConfig = tmpFieldConfig;
        } else {
            fields = tmpFieldConfig.subfields;
            if (!fields)
                throw new Error("Can't find field " + field + ", please check your config");
        }
    }

    //merge, but don't merge operators (reqrite instead)
    const typeConfig = config.types[fieldConfig.type] || {};
    let ret = mergeWith({}, typeConfig, fieldConfig || {}, (objValue, srcValue, key, object, source, stack) => {
        if (Array.isArray(objValue)) {
            return srcValue;
        }
    });

    return ret;
};

export const getFirstField = (config) => {
  const fieldSeparator = config.settings.fieldSeparator;
  let firstField = null, key = null, keysPath = [];
  if (Object.keys(config.fields).length > 0) {
    key = Object.keys(config.fields)[0];
    firstField = config.fields[key];
    keysPath.push(key);
    while (firstField.type == '!struct') {
        const subfields = firstField.subfields;
        if (!subfields || !Object.keys(subfields).length) {
            firstField = key = null;
            break;
        }
        key = Object.keys(subfields)[0];
        keysPath.push(key);
        firstField = subfields[key];
    }
  }
  return keysPath.join(fieldSeparator);
};

export const getOperatorsForField = (config, field) => {
  const fieldConfig = getFieldConfig(field, config);
  const fieldOps = fieldConfig.operators;
  return fieldOps;
};

export const getFirstOperator = (config, field) => {
  const fieldOps = getOperatorsForField(config, field);
  return fieldOps ? fieldOps[0] : null;
};

export const getFieldPath = (field, config) => {
    if (!field || field == ':empty:')
        return null;
    const fieldSeparator = config.settings.fieldSeparator;
    return field
        .split(fieldSeparator)
        .map((curr, ind, arr) => arr.slice(0, ind+1))
        .map((parts) => parts.join(fieldSeparator));
};

export const getFieldPathLabels = (field, config) => {
    if (!field || field == ':empty:')
        return null;
    const fieldSeparator = config.settings.fieldSeparator;
    return field
        .split(fieldSeparator)
        .map((curr, ind, arr) => arr.slice(0, ind+1))
        .map((parts) => parts.join(fieldSeparator))
        .map(part => {
            const cnf = getFieldConfig(part, config);
            return cnf && cnf.label || last(part.split(fieldSeparator))
        });
};

export const getOperatorConfig = (config, operator, field = null) => {
    if (!operator)
        return null;
    const opConfig = config.operators[operator];
    if (field) {
        const fieldConfig = getFieldConfig(field, config);
        const widget = getWidgetForFieldOp(config, field, operator);
        const fieldWidgetConfig = (fieldConfig.widgets ? fieldConfig.widgets[widget] : {}) || {};
        const fieldWidgetOpProps = (fieldWidgetConfig.opProps || {})[operator];
        const mergedOpConfig = merge({}, opConfig, fieldWidgetOpProps);
        return mergedOpConfig;
    } else {
        return opConfig;
    }
};

export const getFieldWidgetConfig = (config, field, operator, widget = null, valueSrc = null) => {
    if (!field || !(operator || widget))
        return null;
    const fieldConfig = getFieldConfig(field, config);
    if (!widget)
        widget = getWidgetForFieldOp(config, field, operator, valueSrc);
    const widgetConfig = config.widgets[widget] || {};
    const fieldWidgetConfig = (fieldConfig.widgets ? fieldConfig.widgets[widget] : {}) || {};
    const fieldWidgetProps = (fieldWidgetConfig.widgetProps || {});
    const mergedConfig = merge({}, widgetConfig, fieldWidgetProps);
    return mergedConfig;
};

export const getValueLabel = (config, field, operator, delta, valueSrc = null) => {
    const fieldWidgetConfig = getFieldWidgetConfig(config, field, operator, null, valueSrc) || {};
    const mergedOpConfig = getOperatorConfig(config, operator, field) || {};

    const cardinality = mergedOpConfig.cardinality;
    let ret = null;
    if (cardinality > 1) {
        const valueLabels =  mergedOpConfig.valueLabels;
        if (valueLabels)
            ret = valueLabels[delta];
        if (ret && typeof ret != 'object') {
            ret = {label: ret, placeholder: ret};
        }
        if (!ret) {
            ret = {
                label: (config.settings.valueLabel || "Value") + " " + (delta+1),
                placeholder: (config.settings.valuePlaceholder || "Value") + " " + (delta+1),
            }
        }
    } else {
        ret = {
            label: fieldWidgetConfig.valueLabel || config.settings.valueLabel || "Value", 
            placeholder: fieldWidgetConfig.valuePlaceholder || config.settings.valuePlaceholder || "Value",
        };
    }
    return ret;
};

function _getWidgetsAndSrcsForFieldOp (config, field, operator, valueSrc = null) {
    let widgets = [];
    let valueSrcs = [];
    if (!field || !operator)
        return {widgets, valueSrcs};
    const fieldConfig = getFieldConfig(field, config);
    //const typeConfig = config.types[fieldConfig.type] || {};
    const opConfig = config.operators[operator];
    if (fieldConfig.widgets) {
        for (let widget in fieldConfig.widgets) {
            let widgetConfig = fieldConfig.widgets[widget];
            let widgetValueSrc = config.widgets[widget].valueSrc;
            let canAdd = widgetConfig.operators ? widgetConfig.operators.indexOf(operator) != -1 : valueSrc != 'value';
            canAdd = canAdd && (!valueSrc || valueSrc == widgetValueSrc);
            if (opConfig.isUnary && (widgetValueSrc != 'value'))
                canAdd = false;
            if (canAdd) {
                widgets.push(widget);
                if (!valueSrcs.find(v => v == widgetValueSrc))
                    valueSrcs.push(widgetValueSrc);
            }
        }
    }
    return {widgets, valueSrcs};
};

export const getWidgetsForFieldOp = (config, field, operator, valueSrc = null) => {
    let {widgets, valueSrcs} = _getWidgetsAndSrcsForFieldOp(config, field, operator, valueSrc);
    return widgets;
};

export const getValueSourcesForFieldOp = (config, field, operator) => {
    let {widgets, valueSrcs} = _getWidgetsAndSrcsForFieldOp(config, field, operator, null);
    return valueSrcs;
};

export const getWidgetForFieldOp = (config, field, operator, valueSrc = null) => {
    let {widgets, valueSrcs} = _getWidgetsAndSrcsForFieldOp(config, field, operator, valueSrc);
    return widgets.length ? widgets[0] : null;
};
