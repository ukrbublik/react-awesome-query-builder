import { Utils, RenderSize } from "@react-awesome-query-builder/ui";
import { theme as antdTheme, ConfigProviderProps } from "antd";

type Theme = ConfigProviderProps["theme"];
type Algorithm = typeof antdTheme["darkAlgorithm"] | typeof antdTheme["defaultAlgorithm"];
type SeedToken = Parameters<typeof antdTheme["defaultAlgorithm"]>[0];
type MapToken = ReturnType<typeof antdTheme["defaultAlgorithm"]>;

const { logger, isTruthy } = Utils.OtherUtils;

const buildPalette = (darkMode: boolean, compactMode: boolean) => {
  const algorithms: Algorithm[] = [
    darkMode && antdTheme.darkAlgorithm,
    compactMode && antdTheme.compactAlgorithm,
    !compactMode && !darkMode && antdTheme.defaultAlgorithm,
  ].filter(isTruthy);
  const palette = algorithms.reduce(
    (tkns, algo, i) => i === 0 ? algo(tkns) : algo({} as SeedToken, tkns as MapToken),
    antdTheme.defaultSeed
  ) as MapToken;
  return { algorithms, palette };
};

const themeToCssVars = (theme: Theme, palette: MapToken, darkMode: boolean, renderSize?: RenderSize) => {
  logger.log("themeToCssVars - antd theme", theme);
  logger.log("themeToCssVars - antd palette", palette);

  let sizedBorderRadius;
  switch (renderSize) {
  case "large":
    sizedBorderRadius = theme?.token?.borderRadiusLG ?? theme?.token?.borderRadius ?? palette.borderRadiusLG;
    break;
  case "small": 
    sizedBorderRadius = theme?.token?.borderRadiusSM ?? theme?.token?.borderRadius ?? palette.borderRadiusSM;
    break;
  case "medium":
  default:
    sizedBorderRadius = theme?.token?.borderRadius ?? palette.borderRadius;
    break;
  }

  return {
    "--main-background": palette.colorBgBase,
    "--rule-background": palette.colorBgElevated,
    "--group-background": darkMode ? palette.colorBgMask : palette.colorFillQuaternary,
    "--rulegroup-background": darkMode ? palette.colorBgSpotlight : palette.colorBgLayout,
    "--rulegroupext-background": darkMode ? palette.colorBgSpotlight : palette.colorBgLayout,
    "--switch-background": darkMode ? palette.colorBgMask : palette.colorFillQuaternary,
    "--case-background": darkMode ? palette.colorBgMask : palette.colorFillQuaternary,

    "--rule-border-color": palette.colorBorderSecondary,
    "--group-border-color": palette.colorBorder,
    "--rulegroup-border-color": palette.colorBorder,
    "--rulegroupext-border-color": palette.colorBorder,
    "--switch-border-color": palette.colorBorderSecondary,
    "--case-border-color": palette.colorBorder,

    "--treeline-color": darkMode ? palette.colorPrimaryHover : palette.colorPrimaryHover,
    "--treeline-switch-color": darkMode ? palette.colorInfo : palette.colorInfo,
    "--treeline-disabled-color": palette.colorFillSecondary,

    "--main-text-color": palette.colorText,
    "--main-font-family": palette.fontFamily,
    "--main-font-size": palette.fontSize + "px",
    "--item-radius": sizedBorderRadius + "px",
    "--conjunctions-radius": sizedBorderRadius + "px",

    "--rule-border-left-hover": "2px",
    "--group-border-left-hover": "2px",
    "--rulegroup-border-left-hover": "2px",
    "--rulegroupext-border-left-hover": "2px",
  } as Record<string, string>;
};

export {
  buildPalette,
  themeToCssVars,
};
