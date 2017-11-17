import mapValues from 'lodash/mapValues';


// RegExp.quote = function (str) {
//     return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
// };


export const defaultValue = (value, _default) => {
    return (typeof value === "undefined") ? _default || undefined : value
}


export const bindActionCreators = (actionCreators, config, dispatch) =>
  mapValues(actionCreators, (actionCreator) =>
    (...args) => dispatch(actionCreator(config, ...args))
  );


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

export const truncateString = (str, n, useWordBoundary) => {
    if (str.length <= n) { return str; }
    var subString = str.substr(0, n-1);
    return (useWordBoundary 
       ? subString.substr(0, subString.lastIndexOf(' ')) 
       : subString) + "...";
}


//Do sets have same values?
export const eqSet = function (as, bs) {
    if (as.size !== bs.size) return false;
    for (var a of as) if (!bs.has(a)) return false;
    return true;
};


//Do arrays have same values?
export const eqArrSet = function (arr1, arr2) {
    return eqSet(new Set(arr1), new Set(arr2));
};

