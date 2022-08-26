import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ConfirmProvider, useConfirm } from "material-ui-confirm";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment"; // TODO: set moment to dayjs


// value widgets
import MuiTextWidget from "./value/MuiText";
import MuiTextAreaWidget from "./value/MuiTextArea";
import MuiDateWidget from "./value/MuiDate";
import MuiDateTimeWidget from "./value/MuiDateTime";
import MuiTimeWidget from "./value/MuiTime";
import MuiSelectWidget from "./value/MuiSelect";
import MuiNumberWidget from "./value/MuiNumber";
import MuiSliderWidget from "./value/MuiSlider";
import MuiRangeWidget from "./value/MuiRange";
import MuiBooleanWidget from "./value/MuiBoolean";
import MuiMultiSelectWidget from "./value/MuiMultiSelect";
import MuiAutocompleteWidget from "./value/MuiAutocomplete";

// field select widgets
import MuiFieldSelect from "./core/MuiFieldSelect";
import MuiFieldAutocomplete from "./core/MuiFieldAutocomplete";

// core components
import MuiButton from "./core/MuiButton";
import MuiButtonGroup from "./core/MuiButtonGroup";
import MuiConjs from "./core/MuiConjs";
import MuiSwitch from "./core/MuiSwitch";
import MuiValueSources from "./core/MuiValueSources";
import MuiConfirm from "./core/MuiConfirm";

// provider
const MuiProvider = ({config, children}) => {
  const settingsTheme = config.settings.theme || {};
  const settingsLocale = config.settings.locale || {};
  const themeConfig = settingsTheme.mui;
  const locale = settingsLocale.mui;
  const theme = createTheme(themeConfig, locale, { 
    palette: {
      neutral: {
        main: "#64748B",
        contrastText: "#fff"
      },
    }
  });

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
  MuiTextWidget,
  MuiTextAreaWidget,
  MuiDateWidget,
  MuiDateTimeWidget,
  MuiTimeWidget,
  MuiSelectWidget,
  MuiNumberWidget,
  MuiSliderWidget,
  MuiRangeWidget,
  MuiBooleanWidget,
  MuiMultiSelectWidget,
  MuiAutocompleteWidget,

  MuiFieldSelect,
  MuiFieldAutocomplete,

  MuiButton,
  MuiButtonGroup,
  MuiConjs,
  MuiSwitch,
  MuiValueSources,
  MuiConfirm,
  MuiUseConfirm: useConfirm,

  MuiProvider,
};
