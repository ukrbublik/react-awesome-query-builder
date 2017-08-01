'use strict';

exports.__esModule = true;
exports.calcTextWidth = exports.getAntLocale = exports.getAntLocales = exports.defaultValue = exports.getValueLabel = exports.getFieldPathLabels = exports.getFieldPath = exports.getFieldConfig = exports.queryBuilderToTree = exports.queryBuilderFormat = undefined;

var _queryBuilderFormat = require('./queryBuilderFormat');

Object.defineProperty(exports, 'queryBuilderFormat', {
    enumerable: true,
    get: function get() {
        return _queryBuilderFormat.queryBuilderFormat;
    }
});
Object.defineProperty(exports, 'queryBuilderToTree', {
    enumerable: true,
    get: function get() {
        return _queryBuilderFormat.queryBuilderToTree;
    }
});

var _configUtils = require('./configUtils');

Object.defineProperty(exports, 'getFieldConfig', {
    enumerable: true,
    get: function get() {
        return _configUtils.getFieldConfig;
    }
});
Object.defineProperty(exports, 'getFieldPath', {
    enumerable: true,
    get: function get() {
        return _configUtils.getFieldPath;
    }
});
Object.defineProperty(exports, 'getFieldPathLabels', {
    enumerable: true,
    get: function get() {
        return _configUtils.getFieldPathLabels;
    }
});
Object.defineProperty(exports, 'getValueLabel', {
    enumerable: true,
    get: function get() {
        return _configUtils.getValueLabel;
    }
});

var _en_US = require('antd/lib/locale-provider/en_US');

var _en_US2 = _interopRequireDefault(_en_US);

var _ru_RU = require('antd/lib/locale-provider/ru_RU');

var _ru_RU2 = _interopRequireDefault(_ru_RU);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var antLocales = {
    en_US: _en_US2.default,
    ru_RU: _ru_RU2.default
};

RegExp.quote = function (str) {
    return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
};

var defaultValue = exports.defaultValue = function defaultValue(value, _default) {
    return typeof value === "undefined" ? _default || undefined : value;
};

var getAntLocales = exports.getAntLocales = function getAntLocales() {
    return antLocales;
};

var getAntLocale = exports.getAntLocale = function getAntLocale(full2) {
    return antLocales[full2];
};

var calcTextWidth = exports.calcTextWidth = function calcTextWidth(str, font) {
    var f = font || '12px arial',
        o = $('<div>' + str + '</div>').css({ 'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f }).appendTo($('body')),
        w = o.width();

    o.remove();

    return w;
};