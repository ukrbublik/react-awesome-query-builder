import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { ConfirmProvider, useConfirm } from "material-ui-confirm";
import React from "react";

// value widgets
import MuiAutocompleteWidget from "./value/MuiAutocomplete";
import MuiBooleanWidget from "./value/MuiBoolean";
import MuiDateWidget from "./value/MuiDate";
import MuiDateTimeWidget from "./value/MuiDateTime";
import MuiMultiSelectWidget from "./value/MuiMultiSelect";
import MuiNumberWidget from "./value/MuiNumber";
import MuiRangeWidget from "./value/MuiRange";
import MuiSelectWidget from "./value/MuiSelect";
import MuiSliderWidget from "./value/MuiSlider";
import MuiTextWidget from "./value/MuiText";
import MuiTextAreaWidget from "./value/MuiTextArea";
import MuiTimeWidget from "./value/MuiTime";

// field select widgets
import MuiFieldAutocomplete from "./core/MuiFieldAutocomplete";
import MuiFieldSelect from "./core/MuiFieldSelect";

// core components
import MuiButton from "./core/MuiButton";
import MuiButtonGroup from "./core/MuiButtonGroup";
import MuiConfirm from "./core/MuiConfirm";
import MuiConjs from "./core/MuiConjs";
import MuiIcon from "./core/MuiIcon";
import MuiSwitch from "./core/MuiSwitch";
import MuiValueSources from "./core/MuiValueSources";

// provider
const MuiProvider = ({config, children}) => {
  const settingsTheme = config.settings.theme || {};
  const settingsLocale = config.settings.locale || {};
  const dayjsLocale = settingsLocale.dayjs;
  const themeConfig = settingsTheme.mui;
  const locale = settingsLocale.mui;
  const theme = createTheme(themeConfig, locale, { 
    palette: {
      // neutral: {
      //   main: "#64748B",
      //   contrastText: "#fff"
      // },
    }
  });
  
  const base = (<div className="mui">{children}</div>);
  const withProviders = (
    <LocalizationProvider adapterLocale={dayjsLocale} dateAdapter={AdapterDayjs}>
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

  MuiIcon,
  MuiButton,
  MuiButtonGroup,
  MuiConjs,
  MuiSwitch,
  MuiValueSources,
  MuiConfirm,
  MuiUseConfirm: useConfirm,

  MuiProvider,
};
