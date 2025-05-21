import React from "react";
import { ProviderProps, Utils } from "@react-awesome-query-builder/ui";
import { ThemeProvider, useTheme, Theme } from "@material-ui/core/styles";
import { ConfirmProvider } from "material-ui-confirm";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import { CssVarsProvider } from "./CssVarsProvider";
import { buildTheme } from "../../utils/theming";


const MaterialProvider: React.FC<ProviderProps> = ({config, children}) => {
  // const momentLocale = config.settings.locale?.moment;
  const existingOuterTheme = useTheme();
  const existingTheme = config.settings.designSettings?.canInheritThemeFromOuterProvider ? existingOuterTheme : undefined;

  const mergedTheme = React.useMemo<Theme | null>(() => {
    return buildTheme(config, existingTheme);
  }, [config, existingTheme]);

  const withProviders = (
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <ConfirmProvider>
        <CssVarsProvider config={config}>
          {children}
        </CssVarsProvider>
      </ConfirmProvider>
    </MuiPickersUtilsProvider>
  );

  const withTheme = mergedTheme ? (
    <ThemeProvider theme={mergedTheme}>
      {withProviders}
    </ThemeProvider>
  ) : withProviders;

  return withTheme;
};

export {
  MaterialProvider,
};
