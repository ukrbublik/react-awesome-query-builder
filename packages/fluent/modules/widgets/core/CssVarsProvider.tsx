import React from "react";
import { Config } from "@react-awesome-query-builder/ui";
import { useTheme } from "@fluentui/react";
import { generateCssVars as defaultGenerateCssVars } from "../../utils/theming";

interface CssVarsProviderProps {
  config: Config;
  children: React.ReactNode;
}

const CssVarsProvider: React.FC<CssVarsProviderProps> = ({ children, config }) => {
  const ref = React.createRef<HTMLDivElement>();
  const themeMode = config.settings.themeMode ?? "light";
  const compactMode = !!config.settings.compactMode;

  const theme = useTheme();

  React.useEffect(() => {
    const cssVarsTarget = ref.current;
    const generateCssVars = config.settings.designSettings?.generateCssVars?.fluent ?? defaultGenerateCssVars;
    const cssVars = generateCssVars.call(config.ctx, theme, config) as Record<string, string>;
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
  }, [themeMode, ref, theme, config]);

  return(<div ref={ref} className={`qb-fluent qb-${themeMode} ${compactMode ? "qb-compact" : ""}`}>{children}</div>);
};

export { CssVarsProvider };
