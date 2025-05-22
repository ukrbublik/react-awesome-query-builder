import React from "react";
import { Config } from "@react-awesome-query-builder/ui";
import { generateCssVars as defaultGenerateCssVars } from "../../utils/theming";

interface CssVarsProviderProps {
  config: Config;
  children: React.ReactNode;
}

const CssVarsProvider: React.FC<CssVarsProviderProps> = ({ children, config }) => {
  const ref = React.createRef<HTMLDivElement>();
  const themeMode = config.settings.themeMode ?? "light";
  const compactMode = !!config.settings.compactMode;

  React.useEffect(() => {
    const cssVarsTarget = ref.current;
    const generateCssVars = config.settings.designSettings?.generateCssVars?.bootstrap ?? defaultGenerateCssVars;
    const cssVars = generateCssVars.call(config.ctx, {}, config) as Record<string, string>;
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
  }, [themeMode, config, ref]);

  return(<div ref={ref} className={`qb-bootstrap qb-${themeMode} ${compactMode ? "qb-compact" : ""}`}>{children}</div>);
};

export { CssVarsProvider };
