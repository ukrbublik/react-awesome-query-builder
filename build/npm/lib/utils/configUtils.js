'use strict';

exports.__esModule = true;
exports.getValueLabel = exports.getFieldPathLabels = exports.getFieldPath = exports.getFirstOperator = exports.getOperatorsForField = exports.getFirstField = exports.getFieldConfig = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _last = require('lodash/last');

var _last2 = _interopRequireDefault(_last);

var _pick = require('lodash/pick');

var _pick2 = _interopRequireDefault(_pick);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getFieldConfig = exports.getFieldConfig = function getFieldConfig(field, config) {
    if (!field || field == ':empty:') return null;
    var fieldSeparator = config.settings.fieldSeparator;
    var parts = field.split(fieldSeparator);
    var fields = config.fields;
    var fieldConfig = null;
    for (var i = 0; i < parts.length; i++) {
        var part = parts[i];
        var tmpFieldConfig = fields[part];
        if (!tmpFieldConfig) throw new Error("Can't find field " + field + ", please check your config");
        if (i == parts.length - 1) {
            fieldConfig = tmpFieldConfig;
        } else {
            fields = tmpFieldConfig.subfields;
            if (!fields) throw new Error("Can't find field " + field + ", please check your config");
        }
    }

    var widgetConfig = config.widgets[fieldConfig.widget] || {};
    return Object.assign({}, (0, _pick2.default)(widgetConfig, ['operators', 'defaultOperator', 'hideOperator', 'operatorLabel']), fieldConfig || {});
};

var getFirstField = exports.getFirstField = function getFirstField(config) {
    var fieldSeparator = config.settings.fieldSeparator;
    var firstField = null,
        key = null,
        keysPath = [];
    if (Object.keys(config.fields).length > 0) {
        key = Object.keys(config.fields)[0];
        firstField = config.fields[key];
        keysPath.push(key);
        while (firstField.widget == '!struct') {
            var subfields = firstField.subfields;
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

var getOperatorsForField = exports.getOperatorsForField = function getOperatorsForField(config, field) {
    var fieldConfig = getFieldConfig(field, config);
    var fieldOps = fieldConfig.operators;
    return fieldOps;
};

var getFirstOperator = exports.getFirstOperator = function getFirstOperator(config, field) {
    var fieldOps = getOperatorsForField(config, field);
    return fieldOps ? fieldOps[0] : null;
};

var getFieldPath = exports.getFieldPath = function getFieldPath(field, config) {
    if (!field || field == ':empty:') return null;
    var fieldSeparator = config.settings.fieldSeparator;
    return field.split(fieldSeparator).map(function (curr, ind, arr) {
        return arr.slice(0, ind + 1);
    }).map(function (parts) {
        return parts.join(fieldSeparator);
    });
};

var getFieldPathLabels = exports.getFieldPathLabels = function getFieldPathLabels(field, config) {
    if (!field || field == ':empty:') return null;
    var fieldSeparator = config.settings.fieldSeparator;
    return field.split(fieldSeparator).map(function (curr, ind, arr) {
        return arr.slice(0, ind + 1);
    }).map(function (parts) {
        return parts.join(fieldSeparator);
    }).map(function (part) {
        var cnf = getFieldConfig(part, config);
        return cnf && cnf.label || (0, _last2.default)(part.split(fieldSeparator));
    });
};

var getValueLabel = exports.getValueLabel = function getValueLabel(config, field, operator, delta) {
    var fieldConfig = getFieldConfig(field, config);
    var widgetConfig = config.widgets[fieldConfig.widget] || {};
    var opConfig = config.operators[operator];
    var cardinality = opConfig.cardinality;
    var ret = null;
    if (cardinality > 1) {
        var valueLabels = opConfig.valueLabels;
        if (valueLabels) ret = valueLabels[delta];
        if (ret && (typeof ret === 'undefined' ? 'undefined' : _typeof(ret)) != 'object') {
            ret = { label: ret, palceholder: ret };
        }
        if (!ret) {
            ret = {
                label: (config.settings.valueLabel || "Value") + " " + (delta + 1),
                palceholder: (config.settings.valuePlaceholder || "Value") + " " + (delta + 1)
            };
        }
    } else {
        ret = {
            label: fieldConfig.valueLabel || widgetConfig.valueLabel || config.settings.valueLabel || "Value",
            placeholder: fieldConfig.valuePlaceholder || widgetConfig.valuePlaceholder || config.settings.valuePlaceholder || "Value"
        };
    }

    return ret;
};