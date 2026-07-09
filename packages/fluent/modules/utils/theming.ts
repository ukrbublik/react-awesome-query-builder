// https://developer.microsoft.com/en-us/fluentui#/controls/web/themeprovider

import { Utils, Config, ThemeMode, CssVars } from "@react-awesome-query-builder/ui";
import { Theme, PartialTheme, css, createTheme, mergeThemes } from "@fluentui/react";
import mergeWith from "lodash/mergeWith";
import omit from "lodash/omit";
//import pick from "lodash/pick";

const { setColorOpacity, generateCssVarsForLevels, chroma, isDarkColor } = Utils.ColorUtils;
const { logger, isTruthy } = Utils.OtherUtils;

const darkTheme: PartialTheme = {
  // https://github.com/microsoft/fluentui/issues/9795#issuecomment-511882323
  palette: {
    neutralLighterAlt: "#282828",
    neutralLighter: "#313131",
    neutralLight: "#3f3f3f",
    neutralQuaternaryAlt: "#484848",
    neutralQuaternary: "#4f4f4f",
    neutralTertiaryAlt: "#6d6d6d",
    neutralTertiary: "#c8c8c8",
    neutralSecondary: "#d0d0d0",
    neutralPrimaryAlt: "#dadada",
    neutralPrimary: "#ffffff",
    neutralDark: "#f4f4f4",
    black: "#f8f8f8",
    white: "#1f1f1f",
    themePrimary: "#3a96dd",
    themeLighterAlt: "#020609",
    themeLighter: "#091823",
    themeLight: "#112d43",
    themeTertiary: "#235a85",
    themeSecondary: "#3385c3",
    themeDarkAlt: "#4ba0e1",
    themeDark: "#65aee6",
    themeDarker: "#8ac2ec",
    accent: "#3a96dd"
  }
};

const detectThemeMode = (theme?: Theme): ThemeMode | undefined => {
  if (!theme) {
    return undefined;
  }
  return isDarkColor(theme.semanticColors.inputBackground) ? "dark" : "light";
};

const filterBasicTheme = (theme: PartialTheme): PartialTheme => {
  return {
    ...theme,
    palette: {
      ...omit(
        theme.palette,
        [
          "themePrimary", "themeSecondary", "themeTertiary",
          "themeLighterAlt", "themeLighter", "themeLight",
          "themeDarkAlt", "themeDark", "themeDarker",
        ]
      ),
    }
  };
};

const buildTheme = (config: Config, existingTheme?: Theme): PartialTheme | undefined => {
  const themeMode = config.settings.themeMode;
  const darkMode = themeMode === "dark";
  const themeConfig = config.settings.theme?.fluent as PartialTheme | undefined;
  const existingThemeMode = detectThemeMode(existingTheme);

  const canCreateTheme = !!themeConfig || darkMode;
  if (!canCreateTheme) {
    return undefined;
  }

  const themeForMode = themeMode === "dark" ? darkTheme : undefined;

  const filteredExistingTheme = existingTheme ? {
    ...omit(existingTheme, ["id"]),
  } : undefined as Theme | undefined;

  const filteredThemeForMode = themeForMode && existingThemeMode && existingThemeMode != themeMode
    ? filterBasicTheme(themeForMode)
    : undefined;

  const themesToMerge = [
    filteredExistingTheme,
    filteredThemeForMode,
    themeConfig,
  ].filter(isTruthy);

  const mergedTheme = themesToMerge.reduce((acc: Theme | undefined, theme: Theme | PartialTheme) => {
    return acc ? mergeThemes(acc as Theme, theme) : theme as Theme;
  }, undefined) as Theme;

  // logger.log("buildTheme - fluent", {
  //   filteredExistingTheme,
  //   filteredThemeForMode,
  //   existingThemeMode,
  //   themeConfig,
  //   mergedTheme,
  // });

  return mergedTheme;
};

const generateCssVars = (theme: Theme, config: Config) => {
  // logger.log("generateCssVars - Fluent theme", theme);
  const { fonts, effects, semanticColors } = theme;
  const darkMode = isDarkColor(semanticColors.bodyBackground) ?? isDarkColor(semanticColors.inputBackground) ?? false;
  const useThickLeftBorderOnHoverItem = config.settings.designSettings?.useThickLeftBorderOnHoverItem ?? false;
  const useShadowOnHoverItem = config.settings.designSettings?.useShadowOnHoverItem ?? false;

  let cssVars: CssVars = {
    "--main-background": semanticColors.bodyBackground,

    "--rule-background": semanticColors.cardStandoutBackground,
    // "--group-background": semanticColors.menuItemBackgroundHovered,
    // "--rulegroup-background": semanticColors.defaultStateBackground,
    // "--rulegroupext-background": semanticColors.defaultStateBackground,
    // "--switch-background": semanticColors.defaultStateBackground,
    // "--case-background": semanticColors.defaultStateBackground,
    // level-based background colors
    ...generateCssVarsForLevels(darkMode, "--group-background", semanticColors.defaultStateBackground),
    ...generateCssVarsForLevels(darkMode, "--rulegroup-background", semanticColors.defaultStateBackground),
    ...generateCssVarsForLevels(darkMode, "--rulegroupext-background", semanticColors.defaultStateBackground),
    ...generateCssVarsForLevels(darkMode, "--switch-background", semanticColors.defaultStateBackground),
    ...generateCssVarsForLevels(darkMode, "--case-background", semanticColors.defaultStateBackground),

    "--rule-border-color": semanticColors.variantBorder,
    "--group-border-color": darkMode ? chroma(semanticColors.inputBorder).alpha(0.3).hex() : chroma(semanticColors.inputBorder).alpha(0.3).hex(),
    "--rulegroup-border-color": semanticColors.disabledBorder,
    "--rulegroupext-border-color": semanticColors.disabledBorder,
    "--switch-border-color": semanticColors.disabledBorder,
    "--case-border-color": semanticColors.buttonBorder,

    "--treeline-color": semanticColors.accentButtonBackground,
    "--treeline-switch-color": semanticColors.inputBackgroundCheckedHovered,

    "--main-text-color": semanticColors.bodyText,
    "--main-font-family": fonts.medium.fontFamily,
    "--main-font-size": fonts.medium.fontSize,
    "--item-radius": effects.roundedCorner2,
  } as Record<string, string>;

  if(useShadowOnHoverItem) {
    cssVars = {
      ...cssVars,
      "--rule-shadow-hover": effects.elevation4,
      "--group-shadow-hover": effects.elevation4,
      "--rulegroup-shadow-hover": effects.elevation4,
      "--rulegroupext-shadow-hover": effects.elevation4,
    };
  }

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
  buildTheme,
  generateCssVars,
};
