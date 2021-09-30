import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ConfirmProvider, useConfirm } from "material-ui-confirm";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import AdapterMoment from "@mui/lab/AdapterMoment"; // TODO: set moment to dayjs


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
  const theme = useTheme ? createTheme(themeConfig, locale) : null;

  const base = (<div className="mui">{children}</div>);
  const withProviders = (
    <LocalizationProvider dateAdapter={AdapterMoment} >
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

  MaterialButton,
  MaterialButtonGroup,
  MaterialConjs,
  MaterialValueSources,
  MaterialConfirm,
  MaterialUseConfirm: useConfirm,

  MaterialProvider,
};
