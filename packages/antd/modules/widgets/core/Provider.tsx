import React from "react";
import { ProviderProps } from "@react-awesome-query-builder/ui";
// @ts-ignore antd v4 doesn't have theme
import { ConfigProvider, ConfigProviderProps, theme as antdTheme } from "antd";
import { CssVarsProvider } from "./CssVarsProvider";
import { buildAlgorithms, mergeThemes } from "../../utils/theming";

type Locale = ConfigProviderProps["locale"];
type ThemeConfig = ConfigProviderProps["theme"];

const Provider: React.FC<ProviderProps> = ({ config, children }) => {
  const themeMode = config.settings.themeMode;
  const darkMode = themeMode === "dark";
  const compactMode = !!config.settings.compactMode;
  const themeConfig = config.settings.theme?.antd as ThemeConfig | undefined;
  const localeConfig = config.settings.locale?.antd;
  const canCreateAlgorithms = darkMode || compactMode;
  const canCreateTheme = !!themeConfig || localeConfig || canCreateAlgorithms;

  const { token: existingOuterToken, theme: existingTheme } = antdTheme?.useToken() ?? {}; // antd v4 doesn't have theme
  const existingToken = config.settings.designSettings?.canInheritThemeFromOuterProvider ? existingOuterToken : undefined;

  const { algorithms } = React.useMemo<ReturnType<typeof buildAlgorithms>>(() => {
    return buildAlgorithms(darkMode, compactMode);
  }, [darkMode, compactMode]);

  const customThemeConfig = React.useMemo<ThemeConfig>(() => {
    return canCreateTheme ? mergeThemes(themeMode, existingToken, themeConfig, algorithms) : undefined;
  }, [algorithms, themeConfig, existingTheme?.id, themeMode, canCreateTheme]);

  const withCssVarsProvider = (
    <CssVarsProvider config={config}>
      {children}
    </CssVarsProvider>
  );

  // https://ant.design/components/config-provider
  const withTheme = canCreateTheme ? (
    // @ts-ignore error TS2786: 'ConfigProvider' cannot be used as a JSX component. Its return type 'ReactNode | Promise<ReactNode>' is not a valid JSX element.
    <ConfigProvider
      locale={localeConfig as Locale | undefined}
      // @ts-ignore antd v4 doesn't have theme
      theme={customThemeConfig}
    >{withCssVarsProvider}</ConfigProvider>
  ) : withCssVarsProvider;

  return withTheme;
};

export {
  Provider,
};
