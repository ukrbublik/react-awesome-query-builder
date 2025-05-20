import { Utils, Config } from "@react-awesome-query-builder/ui";
import { Theme, PartialTheme, css, createTheme, mergeThemes } from "@fluentui/react";
import mergeWith from "lodash/mergeWith";
import omit from "lodash/omit";
//import pick from "lodash/pick";

const { setOpacityForHex, generateCssVarsForLevels, chroma, isDarkColor } = Utils.ColorUtils;
const { logger, isTruthy } = Utils.OtherUtils;

// https://developer.microsoft.com/en-us/fluentui#/controls/web/themeprovider
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


const buildTheme = (config: Config, existingTheme?: Theme): PartialTheme | undefined => {
  const themeMode = config.settings.themeMode;
  const darkMode = themeMode === "dark";
  const themeConfig = config.settings.theme?.fluent as PartialTheme | undefined;

  const canCreateTheme = !!themeConfig || darkMode;
  if (!canCreateTheme) {
    return undefined;
  }

  const themeForMode = themeMode === "dark" ? darkTheme : undefined;

  const filteredExistingTheme = existingTheme ? {
    ...omit(existingTheme, ["id"]),
  } : undefined as Theme | undefined;

  // todo: don't use themeForMode if existingTheme is already dark (check with isDarkColor)
  const filteredThemeForMode = themeForMode && existingTheme ? {
    ...themeForMode,
    palette: {
      ...omit(
        themeForMode.palette,
        [
          "themePrimary", "themeSecondary", "themeTertiary", "themeLighterAlt", "themeLighter", "themeLight", "themeDarkAlt", "themeDark", "themeDarker",
        ]
      ),
    }
  } : undefined as Theme | undefined;

  const themesToMerge = [
    filteredExistingTheme,
    filteredThemeForMode,
    themeConfig,
  ].filter(isTruthy);

  const mergedTheme = themesToMerge.reduce((acc: Theme | undefined, theme: Theme | PartialTheme) => {
    return acc ? mergeThemes(acc as Theme, theme) : theme as Theme;
  }, undefined) as Theme;

  return mergedTheme;
};

const generateCssVars = (theme: Theme, config: Config) => {
  logger.log("generateCssVars - Fluent theme", theme);
  const { fonts, effects, semanticColors } = theme;
  const darkMode = isDarkColor(semanticColors.bodyBackground);
  const useThickLeftBorderOnHoverItem = config.settings.designSettings?.useThickLeftBorderOnHoverItem ?? false;
  const useShadowOnHoverItem = config.settings.designSettings?.useShadowOnHoverItem ?? false;

  let cssVars = {
    "--rule-background": semanticColors.cardStandoutBackground,
    "--group-background": semanticColors.menuItemBackgroundHovered,
    "--rulegroup-background": semanticColors.defaultStateBackground,
    "--rulegroupext-background": semanticColors.defaultStateBackground,
    "--switch-background": semanticColors.defaultStateBackground,
    "--case-background": semanticColors.defaultStateBackground,

    "--rule-border-color": semanticColors.variantBorder,
    "--group-border-color": semanticColors.inputBorder,
    "--rulegroup-border-color": semanticColors.disabledBorder,
    "--rulegroupext-border-color": semanticColors.disabledBorder,
    "--switch-border-color": semanticColors.disabledBorder,
    "--case-border-color": semanticColors.inputFocusBorderAlt,

    "--treeline-color": semanticColors.accentButtonBackground,
    "--treeline-switch-color": semanticColors.accentButtonBackground,

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
      "--rule-border-left-hover": "2px",
      "--group-border-left-hover": "2px",
      "--rulegroup-border-left-hover": "2px",
      "--rulegroupext-border-left-hover": "2px",
    };
  }

  return cssVars;
};

export {
  buildTheme,
  generateCssVars,
};
