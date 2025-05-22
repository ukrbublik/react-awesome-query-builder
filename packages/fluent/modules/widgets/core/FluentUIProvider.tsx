import React from "react";

import { ProviderProps, Utils } from "@react-awesome-query-builder/ui";
import { ThemeProvider, useTheme } from "@fluentui/react";
import { buildTheme } from "../../utils/theming";
import { FluentUIConfirmProvider } from "./FluentUIConfirm";
import { CssVarsProvider } from "./CssVarsProvider";

const FluentUIProvider: React.FC<ProviderProps> = ({config, children}) => {
  const existingOuterTheme = useTheme();
  const existingTheme = config.settings.designSettings?.canInheritThemeFromOuterProvider ? existingOuterTheme : undefined;
  const theme = buildTheme(config, existingTheme);

  const withProviders = (
    <FluentUIConfirmProvider>
      <CssVarsProvider config={config}>
        {children}
      </CssVarsProvider>
    </FluentUIConfirmProvider>
  );

  const withTheme = theme ? (
    <ThemeProvider
      theme={theme}
    >{withProviders}</ThemeProvider>
  ) : withProviders;

  return withTheme;
};

export {
  FluentUIProvider,
};