// https://v4.mui.com/ru/styles/api/

import { Utils, Config, CssVars } from "@react-awesome-query-builder/ui";
import { createTheme, ThemeOptions, Theme } from "@material-ui/core/styles";
import mergeWith from "lodash/mergeWith";
import omit from "lodash/omit";
import pick from "lodash/pick";

type PaletteOptions = NonNullable<ThemeOptions["palette"]>;

const { setColorOpacity, generateCssVarsForLevels, chroma } = Utils.ColorUtils;
const { logger } = Utils.OtherUtils;

const filterBasicTheme = (theme: Theme) => {
  const filteredPalette: PaletteOptions = omit(theme.palette, [
    "background", "text", "divider", "action",
  ]);
  // filteredPalette = pick(filteredPalette, [
  //   "primary", "secondary", "error", "warning", "info", "success"
  // ]);
  return {
    ...theme,
    palette: filteredPalette,
  } as ThemeOptions;
};

const buildTheme = (config: Config, existingTheme?: Theme): Theme | null => {
  const themeMode = config.settings.themeMode;
  // const compactMode = config.settings.compactMode;
  // const momentLocale = config.settings.locale?.moment;
  const themeConfig = config.settings.theme?.material as ThemeOptions | undefined;
  const localeConfig = config.settings.locale?.material;
  const isFullTheme = (t?: Partial<Theme>) => !!t?.shadows && !!t?.palette?.type;
  const canCreateTheme = !!themeConfig || themeMode || localeConfig;
  const existingThemeMode = existingTheme?.palette.type;
  if (!canCreateTheme) {
    return null;
  }

  let mergedThemeOptions: ThemeOptions | undefined = undefined;
  if (isFullTheme(themeConfig as Partial<Theme>)) {
    // override existing theme completely
    mergedThemeOptions = themeConfig;
  } else {
    // merge with existing theme
    const filteredExistingTheme = (
      themeMode && existingTheme && themeMode != existingThemeMode!
        ? filterBasicTheme(existingTheme)
        : existingTheme
    ) as ThemeOptions | undefined;

    mergedThemeOptions = mergeWith({}, 
      filteredExistingTheme ?? {}, 
      themeConfig ?? {},
      themeMode && { palette: { type: themeMode } }
    ) as ThemeOptions;
  }

  return createTheme(
    mergedThemeOptions,
    localeConfig ?? {}
  );
};

const generateCssVars = (theme: Theme, config: Config) => {
  logger.log("generateCssVars - Material theme", theme);
  const { palette, typography, shadows, shape } = theme;
  const darkMode = palette.type === "dark";
  const useThickLeftBorderOnHoverItem = config.settings.designSettings?.useThickLeftBorderOnHoverItem ?? false;
  const useShadowOnHoverItem = config.settings.designSettings?.useShadowOnHoverItem ?? false;
  
  let cssVars: CssVars = {
    "--main-background": palette.background.paper,

    "--rule-background": darkMode ? palette.background.paper : palette.background.paper,
    // level-based background colors
    ...generateCssVarsForLevels(darkMode, "--group-background", palette.background.paper),
    ...generateCssVarsForLevels(darkMode, "--rulegroup-background", palette.background.paper),
    ...generateCssVarsForLevels(darkMode, "--rulegroupext-background", palette.background.paper),
    ...generateCssVarsForLevels(darkMode, "--switch-background", palette.background.paper),
    ...generateCssVarsForLevels(darkMode, "--case-background", palette.background.paper),
    
    "--rule-border-color": darkMode ? palette.divider : chroma(palette.divider).brighten(3).hex(),
    "--group-border-color": darkMode ? palette.divider : palette.divider,
    "--rulegroup-border-color": darkMode ? palette.divider : palette.divider,
    "--rulegroupext-border-color": darkMode ? palette.divider : palette.divider,
    "--switch-border-color": darkMode ? palette.divider : palette.divider,
    "--case-border-color": darkMode ? palette.divider : palette.divider,

    "--treeline-color": palette.primary.main,
    "--treeline-switch-color": palette.secondary.main,

    "--main-text-color": palette.text.primary,
    "--main-font-family": typography.fontFamily,
    "--main-font-size": typography.fontSize + "px",
    "--item-radius": shape.borderRadius + "px",
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
  
  if(useShadowOnHoverItem) {
    cssVars = {
      ...cssVars,
      "--rule-shadow-hover": shadows[2],
      "--group-shadow-hover": shadows[2],
      "--rulegroup-shadow-hover": shadows[2],
      "--rulegroupext-shadow-hover": shadows[2],
    };
  }

  return cssVars;
};

export {
  buildTheme,
  generateCssVars,
};
