import React from "react";
import { ProviderProps, Utils, Config } from "@react-awesome-query-builder/ui";
import { ThemeProvider, useTheme, extendTheme, Theme } from "@mui/material/styles";
import { ConfirmProvider } from "material-ui-confirm";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment"; // TODO: set moment to dayjs
import xdpPackage from "@mui/x-date-pickers/package.json"; // to determine version
import { CssVarsProvider } from "./CssVarsProvider";
import { buildTheme } from "../../utils/theming";

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const xdpVersion = parseInt((xdpPackage.version as string)?.split(".")?.[0] ?? "0");


const MuiProvider: React.FC<ProviderProps> = ({config, children}) => {
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

  const withProviders = (
    <LocalizationProvider dateAdapter={AdapterMoment} {...locProviderProps} >
      <ConfirmProvider>
        <CssVarsProvider config={config}>
          {children}
        </CssVarsProvider>
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
