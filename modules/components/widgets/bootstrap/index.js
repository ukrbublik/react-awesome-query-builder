import React from "react";
import { ThemeProvider, createTheme } from "@material-ui/core/styles";
import { ConfirmProvider, useConfirm } from "material-ui-confirm";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";


// value widgets
import BootstrapTextWidget from "./value/BootstrapText";
import BootstrapTextAreaWidget from "./value/BootstrapTextArea";
import BootstrapDateWidget from "./value/BootstrapDate";
import BootstrapDateTimeWidget from "./value/BootstrapDateTime";
import BootstrapTimeWidget from "./value/BootstrapTime";
import BootstrapSelectWidget from "./value/BootstrapSelect";
import BootstrapNumberWidget from "./value/BootstrapNumber";
import BootstrapSliderWidget from "./value/BootstrapSlider";
import BootstrapBooleanWidget from "./value/BootstrapBoolean";
import BootstrapMultiSelectWidget from "./value/BootstrapMultiSelect";

// field select widgets
import BootstrapFieldSelect from "./core/BootstrapFieldSelect";

// core components
import BootstrapButton from "./core/BootstrapButton";
import BootstrapButtonGroup from "./core/BootstrapButtonGroup";
import BootstrapConjs from "./core/BootstrapConjs";
import BootstrapValueSources from "./core/BootstrapValueSources";
import BootstrapConfirm from "./core/BootstrapConfirm";

// provider
const BootstrapProvider = ({config, children}) => {
  const settingsTheme = config.settings.theme || {};
  const settingsLocale = config.settings.locale || {};
  const themeConfig = settingsTheme.material;
  const locale = settingsLocale.material; //WIP: locale for bootstrap
  const useTheme = themeConfig || locale;
  const theme = useTheme ? createTheme(themeConfig, locale) : null;

  const base = (<div className="mui">{children}</div>);
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


export default {
  BootstrapTextWidget,
  BootstrapTextAreaWidget,
  BootstrapDateWidget,
  BootstrapDateTimeWidget,
  BootstrapTimeWidget,
  BootstrapSelectWidget,
  BootstrapNumberWidget,
  BootstrapSliderWidget,
  BootstrapBooleanWidget,
  BootstrapMultiSelectWidget,

  BootstrapFieldSelect,

  BootstrapButton,
  BootstrapButtonGroup,
  BootstrapConjs,
  BootstrapValueSources,
  BootstrapConfirm,
  MaterialUseConfirm: useConfirm,

  BootstrapProvider,
};
