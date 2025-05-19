import React from "react";
import { ProviderProps } from "@react-awesome-query-builder/ui";
import { ConfigProvider, ConfigProviderProps, theme as antdTheme } from "antd";
import { generateDesignTokens, buildPalette } from "../../utils/theming";

type Locale = ConfigProviderProps["locale"];
type ThemeConfig = ConfigProviderProps["theme"];
type Theme = ReturnType<typeof antdTheme.useToken>["theme"];

const Provider: React.FC<ProviderProps> = ({ config, children }) => {
  const ref = React.createRef<HTMLDivElement>();
  const darkMode = config.settings.themeMode === "dark";
  const compactMode = !!config.settings.compactMode;
  const renderSize = config.settings.renderSize;
  const themeConfig = config.settings.theme?.antd;
  const localeConfig = config.settings.locale?.antd;
  const canCreateTheme = !!themeConfig || localeConfig || darkMode || compactMode;

  const { algorithms, palette } = React.useMemo<ReturnType<typeof buildPalette>>(() => {
    return buildPalette(darkMode, compactMode);
  }, [darkMode, compactMode]);

  const customThemeConfig = React.useMemo<ThemeConfig>(() => {
    return {
      // https://ant.design/docs/react/customize-theme
      algorithm: algorithms,
      token: {
        //todo: allow overrides
      }
    };
  }, [algorithms]);

  const UpdCssVars = () => {
    const { token, theme } = antdTheme.useToken();

    React.useEffect(() => {
      const cssVarsTarget = ref.current;
      const cssVars = generateDesignTokens(token, config);
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
    }, [palette, darkMode, renderSize, ref, theme.id]);
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
