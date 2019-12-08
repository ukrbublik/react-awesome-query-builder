'use strict';
import last from 'lodash/last';
import merge from 'lodash/merge';
import mergeWith from 'lodash/mergeWith';
import {settings as defaultSettings} from '../config/default';
import moment from 'moment';


export const extendConfig = (config) => {
    //operators, defaultOperator - merge
    //widgetProps (including valueLabel, valuePlaceholder, hideOperator, operatorInlineLabel) - concrete by widget

    config.settings = merge({}, defaultSettings, config.settings);

    _extendTypesConfig(config.types, config);

    _extendFieldsConfig(config.fields, config);
    
    moment.locale(config.settings.locale.short);

    return config;
};

function _extendTypesConfig(typesConfig, config) {
    for (let type in typesConfig) {
        let typeConfig = typesConfig[type];
        _extendTypeConfig(type, typeConfig, config);
    }
};

function _extendTypeConfig(type, typeConfig, config) {
    let operators = null, defaultOperator = null;
    typeConfig.mainWidget = typeConfig.mainWidget || Object.keys(typeConfig.widgets).filter(w => w != 'field')[0];
    for (let widget in typeConfig.widgets) {
        let typeWidgetConfig = typeConfig.widgets[widget];
        if (typeWidgetConfig.operators) {
            if (!operators)
                operators = [];
            
            operators = operators.concat(typeWidgetConfig.operators.slice());
        }
        if (typeWidgetConfig.defaultOperator)
            defaultOperator = typeWidgetConfig.defaultOperator;
        if (widget == typeConfig.mainWidget) {
            typeWidgetConfig = merge({}, {widgetProps: typeConfig.mainWidgetProps || {}}, typeWidgetConfig);
        }
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
        typeConfig.operators = Array.from(new Set(operators)); //unique
    if (!typeConfig.defaultOperator && defaultOperator)
        typeConfig.defaultOperator = defaultOperator;
};

function _extendFieldsConfig(subconfig, config) {
    for (let field in subconfig) {
        _extendFieldConfig(field, subconfig[field], config);
        if (subconfig[field].subfields) {
            _extendFieldsConfig(subconfig[field].subfields, config);
        }
    }
};

function _extendFieldConfig(field, fieldConfig, config) {
    let operators = null, defaultOperator = null;
    let typeConfig = config.types[fieldConfig.type];
    const excludeOperators = fieldConfig.excludeOperators || [];
    if (fieldConfig.type != '!struct') {
        if (!fieldConfig.widgets)
            fieldConfig.widgets = {};
        fieldConfig.mainWidget = fieldConfig.mainWidget || typeConfig.mainWidget;
        fieldConfig.valueSources = fieldConfig.valueSources || typeConfig.valueSources;
        for (let widget in typeConfig.widgets) {
            let fieldWidgetConfig = fieldConfig.widgets[widget] || {};
            let typeWidgetConfig = typeConfig.widgets[widget] || {};
            let shouldIncludeOperators = fieldConfig.preferWidgets && (widget == 'field' || fieldConfig.preferWidgets.includes(widget)) || excludeOperators.length > 0;
            if (fieldWidgetConfig.operators) {
                if (!operators)
                    operators = [];
                operators = operators.concat(fieldWidgetConfig.operators.filter(o => !excludeOperators.includes(o)));
            } else if (shouldIncludeOperators && typeWidgetConfig.operators) {
                if (!operators)
                    operators = [];
                operators = operators.concat(typeWidgetConfig.operators.filter(o => !excludeOperators.includes(o)));
            }
            if (fieldWidgetConfig.defaultOperator)
                defaultOperator = fieldWidgetConfig.defaultOperator;
            if (widget == fieldConfig.mainWidget) {
                fieldWidgetConfig = merge({}, {widgetProps: fieldConfig.mainWidgetProps || {}}, fieldWidgetConfig);
            }
            fieldConfig.widgets[widget] = fieldWidgetConfig;
        }
        if (!fieldConfig.operators && operators)
            fieldConfig.operators = Array.from(new Set(operators));
        if (!fieldConfig.defaultOperator && defaultOperator)
            fieldConfig.defaultOperator = defaultOperator;

        const keysToPutInFieldSettings = ['listValues', 'allowCustomValues'];
        if (!fieldConfig.fieldSettings)
            fieldConfig.fieldSettings = {};
        for (const k of keysToPutInFieldSettings) {
            if (fieldConfig[k]) {
                fieldConfig.fieldSettings[k] = fieldConfig[k];
                delete fieldConfig[k];
            }
        }
    }
};

export const getFieldRawConfig = (field, config, fieldsKey = 'fields', subfieldsKey = 'subfields') => {
    if (!field || field == ':empty:')
        return null;
    const fieldSeparator = config.settings.fieldSeparator;
    const parts = Array.isArray(field) ? field : field.split(fieldSeparator);
    let fields = config[fieldsKey];
    let fieldConfig = null;
    for (let i = 0 ; i < parts.length ; i++) {
        const part = parts[i];
        const tmpFieldConfig = fields[part];
        if (!tmpFieldConfig)
            return null;
        if (i == parts.length-1) {
            fieldConfig = tmpFieldConfig;
        } else {
            fields = tmpFieldConfig[subfieldsKey];
            if (!fields)
                return null;
        }
    }
    return fieldConfig;
};

export const getFuncConfig = (func, config) => {
    if (!func)
        return null;
    const funcConfig = getFieldRawConfig(func, config, 'funcs', 'subfields');
    if (!funcConfig)
        return null; //throw new Error("Can't find func " + func + ", please check your config");
    return funcConfig;
};

export const getFieldConfig = (field, config) => {
    if (!field || field == ':empty:')
        return null;
    const fieldConfig = getFieldRawConfig(field, config);
    if (!fieldConfig)
        return null; //throw new Error("Can't find field " + field + ", please check your config");

    //merge, but don't merge operators (rewrite instead)
    const typeConfig = config.types[fieldConfig.type] || {};
    let ret = mergeWith({}, typeConfig, fieldConfig || {}, (objValue, srcValue, _key, _object, _source, _stack) => {
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
  const fieldOps = fieldConfig ? fieldConfig.operators : [];
  return fieldOps;
};

export const getFirstOperator = (config, field) => {
  const fieldOps = getOperatorsForField(config, field);
  return fieldOps ? fieldOps[0] : null;
};

export const getFieldPath = (field, config, onlyKeys = false) => {
    if (!field || field == ':empty:')
        return null;
    const fieldSeparator = config.settings.fieldSeparator;
    const parts = Array.isArray(field) ? field : field.split(fieldSeparator);
    if (onlyKeys)
        return parts;
    else
        return parts
            .map((_curr, ind, arr) => arr.slice(0, ind+1))
            .map((parts) => parts.join(fieldSeparator));
};

export const getFieldPathLabels = (field, config) => {
    if (!field || field == ':empty:')
        return null;
    const fieldSeparator = config.settings.fieldSeparator;
    const parts = Array.isArray(field) ? field : field.split(fieldSeparator);
    return parts
        .map((_curr, ind, arr) => arr.slice(0, ind+1))
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
    const reversedOperator = opConfig.reversedOp;
    //const revOpConfig = config.operators[reversedOperator];
    if (field) {
        const fieldConfig = getFieldConfig(field, config);
        const widget = getWidgetForFieldOp(config, field, operator);
        const widgetConfig = config.widgets[widget] || {};
        const fieldWidgetConfig = (fieldConfig && fieldConfig.widgets ? fieldConfig.widgets[widget] : {}) || {};
        const widgetOpProps = (widgetConfig.opProps || {})[operator];
        //const widgetRevOpProps = (widgetConfig.opProps || {})[reversedOperator];
        const fieldWidgetOpProps = (fieldWidgetConfig.opProps || {})[operator];
        //const fieldWidgetRevOpProps = (fieldWidgetConfig.opProps || {})[reversedOperator];
        const mergedOpConfig = merge({}, opConfig, widgetOpProps, fieldWidgetOpProps);
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
    const fieldWidgetConfig = (fieldConfig && fieldConfig.widgets ? fieldConfig.widgets[widget] : {}) || {};
    const fieldWidgetProps = (fieldWidgetConfig.widgetProps || {});
    const mergedConfig = merge({}, widgetConfig, fieldWidgetProps);
    return mergedConfig;
};

export const getValueLabel = (config, field, operator, delta, valueSrc = null, isSpecialRange = false) => {
    const fieldWidgetConfig = getFieldWidgetConfig(config, field, operator, null, valueSrc) || {};
    const mergedOpConfig = getOperatorConfig(config, operator, field) || {};

    const cardinality = isSpecialRange ? 1 : mergedOpConfig.cardinality;
    let ret = null;
    if (cardinality > 1) {
        const valueLabels = fieldWidgetConfig.valueLabels || mergedOpConfig.valueLabels;
        if (valueLabels)
            ret = valueLabels[delta];
        if (ret && typeof ret != 'object') {
            ret = {label: ret, placeholder: ret};
        }
        if (!ret) {
            ret = {
                label: config.settings.valueLabel + " " + (delta+1),
                placeholder: config.settings.valuePlaceholder + " " + (delta+1),
            }
        }
    } else {
        ret = {
            label: fieldWidgetConfig.valueLabel || config.settings.valueLabel, 
            placeholder: fieldWidgetConfig.valuePlaceholder || config.settings.valuePlaceholder,
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
    const _typeConfig = config.types[fieldConfig.type] || {};
    const opConfig = config.operators[operator];
    if (fieldConfig && fieldConfig.widgets) {
        for (let widget in fieldConfig.widgets) {
            let widgetConfig = fieldConfig.widgets[widget];
            let widgetValueSrc = config.widgets[widget].valueSrc || 'value';
            let canAdd = widgetConfig.operators ? widgetConfig.operators.indexOf(operator) != -1 : valueSrc != 'value';
            canAdd = canAdd && (!valueSrc || valueSrc == widgetValueSrc);
            if (opConfig.isUnary && (widgetValueSrc != 'value'))
                canAdd = false;
            if (canAdd) {
                widgets.push(widget);
                if (fieldConfig.valueSources && fieldConfig.valueSources.indexOf(widgetValueSrc) != -1 && !valueSrcs.find(v => v == widgetValueSrc))
                    valueSrcs.push(widgetValueSrc);
            }
        }
    }
    widgets.sort((w1, w2) => {
        let w1Main = fieldConfig.preferWidgets ? fieldConfig.preferWidgets.indexOf(w1) != -1 : w1 == fieldConfig.mainWidget;
        let _w2Main = fieldConfig.preferWidgets ? fieldConfig.preferWidgets.indexOf(w2) != -1 : w2 == fieldConfig.mainWidget;
        if (w1 != w2) {
            return w1Main ? -1 : +1;
        }
        return 0;
    });
    
    return {widgets, valueSrcs};
};

export const getWidgetsForFieldOp = (config, field, operator, valueSrc = null) => {
    const {widgets} = _getWidgetsAndSrcsForFieldOp(config, field, operator, valueSrc);
    return widgets;
};

export const getValueSourcesForFieldOp = (config, field, operator) => {
    const {valueSrcs} = _getWidgetsAndSrcsForFieldOp(config, field, operator, null);
    return valueSrcs;
};

export const getWidgetForFieldOp = (config, field, operator, valueSrc = null) => {
    const {widgets} = _getWidgetsAndSrcsForFieldOp(config, field, operator, valueSrc);
    let widget = null;
    if (widgets.length)
        widget = widgets[0];
    return widget;
};
