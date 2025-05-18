import React from "react";
import { ProviderProps, Utils, Config } from "@react-awesome-query-builder/ui";
import { themeToCssVars } from "../../utils/theming";

const BootstrapProvider: React.FC<ProviderProps> = ({config, children}) => {
  const ref = React.createRef<HTMLDivElement>();
  const themeMode = config.settings.themeMode ?? "light";
  const darkMode = themeMode === "dark";
  const compactMode = config.settings.compactMode;

  React.useEffect(() => {
    const cssVarsTarget = ref.current;
    const cssVars = themeToCssVars(darkMode);
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
  }, [darkMode, ref]);

  const base = (<div ref={ref} className={`qb-bootstrap ${compactMode ? "qb-compact" : ""} qb-${themeMode}`}>{children}</div>);
  return base;
};

export {
  BootstrapProvider,
};
