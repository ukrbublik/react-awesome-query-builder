import React from "react";
import { ProviderProps, Utils, Config } from "@react-awesome-query-builder/ui";
import { ThemeProvider, useTheme, Theme } from "@mui/material/styles";
import { ConfirmProvider } from "material-ui-confirm";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment"; // TODO: set moment to dayjs
import { CssVarsProvider } from "./CssVarsProvider";
import { buildTheme } from "../../utils/theming";

const MuiProvider: React.FC<ProviderProps> = ({config, children}) => {
  const momentLocale = config.settings.locale?.moment;
  const existingOuterTheme = useTheme();
  const existingTheme = config.settings.designSettings?.canInheritThemeFromOuterProvider ? existingOuterTheme : undefined;

  const mergedTheme = React.useMemo<Theme | null>(() => {
    return buildTheme(config, existingTheme);
  }, [config, existingTheme]);

  // tip: `locale` prop was renamed to `adapterLocale` in v5 and removed in v6
  const locProviderProps = momentLocale ? {
    adapterLocale: momentLocale,
  } : {};

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
