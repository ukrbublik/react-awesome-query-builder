import React from "react";

import { ProviderProps, Utils } from "@react-awesome-query-builder/ui";
import { generateCssVars, buildTheme } from "../../utils/theming";
import { FluentUIConfirmProvider } from "./FluentUIConfirm";
import { ThemeProvider, useTheme } from "@fluentui/react";

const FluentUIProvider: React.FC<ProviderProps> = ({config, children}) => {
  const ref = React.createRef<HTMLDivElement>();

  const themeMode = config.settings.themeMode ?? "light";
  const darkMode = themeMode === "dark";
  const compactMode = config.settings.compactMode;

  const existingOuterTheme = useTheme();
  const existingTheme = config.settings.designSettings?.detectThemeLibrary ? existingOuterTheme : undefined;
  const theme = buildTheme(config, existingTheme);

  const UpdCssVars = () => {
    const theme = useTheme();
    React.useEffect(() => {
      const cssVarsTarget = ref.current;
      const cssVars = generateCssVars(theme, config);
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
    }, [theme, darkMode, config]);
    return <div style={{display: "none"}} />;
  };

  const base = (<div ref={ref} className={`qb-fluent ${compactMode ? "qb-compact" : ""} qb-${themeMode}`}><UpdCssVars />{children}</div>);

  const withProviders = (
    <FluentUIConfirmProvider>
      {base}
    </FluentUIConfirmProvider>
  );

  const withTheme = theme ? (
    <ThemeProvider
      theme={theme}
    >{withProviders}</ThemeProvider>
  ) : withProviders;

  return withTheme;
};

export {
  FluentUIProvider,
};