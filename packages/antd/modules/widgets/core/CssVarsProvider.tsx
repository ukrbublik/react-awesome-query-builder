import React from "react";
import { Config } from "@react-awesome-query-builder/ui";
import { theme as antdTheme } from "antd";
import { generateCssVars } from "../../utils/theming";

interface CssVarsProviderProps {
  config: Config;
  children: React.ReactNode;
}

const CssVarsProvider: React.FC<CssVarsProviderProps> = ({ children, config }) => {
  const ref = React.createRef<HTMLDivElement>();
  const themeMode = config.settings.themeMode ?? "light";
  const compactMode = !!config.settings.compactMode;
  const renderSize = config.settings.renderSize;

  const { token, theme } = antdTheme.useToken();

  React.useEffect(() => {
    const cssVarsTarget = ref.current;
    const cssVars = generateCssVars(token, config) as Record<string, string>;
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
  }, [themeMode, renderSize, ref, theme.id, config]);

  return(<div ref={ref} className={`qb-antd qb-${themeMode} ${compactMode ? "qb-compact" : ""}`}>{children}</div>);
};

export { CssVarsProvider };
