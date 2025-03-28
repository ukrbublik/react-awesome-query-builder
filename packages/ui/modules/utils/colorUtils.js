import {default as chroma} from "chroma-js";

export const setOpacityForHex = (hex, alpha) => `${hex}${Math.floor(alpha * 255).toString(16).padStart(2, 0)}`;

export const generateCssVarsForLevels = (isDark, cssVar, baseColor, baseDarkColor = undefined, lightRatio = 0.1, darkRatio = 0.02, maxLevel = 20, minLevel = 0) => {
  return Object.fromEntries(Array.from({length: maxLevel}, (_v, k) => k).filter(lev => lev >= minLevel).map(lev => [
    `${cssVar}-${lev}`,
    isDark
      ? chroma(baseDarkColor ?? baseColor).tint((minLevel === 0 ? lev + 1 : lev) * darkRatio).hex()
      : chroma(baseColor).shade((minLevel === 0 ? lev + 1 : lev) * lightRatio).hex(),
  ]));
};

export {
  chroma,
};
