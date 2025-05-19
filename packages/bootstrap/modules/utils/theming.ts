import { Utils, Config } from "@react-awesome-query-builder/ui";

const { setOpacityForHex, generateCssVarsForLevels, chroma } = Utils.ColorUtils;
const { logger } = Utils.OtherUtils;

const generateCssVars = (_: any, config: Config) => {
  const useThickLeftBorderOnHoverItem = config.settings.designSettings?.useThickLeftBorderOnHoverItem ?? true;
  const useShadowOnHoverItem = config.settings.designSettings?.useShadowOnHoverItem ?? false;
  const darkMode = config.settings?.themeMode === "dark";

  let cssVars: Record<string, string> = {
    // any vars we get generate ?
  };

  if (useThickLeftBorderOnHoverItem) {
    cssVars = {
      ...cssVars,
      "--rule-border-left-hover": "2px",
      "--group-border-left-hover": "2px",
      "--rulegroup-border-left-hover": "2px",
      "--rulegroupext-border-left-hover": "2px",
    };
  }

  return cssVars;
};

export {
  generateCssVars,
};
