import React from "react";

import { ProviderProps, Utils } from "@react-awesome-query-builder/ui";
import { themeToCssVars, buildTheme } from "../../utils/theming";
import { ThemeProvider, useTheme } from "@fluentui/react";

const FluentUIProvider: React.FC<ProviderProps> = ({config, children}) => {
  const ref = React.createRef<HTMLDivElement>();

  const themeMode = config.settings.themeMode ?? "light";
  const darkMode = themeMode === "dark";
  const compactMode = config.settings.compactMode;
  const theme = buildTheme(config);

  const UpdCssVars = () => {
    const theme = useTheme();
    React.useEffect(() => {
      const cssVarsTarget = ref.current;
      const cssVars = themeToCssVars(theme, darkMode);
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
    }, [theme, darkMode]);
    return <div style={{display: "none"}} />;
  };

  const base = (<div ref={ref} className={`qb-fluent ${compactMode ? "qb-compact" : ""} qb-${themeMode}`}><UpdCssVars />{children}</div>);

  const withTheme = theme ? (
    <ThemeProvider
      theme={theme}
    >{base}</ThemeProvider>
  ) : base;

  return withTheme;
};

export {
  FluentUIProvider,
};