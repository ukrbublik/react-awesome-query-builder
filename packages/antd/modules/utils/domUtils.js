export const SELECT_WIDTH_OFFSET_RIGHT = 48;
const DEFAULT_FONT_SIZE = "14px";
const DEFAULT_FONT_FAMILY = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export const BUILT_IN_PLACEMENTS = {
  bottomLeft: {
    points: ["tl", "bl"],
    offset: [0, 4],
    overflow: {
      adjustX: 0,
      adjustY: 1,
    },
  },
  bottomRight: {
    points: ["tr", "br"],
    offset: [0, 4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
  topLeft: {
    points: ["bl", "tl"],
    offset: [0, -4],
    overflow: {
      adjustX: 0,
      adjustY: 1,
    },
  },
  topRight: {
    points: ["br", "tr"],
    offset: [0, -4],
    overflow: {
      adjustX: 1,
      adjustY: 1,
    },
  },
};

export const calcTextWidth = function(str, fontFamily = DEFAULT_FONT_FAMILY, fontSize = DEFAULT_FONT_SIZE) {
  var div = document.createElement("div");
  div.innerHTML = str;
  var css = {
    "position": "absolute", "float": "left", "white-space": "nowrap", "visibility": "hidden", 
    "font-size": fontSize, "font-family": fontFamily
  };
  for (let k in css) {
    div.style[k] = css[k];
  }
  div = document.body.appendChild(div);
  var w = div.offsetWidth;
  document.body.removeChild(div);
  return w;
};
