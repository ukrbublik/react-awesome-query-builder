import React from "react";
import { ProviderProps, Utils } from "@react-awesome-query-builder/ui";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import { ConfirmProvider } from "material-ui-confirm";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment"; // TODO: set moment to dayjs
import xdpPackage from "@mui/x-date-pickers/package.json"; // to determine version
import { themeToCssVars, buildTheme } from "../../utils/theming";

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const xdpVersion = parseInt((xdpPackage.version as string)?.split(".")?.[0] ?? "0");


const MuiProvider: React.FC<ProviderProps> = ({config, children}) => {
  const ref = React.createRef<HTMLDivElement>();
  const themeMode = config.settings.themeMode ?? "light";
  const compactMode = config.settings.compactMode;
  const momentLocale = config.settings.locale?.moment;
  const theme = buildTheme(config);

  const locProviderProps = xdpVersion >= 6 ? {
    locale: momentLocale,
  } : {
    adapterLocale: momentLocale,
  };

  const UpdCssVars = () => {
    const theme = useTheme();
    React.useEffect(() => {
      const cssVarsTarget = ref.current;
      const cssVars = themeToCssVars(theme, config);
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

  const base = (<div ref={ref} className={`qb-mui qb-${themeMode} ${compactMode ? "qb-compact" : ""}`}><UpdCssVars />{children}</div>);
  
  const withProviders = (
    <LocalizationProvider dateAdapter={AdapterMoment} {...locProviderProps} >
      <ConfirmProvider>
        {base}
      </ConfirmProvider>
    </LocalizationProvider>
  );

  const withTheme = theme ? (
    <ThemeProvider theme={theme}>
      {withProviders}
    </ThemeProvider>
  ) : withProviders;

  return withTheme;
};

export {
  MuiProvider,
};
