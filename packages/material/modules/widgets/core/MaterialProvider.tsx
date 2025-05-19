import React from "react";
import { ProviderProps, Utils } from "@react-awesome-query-builder/ui";
import { ThemeProvider, createTheme, useTheme } from "@material-ui/core/styles";
import { ConfirmProvider } from "material-ui-confirm";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { generateDesignTokens, buildTheme } from "../../utils/theming";


const MaterialProvider: React.FC<ProviderProps> = ({config, children}) => {
  const ref = React.createRef<HTMLDivElement>();

  const themeMode = config.settings.themeMode ?? "light";
  const compactMode = config.settings.compactMode;
  // const momentLocale = config.settings.locale?.moment;
  const theme = buildTheme(config);

  const UpdCssVars = () => {
    const theme = useTheme();
    React.useEffect(() => {
      const cssVarsTarget = ref.current;
      const cssVars = generateDesignTokens(theme, config);
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
    }, [theme]);
    return <div style={{display: "none"}} />;
  };

  const base = (<div ref={ref} className={`qb-material qb-${themeMode} ${compactMode ? "qb-compact" : ""}`}><UpdCssVars />{children}</div>);

  const withProviders = (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <ConfirmProvider>
        {base}
      </ConfirmProvider>
    </MuiPickersUtilsProvider>
  );

  const withTheme = theme ? (
    <ThemeProvider theme={theme}>
      {withProviders}
    </ThemeProvider>
  ) : withProviders;

  return withTheme;
};

export {
  MaterialProvider,
};
