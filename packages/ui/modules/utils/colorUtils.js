import {default as chroma} from "chroma-js";

export const setColorOpacity = (color, alpha) => chroma(color).alpha(alpha).hex();

export const generateCssVarsForLevels = (
  isDark, cssVar, baseColor, baseDarkColor = undefined
) => {
  const maxLevel = 20;
  const maxRatio = isDark ? 0.2 : 0.85;
  return Object.fromEntries(Array.from({length: maxLevel + 1}, (_v, k) => k).map(lev => {
    const k =  `${cssVar}-${lev}`;
    const chr = chroma(isDark ? (baseDarkColor ?? baseColor) : baseColor);
    const ratio = ((lev + 1) / (maxLevel + 1)) * maxRatio;
    const chr2 = isDark ? chr.tint(ratio) : chr.shade(ratio);
    const v = chr2.hex();
    return [k, v];
  }));
};

export const isDarkColor = (color) => {
  if (!color || color === "transparent")
    return undefined;
  // const lightness = chroma(color).get("lab.l");
  // return lightness < 70;
  const luminance = chroma(color).luminance();
  return luminance < 0.5;
};

export const isColor = (color) => {
  try {
    chroma(color);
    return true;
  } catch {
    return false;
  }
};

export {
  chroma,
};
