import React from "react";
import { ProviderProps } from "@react-awesome-query-builder/ui";
import { ConfigProvider, ConfigProviderProps } from "antd";
import { themeToCssVars, buildPalette } from "../../utils/theming";

type Locale = ConfigProviderProps["locale"];
type Theme = ConfigProviderProps["theme"];

const Provider: React.FC<ProviderProps> = ({ config, children }) => {
  const ref = React.createRef<HTMLDivElement>();
  const darkMode = config.settings.themeMode === "dark";
  const compactMode = !!config.settings.compactMode;
  const themeConfig = config.settings.theme?.antd;
  const localeConfig = config.settings.locale?.antd;
  const canCreateTheme = !!themeConfig || localeConfig || darkMode || compactMode;

  const { algorithms, palette } = React.useMemo<ReturnType<typeof buildPalette>>(() => {
    return buildPalette(darkMode, compactMode);
  }, [darkMode, compactMode]);

  const customTheme = React.useMemo<Theme>(() => {
    return {
      // https://ant.design/docs/react/customize-theme
      // todo: allow overrides
      algorithm: algorithms
    };
  }, [algorithms]);

  React.useEffect(() => {
    const cssVarsTarget = ref.current;
    const cssVars = themeToCssVars(palette, darkMode);
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
  }, [darkMode, palette, ref]);

  const base = (<div ref={ref} className={`qb-antd ${compactMode ? "qb-compact" : ""}`}>{children}</div>);

  // https://ant.design/components/config-provider
  const withTheme = canCreateTheme ? (
    // @ts-ignore error TS2786: 'ConfigProvider' cannot be used as a JSX component. Its return type 'ReactNode | Promise<ReactNode>' is not a valid JSX element.
    <ConfigProvider
      locale={localeConfig as Locale | undefined}
      theme={customTheme}
    >{base}</ConfigProvider>
  ) : base;

  return withTheme;
};

export {
  Provider,
};
