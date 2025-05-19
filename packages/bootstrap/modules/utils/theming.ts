import { Utils, Config } from "@react-awesome-query-builder/ui";

const { setOpacityForHex, generateCssVarsForLevels, chroma } = Utils.ColorUtils;
const { logger } = Utils.OtherUtils;

const themeToCssVars = (_: any, config: Config) => {
  const useThickLeftBorderOnHoverItem = config.settings.designSettings?.useThickLeftBorderOnHoverItem ?? true;
  const useShadowOnHoverItem = config.settings.designSettings?.useShadowOnHoverItem ?? false;
  const darkMode = config.settings?.themeMode === "dark";

  return {
    // todo
  } as Record<string, string>;
};

export {
  themeToCssVars,
};
