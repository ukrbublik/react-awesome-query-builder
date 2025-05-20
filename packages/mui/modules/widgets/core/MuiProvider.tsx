import React from "react";
import { ProviderProps, Utils } from "@react-awesome-query-builder/ui";
import { ThemeProvider, useTheme, extendTheme, Theme } from "@mui/material/styles";
import { ConfirmProvider } from "material-ui-confirm";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment"; // TODO: set moment to dayjs
import xdpPackage from "@mui/x-date-pickers/package.json"; // to determine version
import { generateCssVars, buildTheme } from "../../utils/theming";

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const xdpVersion = parseInt((xdpPackage.version as string)?.split(".")?.[0] ?? "0");


const MuiProvider: React.FC<ProviderProps> = ({config, children}) => {
  const ref = React.createRef<HTMLDivElement>();
  const themeMode = config.settings.themeMode ?? "light";
  const compactMode = config.settings.compactMode;
  const momentLocale = config.settings.locale?.moment;

  const existingOuterTheme = useTheme();
  const existingTheme = config.settings.designSettings?.canInheritThemeFromOuterProvider ? existingOuterTheme : undefined;

  const mergedTheme = React.useMemo<Theme | null>(() => {
    return buildTheme(config, existingTheme);
  }, [config, existingTheme]);

  const locProviderProps = momentLocale ? (xdpVersion >= 6 ? {
    locale: momentLocale,
  } : {
    adapterLocale: momentLocale,
  }) : {};

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
    }, [theme, config]);
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

  const withTheme = mergedTheme ? (
    <ThemeProvider theme={mergedTheme}>
      {withProviders}
    </ThemeProvider>
  ) : withProviders;

  return withTheme;
};

export {
  MuiProvider,
};
