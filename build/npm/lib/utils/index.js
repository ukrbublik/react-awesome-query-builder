'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

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
var defaultValue = exports.defaultValue = function defaultValue(value, _default) {
    return typeof value === "undefined" ? _default || undefined : value;
};