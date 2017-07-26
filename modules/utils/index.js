'use strict';
export {queryBuilderFormat, queryBuilderToTree} from './queryBuilderFormat'

RegExp.quote = function (str) {
    return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
};

export const defaultValue = (value, _default) => {
    return (typeof value === "undefined") ? _default || undefined : value
}

