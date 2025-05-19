import { Utils, Config } from "@react-awesome-query-builder/ui";
import { createTheme, ThemeOptions, Theme } from "@material-ui/core/styles";

const { setOpacityForHex, generateCssVarsForLevels, chroma } = Utils.ColorUtils;
const { logger } = Utils.OtherUtils;

const buildTheme = (config: Config): Theme | null => {
  const themeMode = config.settings.themeMode ?? "light";
  // const compactMode = config.settings.compactMode;
  // const momentLocale = config.settings.locale?.moment;
  const themeConfig = config.settings.theme?.material;
  const localeConfig = config.settings.locale?.material;
  const isFullTheme = (t?: Partial<Theme>) => !!t?.shadows;
  const canCreateTheme = !!themeConfig || config.settings.themeMode || localeConfig;
  if (!canCreateTheme) {
    return null;
  }
  if (isFullTheme(themeConfig as Partial<Theme>)) {
    return themeConfig as Theme;
  }
  const simpleTheme: ThemeOptions = {
    palette: {
      type: themeMode,
    }
  };
  const themeOptions = themeConfig ? {
    ...themeConfig,
    palette: {
      ...themeConfig.palette,
      ...(config.settings.themeMode ? { type: themeMode } : {}),
    }
  } : simpleTheme;
  return createTheme(
    themeOptions,
    localeConfig ?? {}
  );
};

const themeToCssVars = (theme: Theme) => {
  logger.log("themeToCssVars - Material theme", theme);
  const { palette, typography, shadows, shape } = theme;
  const darkMode = palette.type === "dark";
  return {
    "--main-background": palette.background.paper,
    "--rule-background": darkMode ? palette.background.paper : palette.background.paper,
    "--group-background": darkMode ? setOpacityForHex(palette.grey[900], 0.8) : setOpacityForHex(palette.grey[500], 0.1),
    "--rulegroup-background": darkMode ? setOpacityForHex(palette.grey[900], 0.3) : setOpacityForHex(palette.grey[400], 0.1),
    "--rulegroupext-background": darkMode ? setOpacityForHex(palette.grey[900], 0.3) : setOpacityForHex(palette.grey[400], 0.1),
    "--switch-background": darkMode ? setOpacityForHex(palette.grey[900], 0.8) : setOpacityForHex(palette.grey[400], 0.1),
    "--case-background": darkMode ? setOpacityForHex(palette.grey[900], 0.8) : setOpacityForHex(palette.grey[500], 0.1),

    ...generateCssVarsForLevels(darkMode, "--group-background", palette.background.paper, undefined, 0.1, 0.01),
    ...generateCssVarsForLevels(darkMode, "--rulegroup-background", chroma(palette.background.paper).hex(), undefined, 0.1, 0.01),
    ...generateCssVarsForLevels(darkMode, "--rulegroupext-background", palette.background.paper, undefined, 0.1, 0.01),
    ...generateCssVarsForLevels(darkMode, "--switch-background", palette.background.paper, undefined, 0.1, 0.01),
    ...generateCssVarsForLevels(darkMode, "--case-background", palette.background.paper, undefined, 0.1, 0.01),

    "--rule-border-color": darkMode ? palette.action.selected : palette.action.selected,
    "--group-border-color": darkMode ? palette.action.selected : palette.action.selected,
    "--rulegroup-border-color": darkMode ? palette.action.selected : palette.action.selected,
    "--rulegroupext-border-color": darkMode ? palette.action.selected : palette.action.selected,
    "--switch-border-color": darkMode ? palette.action.selected : palette.action.selected,
    "--case-border-color": darkMode ? palette.action.selected : palette.action.selected,

    "--treeline-color": palette.primary.main,
    "--treeline-switch-color": palette.secondary.main,

    "--main-text-color": palette.text.secondary,
    "--main-font-family": typography.fontFamily,
    "--main-font-size": typography.fontSize + "px",
    "--item-radius": shape.borderRadius + "px",

    "--rule-shadow-hover": shadows[1],
    "--group-shadow-hover": shadows[1],
    "--rulegroup-shadow-hover": shadows[1],
    "--rulegroupext-shadow-hover": shadows[1],
  } as Record<string, string>;
};

export {
  buildTheme,
  themeToCssVars,
};
