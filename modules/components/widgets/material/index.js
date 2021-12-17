import React from "react";
import { ThemeProvider, createTheme } from "@material-ui/core/styles";
import { ConfirmProvider, useConfirm } from "material-ui-confirm";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";


// value widgets
import MaterialTextWidget from "./value/MaterialText";
import MaterialTextAreaWidget from "./value/MaterialTextArea";
import MaterialDateWidget from "./value/MaterialDate";
import MaterialDateTimeWidget from "./value/MaterialDateTime";
import MaterialTimeWidget from "./value/MaterialTime";
import MaterialSelectWidget from "./value/MaterialSelect";
import MaterialNumberWidget from "./value/MaterialNumber";
import MaterialSliderWidget from "./value/MaterialSlider";
import MaterialRangeWidget from "./value/MaterialRange";
import MaterialBooleanWidget from "./value/MaterialBoolean";
import MaterialMultiSelectWidget from "./value/MaterialMultiSelect";
import MaterialAutocompleteWidget from "./value/MaterialAutocomplete";

// field select widgets
import MaterialFieldSelect from "./core/MaterialFieldSelect";
import MaterialFieldAutocomplete from "./core/MaterialFieldAutocomplete";

// core components
import MaterialButton from "./core/MaterialButton";
import MaterialButtonGroup from "./core/MaterialButtonGroup";
import MaterialConjs from "./core/MaterialConjs";
import MaterialSwitch from "./core/MaterialSwitch";
import MaterialValueSources from "./core/MaterialValueSources";
import MaterialConfirm from "./core/MaterialConfirm";

// provider
const MaterialProvider = ({config, children}) => {
  const settingsTheme = config.settings.theme || {};
  const settingsLocale = config.settings.locale || {};
  const themeConfig = settingsTheme.material;
  const locale = settingsLocale.material;
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
  MaterialTextWidget,
  MaterialTextAreaWidget,
  MaterialDateWidget,
  MaterialDateTimeWidget,
  MaterialTimeWidget,
  MaterialSelectWidget,
  MaterialNumberWidget,
  MaterialSliderWidget,
  MaterialRangeWidget,
  MaterialBooleanWidget,
  MaterialMultiSelectWidget,
  MaterialAutocompleteWidget,

  MaterialFieldSelect,
  MaterialFieldAutocomplete,

  MaterialButton,
  MaterialButtonGroup,
  MaterialConjs,
  MaterialSwitch,
  MaterialValueSources,
  MaterialConfirm,
  MaterialUseConfirm: useConfirm,

  MaterialProvider,
};
