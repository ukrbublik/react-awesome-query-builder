// https://ant.design/docs/react/customize-theme

import { Utils, RenderSize, Config, ThemeMode, CssVars } from "@react-awesome-query-builder/ui";
import { theme as antdTheme, ConfigProviderProps, GlobalToken } from "antd";
import omitBy from "lodash/omitBy";
import pickBy from "lodash/pickBy";

type Algorithm = typeof antdTheme["darkAlgorithm"] | typeof antdTheme["defaultAlgorithm"];
type ThemeConfig = ConfigProviderProps["theme"];
type Theme = ReturnType<typeof antdTheme.useToken>["theme"];
type SeedToken = Parameters<typeof antdTheme["defaultAlgorithm"]>[0];
type MapToken = ReturnType<typeof antdTheme["defaultAlgorithm"]>;

const { logger, isTruthy } = Utils.OtherUtils;
const { setOpacityForHex, generateCssVarsForLevels, chroma, isDarkColor, isColor } = Utils.ColorUtils;

const buildAlgorithms = (darkMode: boolean, compactMode: boolean) => {
  const algorithms: Algorithm[] = [
    darkMode && antdTheme.darkAlgorithm,
    compactMode && antdTheme.compactAlgorithm,
    // (!compactMode && !darkMode && antdTheme.defaultAlgorithm),
  ].filter(isTruthy);
  // const palette = algorithms.reduce(
  //   (tkns, algo, i) => i === 0 ? algo(tkns) : algo({} as SeedToken, tkns as MapToken),
  //   antdTheme.defaultSeed
  // ) as MapToken;
  return { algorithms };
};

const detectTokenThemeMode = (token: GlobalToken | undefined): ThemeMode | undefined => {
  if (!token) {
    return undefined;
  }
  return isDarkColor(token.colorBgBase) ? "dark" : "light";
};

// // Not accurate!
// const filterOutColorTokens = (token: GlobalToken) => {
//   return omitBy(token, (_tokenValue: string, tokenName: keyof GlobalToken) => {
//     return tokenName.startsWith("colorText")
//       || tokenName.startsWith("colorBg")
//       || tokenName.startsWith("colorFill")
//       || tokenName.startsWith("colorBorder")
//       || tokenName as string === "_tokenKey"
//     ;
//   }) as GlobalToken;
// };

const filterBasicTokens = (token: GlobalToken) => {
  return pickBy(token, (tokenValue: string | number | boolean, tokenName: keyof GlobalToken) => {
    return (
      // preserve primary color!
      tokenName === "colorPrimary"
      // seed color tokens - seems fine to reuse
      || [
        "colorInfo",
        "colorSuccess",
        "colorWarning",
        "colorError",
        "colorLink",
      ].includes(tokenName)
      // non-color tokens
      || tokenName.startsWith("boxShadow")
      || tokenName.startsWith("font")
      || tokenName.startsWith("lineType")
      || tokenName.startsWith("motion")
      || typeof tokenValue !== "string"
    );
  }) as GlobalToken;
};


const filterTokens = (token: GlobalToken) => {
  // return filterOutColorTokens(token);
  return filterBasicTokens(token);
};

export const mergeThemes = (themeMode: ThemeMode | undefined, _existingTheme: Theme, existingToken: GlobalToken | undefined, themeConfig: ThemeConfig | undefined, algorithms: Algorithm[]) => {
  const tokenThemeMode = detectTokenThemeMode(existingToken);
  const canInheritToken = !themeMode || !existingToken || themeMode == tokenThemeMode;
  const filteredExistingToken = existingToken ? filterTokens(existingToken) : undefined;
  const mergedTheme: ThemeConfig = {
    ...(algorithms.length ? { algorithm: algorithms } : {}),
    ...(existingToken ? { token: filteredExistingToken } : {}),
    inherit: canInheritToken,
    ...(themeConfig ? themeConfig : {}),
  };
  logger.log("mergeThemes - antd", {
    canInheritToken,
    themeMode,
    existingToken,
    filteredExistingToken,
    themeConfig,
    mergedTheme,
  });
  return mergedTheme;
};

const generateCssVars = (token: GlobalToken, config: Config) => {
  logger.log("generateCssVars - antd token", token);
  const darkMode = isDarkColor(token.colorBgBase);
  const renderSize = config.settings.renderSize;
  const useThickLeftBorderOnHoverItem = config.settings.designSettings?.useThickLeftBorderOnHoverItem ?? false;
  const useShadowOnHoverItem = config.settings.designSettings?.useShadowOnHoverItem ?? false;

  let sizedBorderRadius;
  switch (renderSize) {
  case "large":
    sizedBorderRadius = token?.borderRadiusLG ?? token?.borderRadius;
    break;
  case "small": 
    sizedBorderRadius = token?.borderRadiusSM ?? token?.borderRadius;
    break;
  case "medium":
  default:
    sizedBorderRadius = token?.borderRadius;
    break;
  }

  let cssVars: CssVars = {
    "--main-background": token.colorBgBase,
    "--rule-background": token.colorBgElevated,
    "--group-background": darkMode ? token.colorBgMask : token.colorFillQuaternary,
    "--rulegroup-background": darkMode ? token.colorBgSpotlight : token.colorBgLayout,
    "--rulegroupext-background": darkMode ? token.colorBgSpotlight : token.colorBgLayout,
    "--switch-background": darkMode ? token.colorBgMask : token.colorFillQuaternary,
    "--case-background": darkMode ? token.colorBgMask : token.colorFillQuaternary,

    ...generateCssVarsForLevels(darkMode, "--group-background", token.colorBgContainer, undefined, 0.1, 0.01),
    ...generateCssVarsForLevels(darkMode, "--rulegroup-background", chroma(token.colorBgContainer).hex(), undefined, 0.1, 0.01),
    ...generateCssVarsForLevels(darkMode, "--rulegroupext-background", token.colorBgContainer, undefined, 0.1, 0.01),
    ...generateCssVarsForLevels(darkMode, "--switch-background", token.colorBgContainer, undefined, 0.1, 0.01),
    ...generateCssVarsForLevels(darkMode, "--case-background", token.colorBgContainer, undefined, 0.1, 0.01),

    "--rule-border-color": token.colorBorderSecondary,
    "--group-border-color": token.colorBorder,
    "--rulegroup-border-color": token.colorBorder,
    "--rulegroupext-border-color": token.colorBorder,
    "--switch-border-color": token.colorBorderSecondary,
    "--case-border-color": token.colorBorder,

    "--treeline-color": darkMode ? token.colorPrimaryHover : token.colorPrimaryHover,
    "--treeline-switch-color": darkMode ? token.colorInfo : token.colorInfo,
    "--treeline-disabled-color": token.colorFillSecondary,

    "--main-text-color": token.colorText,
    "--main-font-family": token.fontFamily,
    "--main-font-size": token.fontSize + "px",

    "--item-radius": sizedBorderRadius + "px",
    "--conjunctions-radius": sizedBorderRadius + "px",
  } as Record<string, string>;

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
      "--rule-shadow-hover": token.boxShadowTertiary,
      "--group-shadow-hover": token.boxShadowTertiary,
      "--rulegroup-shadow-hover": token.boxShadowTertiary,
      "--rulegroupext-shadow-hover": token.boxShadowTertiary,
    };
  }

  return cssVars;
};

export {
  buildAlgorithms,
  generateCssVars,
};
