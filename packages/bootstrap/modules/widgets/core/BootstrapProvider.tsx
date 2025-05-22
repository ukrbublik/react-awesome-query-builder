import React from "react";
import { ProviderProps, Utils, Config } from "@react-awesome-query-builder/ui";
import { BootstrapConfirmProvider } from "./BootstrapConfirm";
import { CssVarsProvider } from "./CssVarsProvider";

const BootstrapProvider: React.FC<ProviderProps> = ({config, children}) => {
  const withProviders = (
    <BootstrapConfirmProvider>
      <CssVarsProvider config={config}>
        {children}
      </CssVarsProvider>
    </BootstrapConfirmProvider>
  );
  return withProviders;
};

export {
  BootstrapProvider,
};
