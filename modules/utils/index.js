'use strict';
export {queryBuilderFormat, queryBuilderToTree} from './queryBuilderFormat'
export {getFieldConfig, getFieldPath, getFieldPathLabels, getValueLabel} from './configUtils';

import en_US from 'antd/lib/locale-provider/en_US';
import ru_RU from 'antd/lib/locale-provider/ru_RU';
const antLocales = {
    en_US: en_US,
    ru_RU: ru_RU,
};

RegExp.quote = function (str) {
    return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
};

export const defaultValue = (value, _default) => {
    return (typeof value === "undefined") ? _default || undefined : value
}

export const getAntLocales = () => {
    return antLocales;
};

export const getAntLocale = (full2) => {
    return antLocales[full2];
};

export const calcTextWidth = function(str, font) {
  var f = font || '12px arial',
      o = $('<div>' + str + '</div>')
            .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
            .appendTo($('body')),
      w = o.width();

  o.remove();

  return w;
}
