import { Utils, Config } from "@react-awesome-query-builder/ui";

const { setOpacityForHex, generateCssVarsForLevels, chroma } = Utils.ColorUtils;
const { logger } = Utils.OtherUtils;

const themeToCssVars = (isDark: boolean) => {
  return {
  } as Record<string, string>;
};

export {
  themeToCssVars,
};
