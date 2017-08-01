'use strict';
import last from 'lodash/last';
import pick from 'lodash/pick';

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

    const widgetConfig = config.widgets[fieldConfig.widget] || {};
    return Object.assign({}, 
        pick(widgetConfig, ['operators', 'defaultOperator', 'hideOperator', 'operatorLabel']),
        fieldConfig || {}
    );
};

export const getFirstField = (config) => {
  const fieldSeparator = config.settings.fieldSeparator;
  let firstField = null, key = null, keysPath = [];
  if (Object.keys(config.fields).length > 0) {
    key = Object.keys(config.fields)[0];
    firstField = config.fields[key];
    keysPath.push(key);
    while (firstField.widget == '!struct') {
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

export const getValueLabel = (config, field, operator, delta) => {
    const fieldConfig = getFieldConfig(field, config);
    const widgetConfig = config.widgets[fieldConfig.widget] || {};
    const opConfig = config.operators[operator];
    const cardinality = opConfig.cardinality;
    let ret = null;
    if (cardinality > 1) {
        const valueLabels = opConfig.valueLabels;
        if (valueLabels)
            ret = valueLabels[delta];
        if (ret && typeof ret != 'object') {
            ret = {label: ret, palceholder: ret};
        }
        if (!ret) {
            ret = {
                label: (config.settings.valueLabel || "Value") + " " + (delta+1),
                palceholder: (config.settings.valuePlaceholder || "Value") + " " + (delta+1),
            }
        }
    } else {
        ret = {
            label: fieldConfig.valueLabel || widgetConfig.valueLabel || config.settings.valueLabel || "Value",
            placeholder: fieldConfig.valuePlaceholder || widgetConfig.valuePlaceholder || config.settings.valuePlaceholder || "Value",
        };
    }
    
    return ret;
};
