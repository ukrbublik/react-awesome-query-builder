import React from "react";
import { ProviderProps } from "@react-awesome-query-builder/ui";
import { ConfigProvider, ConfigProviderProps, theme as antdTheme } from "antd";
import { generateCssVars, buildAlgorithms, mergeThemes } from "../../utils/theming";

type Locale = ConfigProviderProps["locale"];
type ThemeConfig = ConfigProviderProps["theme"];
type Theme = ReturnType<typeof antdTheme.useToken>["theme"];

const Provider: React.FC<ProviderProps> = ({ config, children }) => {
  const ref = React.createRef<HTMLDivElement>();
  const themeMode = config.settings.themeMode;
  const darkMode = themeMode === "dark";
  const compactMode = !!config.settings.compactMode;
  const renderSize = config.settings.renderSize;
  const themeConfig = config.settings.theme?.antd as ThemeConfig | undefined;
  const localeConfig = config.settings.locale?.antd;
  const canCreateTheme = !!themeConfig || localeConfig || darkMode || compactMode;

  const { token: existingOuterToken, theme: existingTheme } = antdTheme.useToken();
  const existingToken = config.settings.designSettings?.canInheritThemeFromOuterProvider ? existingOuterToken : undefined;

  const { algorithms } = React.useMemo<ReturnType<typeof buildAlgorithms>>(() => {
    return buildAlgorithms(darkMode, compactMode);
  }, [darkMode, compactMode]);

  const customThemeConfig = React.useMemo<ThemeConfig>(() => {
    return mergeThemes(themeMode, existingTheme, existingToken, themeConfig, algorithms);
  }, [algorithms, themeConfig, existingTheme.id, themeMode]);

  const UpdCssVars = () => {
    const { token, theme } = antdTheme.useToken();

    React.useEffect(() => {
      const cssVarsTarget = ref.current;
      const cssVars = generateCssVars(token, config);
      for (const k in cssVars) {
        if (cssVars[k] != undefined) {
          cssVarsTarget?.style.setProperty(k, cssVars[k]);
        }
      }
      return () => {
        for (const k in cssVars) {
          cssVarsTarget?.style.removeProperty(k);
        }
      };
    }, [darkMode, renderSize, ref, theme.id, config]);
    return <div style={{display: "none"}} />;
  };

  const base = (<div ref={ref} className={`qb-antd ${compactMode ? "qb-compact" : ""}`}><UpdCssVars />{children}</div>);

  // https://ant.design/components/config-provider
  const withTheme = canCreateTheme ? (
    // @ts-ignore error TS2786: 'ConfigProvider' cannot be used as a JSX component. Its return type 'ReactNode | Promise<ReactNode>' is not a valid JSX element.
    <ConfigProvider
      locale={localeConfig as Locale | undefined}
      theme={customThemeConfig}
    >{base}</ConfigProvider>
  ) : base;

  return withTheme;
};

export {
  Provider,
};
