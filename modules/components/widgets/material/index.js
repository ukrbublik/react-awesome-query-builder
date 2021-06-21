import React from "react";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import { ConfirmProvider, useConfirm } from "material-ui-confirm";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";


// value widgets
import MaterialTextWidget from "./value/MaterialText";
import MaterialDateWidget from "./value/MaterialDate";
import MaterialDateTimeWidget from "./value/MaterialDateTime";
import MaterialTimeWidget from "./value/MaterialTime";
import MaterialSelectWidget from "./value/MaterialSelect";
import MaterialNumberWidget from "./value/MaterialNumber";
import MaterialSliderWidget from "./value/MaterialSlider";
import MaterialRangeWidget from "./value/MaterialRange";
import MaterialBooleanWidget from "./value/MaterialBoolean";
import MaterialMultiSelectWidget from "./value/MaterialMultiSelect";

// field select widgets
import MaterialFieldSelect from "./core/MaterialFieldSelect";

// core components
import MaterialButton from "./core/MaterialButton";
import MaterialButtonGroup from "./core/MaterialButtonGroup";
import MaterialConjs from "./core/MaterialConjs";
import MaterialValueSources from "./core/MaterialValueSources";
import MaterialConfirm from "./core/MaterialConfirm";

// provider
const MaterialProvider = ({config, children}) => {
  const settingsTheme = config.settings.theme || {};
  const settingsLocale = config.settings.locale || {};
  const themeConfig = settingsTheme.material;
  const locale = settingsLocale.material;
  const useTheme = themeConfig || locale;
  const theme = useTheme ? createMuiTheme(themeConfig, locale) : null;

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
  MaterialTextWidget,
  MaterialDateWidget,
  MaterialDateTimeWidget,
  MaterialTimeWidget,
  MaterialSelectWidget,
  MaterialNumberWidget,
  MaterialSliderWidget,
  MaterialRangeWidget,
  MaterialBooleanWidget,
  MaterialMultiSelectWidget,

  MaterialFieldSelect,

  MaterialButton,
  MaterialButtonGroup,
  MaterialConjs,
  MaterialValueSources,
  MaterialConfirm,
  MaterialUseConfirm: useConfirm,

  MaterialProvider,
};
