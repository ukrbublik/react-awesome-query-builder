'use strict';
export {queryBuilderFormat, queryBuilderToTree} from './queryBuilderFormat'
export {queryString} from './queryString'
export {
  getFieldConfig, getFieldPath, getFieldPathLabels, getValueLabel, extendConfig, 
  getFieldWidgetConfig, getOperatorConfig, getWidgetsForFieldOp, getWidgetForFieldOp
} from './configUtils';

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

//jQuery variant
export const _calcTextWidth = function(str, font) {
  var f = font || '12px',
      o = $('<div>' + str + '</div>')
            .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
            .appendTo($('body')),
      w = o.width();

  o.remove();

  return w;
}

//vanilla variant
export const calcTextWidth = function(str, font) {
  var f = font || '12px';
  var div = document.createElement("div");
  div.innerHTML = str;
  var css = {
    'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f
  };
  for (let k in css) {
    div.style[k] = css[k];
  }
  div = document.body.appendChild(div);
  var w = div.offsetWidth;
  div.remove();
  return w;
}

