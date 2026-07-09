import { Utils, Config, CssVars } from "@react-awesome-query-builder/ui";

const { setColorOpacity, generateCssVarsForLevels, chroma } = Utils.ColorUtils;
const { logger } = Utils.OtherUtils;

const generateCssVars = (_: any, config: Config) => {
  const useThickLeftBorderOnHoverItem = config.settings.designSettings?.useThickLeftBorderOnHoverItem ?? false;
  const useShadowOnHoverItem = config.settings.designSettings?.useShadowOnHoverItem ?? false;
  const darkMode = config.settings?.themeMode === "dark";

  let cssVars: CssVars = {
    // any vars we get generate ?
  };

  if (useThickLeftBorderOnHoverItem) {
    cssVars = {
      ...cssVars,
      "--rule-border-left-width-hover": "2px",
      "--group-border-left-width-hover": "2px",
      "--rulegroup-border-left-width-hover": "2px",
      "--rulegroupext-border-left-width-hover": "2px",
    };
  }

  return cssVars;
};

export {
  generateCssVars,
};
